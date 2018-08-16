let axios = require('axios')
var Web3 = require('web3');
let {
  scheduleJob
} = require('node-schedule');
let _ = require('lodash');
let {
  waterfall,
  eachLimit
} = require('async');
let {
  updateSwix
} = require('../server/dbos/swixer.dbo')
let coins = require('../config/coins')
let {
  pivxChain
} = require('../config/vars')
let {
  updateBalances
} = require('../server/dbos/account.dbo')

let SwixerModel = require('../server/models/swixer.model');

var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/aiAxnxbpJ4aG0zed1aMy'));

// to check txn receipt of a status
const getTxReceipt = (txHash, coinType, cb) => {
  if (coinType === 'ETH') {
    // fetching the txn receipt from ETHEREUM network
    web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) cb(error, null)
      else cb(null, receipt)
    })
  } else if (coinType === 'BTC') {
    let pivxChainTxUrl = `${pivxChain}${txHash}`
    try {
      // fetching the txn from pivx chain
      axios.get(pivxChainTxUrl)
        .then((receipt) => {
          receipt = receipt.data
          if (receipt !== 'unknown') {
            receipt.status = 1
            cb(null, receipt)
          } else {
            cb(null, null)
          }
        })
    } catch (error) {
      cb({
        message: 'Exception in getting tx receipt',
        error
      }, null)
    }
  } else {
    cb({
      message: 'CoinType is neither ETH nor BTC',
      error
    }, null)
  }
}

const checkTxStatus = (tx, coinType, cb) => {
  let txReceipt = null;
  let txHash = tx.txHash;
  waterfall([
    (next) => {
      //fetching txn receipt of a single txn
      getTxReceipt(txHash, coinType, (error, _txReceipt) => {
        if (error) {
          next({
            message: 'Error in fetching tx receipt',
            error
          }, null)
        } else {
          txReceipt = _txReceipt
          next()
        }
      })
    }, (next) => {
      //checkong whether txn found in network or not
      if (txReceipt) {
        let status = parseInt(txReceipt['status'])
        if (status === 1) {
          next(null, {
            status: 'success',
            failedAmount: 0
          })
        } else {
          next(null, {
            status: 'failed',
            failedAmount: tx.value
          })
        }
      } else {
        next(null, {
          status: 'failed',
          failedAmount: tx.value
        })
      }
    }
  ], (error, resp) => {
    if (error) cb(error, null)
    else cb(null, resp)
  })
}

const checkTxsStatus = (swix, cb) => {
  let txInfos = swix.txInfos // array of txns
  let symbol = swix.toSymbol
  let failedAmount = 0;

  eachLimit(txInfos, 1, (tx, iterate) => {
    waterfall([
      (next) => {
        // checking whether a single txn is success or not
        checkTxStatus(tx, coins[symbol].type, (error, txReport) => {
          if (error) {
            next({
              message: 'Error in check tx status',
              error
            }, null)
          }
          if (txReport.status === 'success') {
            next(null, {
              status: 1
            })
          } else {
            failedAmount += txReport.failedAmount // summing all failed txns amount
            next(null, {
              status: -1
            })
          }
        })
      }, (txStatus, next) => {
        let queryObject = {
          'swixHash': swix.swixHash,
          'txInfos.txHash': tx.txHash
        }
        let updateObject = {
          'txInfos.$.status': txStatus.status
        }
        // updating single txn status from txInfos array
        updateSwix(queryObject, updateObject, (error, resp) => {
          if (error) {
            next({
              message: 'Error at updating swix single txn status',
              error
            }, null)
          } else {
            let balance = swix.receivedValue;
            let keyAvailable = `availableBalances.${swix.fromSymbol}`
            let keyLocked = `lockedBalances.${swix.fromSymbol}`
            let findData = {
              toAddress: swix.toAddress
            }
            let updateData = {}
            updateData[keyAvailable] = balance
            updateData[keyLocked] = -balance
            //updating balances of account locked to available
            updateBalances(findData, updateData, (error, resp) => {
              if (error) next({
                message: 'Error in update balances',
                error
              }, null)
              else next(null)
            })
          }
        })
      }
    ], (error, resp) => {
      if (error)
        console.log('Error in check txns status job', error)
      iterate()
    })
  }, () => {
    cb(null, failedAmount)
  })
}

const outTransactionsStatus = (list, cb) => {

  eachLimit(list, 1, (swix, iterate) => { //iterating the loop for each object. takes only one object at a time executes next object after completion of next
    let failedAmount = 0; // failed amount of swix txn

    waterfall([
      (next) => {
        checkTxsStatus(swix, (error, _failedAmount) => { // checking the out txns are success or not
          if (error) next({
            message: 'Error at check transaction status method',
            error
          }, null)
          else {
            failedAmount = _failedAmount
            next()
          }
        })
      }, (next) => {
        let queryObject = {
          swixHash: swix.swixHash
        }
        if (failedAmount > 0) {
          if (swix.tries >= 10) {
            swix.tries -= 1
          }
          let updateObject = {
            isScheduled: false,
            tries: swix.tries,
            remainingAmount: failedAmount
          }
          next(null, queryObject, updateObject)
        } else {
          let updateObject = {
            outputStatus: 'success'
          }
          next(null, queryObject, updateObject)
        }
      }, (queryObject, updateObject, next) => {
        // updating the swix txn. if failed amount 0 then out txns are success else reschedule txns which are failed
        updateSwix(queryObject, updateObject, (error, resp) => {
          if (error) {
            next({
              message: 'Error in updateSwix',
              error
            })
          }
          next()
        })
      }
    ], (error, resp) => {
      if (error)
        console.log('Error in out transactions check job', error)
      iterate();
    })
  }, () => {
    cb();
  })
}

const outTransactionsStatusJob = () => {
  scheduleJob('*/2 * * * * *', () => {
    let time = Date.now() - 10 * 60 * 1000; // substracting 10 minutes of time from current timestamp

    let projectObject = {
      outputStatus: 1,
      status: 1,
      txInfos: {
        '$filter': {
          input: "$txInfos",
          as: "txInfo",
          cond: {
            '$eq': ["$$txInfo.status", 0]
          }
        }
      },
      remainingAmount: 1,
      lastUpdateOn: 1,
      swixHash: 1,
      fromSymbol: 1,
      toSymbol: 1,
      toAddress: 1,
      tries: 1,
      receivedValue: 1
    }

    let matchObject = {
      $and: [{
        txInfos: {
          '$ne': null
        }
      }, {
        txInfos: {
          '$ne': []
        }
      }, {
        remainingAmount: 0
      }, {
        lastUpdateOn: {
          '$lt': new Date(time)
        }
      }]
    }
    SwixerModel.aggregate([{ // finding the reverse txns completed 10 mins ago
      $project: projectObject
    }, {
      $match: matchObject
    }], (error, result) => {
      if (error) {
        console.log('Error in output transactions check job', error)
      } else if (result.length > 0) {
        outTransactionsStatus(result, () => {}) //out txns checking method
      }
    })
  })
}

module.exports = {
  outTransactionsStatusJob
}