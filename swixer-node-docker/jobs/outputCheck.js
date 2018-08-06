let {
  scheduleJob
} = require('node-schedule');
let _ = require('lodash');
let {
  waterfall,
  eachLimit
} = require('async');
var Web3 = require('web3');
let {
  updateSwix
} = require('../server/dbos/swixer.dbo')
let coins = require('../config/coins')
let {
  pivxChain
} = require('../config/vars')
let axios = require('axios')

let SwixerModel = require('../server/models/swixer.model');

var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/aiAxnxbpJ4aG0zed1aMy'));

const getTxReceipt = (txHash, coinType, cb) => {
  if (coinType === 'ETH') {
    web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
      console.log('error', error, receipt)
      if (error) cb(error, null)
      else cb(null, receipt)
    })
  } else if (coinType === 'BTC') {
    let pivxChainTxUrl = `${pivxChain}${txHash}`
    try {
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
      cb({}, null)
    }
  } else {
    cb({}, null)
  }
}

const checkTxStatus = (tx, coinType, cb) => {
  let txReceipt = null;
  let txHash = tx.txHash;
  waterfall([
    (next) => {
      getTxReceipt(txHash, coinType, (error, _txReceipt) => {
        if (error) {
          next(error, null)
        } else {
          txReceipt = _txReceipt
          next()
        }
      })
    }, (next) => {
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
  let txInfos = swix.txInfos
  let symbol = swix.toSymbol
  let failedAmount = 0;

  eachLimit(txInfos, 1, (tx, iterate) => {
    waterfall([
      (next) => {
        checkTxStatus(tx, coins[symbol].type, (error, txReport) => {
          if (error) {
            next({}, null)
          }
          if (txReport.status === 'success') {
            next(null, {
              status: 1
            })
          } else {
            failedAmount += txReport.failedAmount
            next(null, {
              status: -1
            })
          }
        })
      }, (txStatus, next) => {
        updateSwix({
          'swixHash': swix.swixHash,
          'txInfos.txHash': tx.txHash
        }, {
          'txInfos.$.status': txStatus.status
        }, (error, resp) => {
          if (error) next({}, null)
          else next(null)
        })
      }
    ], (error, resp) => {
      iterate()
    })
  }, () => {
    cb(null, failedAmount)
  })
}

const outputJob = (list, cb) => {

  eachLimit(list, 1, (swix, iterate) => {
    let failedAmount = 0;
    let txs = swix.txInfos;
    swix = swix.toObject();

    waterfall([
      (next) => {
        let result = _.filter(txs, (obj) => {
          return obj.status === 0
        })
        swix.txInfos = result;
        next()
      }, (next) => {
        checkTxsStatus(swix, (error, _failedAmount) => {
          if (error) next({}, null)
          else {
            failedAmount = _failedAmount
            next()
          }
        })
      }, (next) => {
        if (failedAmount > 0) {
          if (swix.tries >= 10) {
            swix.tries -= 1
          }
          updateSwix({
            swixHash: swix.swixHash
          }, {
            isScheduled: false,
            tries: swix.tries,
            remainingAmount: failedAmount
          }, (error, resp) => {
            if (error) next({}, null)
            else next()
          })
        } else {
          updateSwix({
            swixHash: swix.swixHash
          }, {
            outputStatus: 'success'
          }, (error, resp) => {
            if (error) next({}, null)
            else next()
          })
        }
      }
    ], (err, resp) => {
      iterate();
    })
  }, () => {
    cb();
  })
}

const output = () => {
  scheduleJob('*/5 * * * * *', () => {
    let time = Date.now()
    time -= 10 * 60 * 1000

    SwixerModel.find({
      'outputStatus': 'pending',
      'status': 'sent',
      'txInfos': {
        $elemMatch: {
          status: 0
        }
      },
      'remainingAmount': {
        $eq: 0
      },
      'lastUpdateOn': {
        $lt: new Date(time)
      }
    }, {
      '_id': 0
    }, (error, result) => {
      outputJob(result, () => {
        console.log('outputCheck job')
      })
    });
  })
}

module.exports = {
  output
}