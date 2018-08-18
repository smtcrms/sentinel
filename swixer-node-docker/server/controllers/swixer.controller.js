let async = require('async');
let swixerDbo = require('../dbos/swixer.dbo');
let {
  getTxReceipt,
  getDetailsFromTx,
  getTxn
} = require('../helpers/account.helper')

let getStatus = (req, res) => {
  let swixHash = req.query.swixHash;
  async.waterfall([
    (next) => {
      swixerDbo.getSwix(swixHash, (error, result) => {
        if (error) next({
          status: 500,
          message: 'Error occurred while getting swix.'
        }, null);
        else if (result) {
          if (result.message === 'Scheduled successfully.' || result.message === 'Swix is complete.' || result.message === 'Swix is in progress.') next(null, {
            status: 200,
            swixStatus: 1,
            fromToken: result.fromSymbol,
            toToken: result.toSymbol,
            destAddr: result.destinationAddress,
            txInfos: result.txInfos,
            remainingAmount: 'remainingAmount' in result ? result.remainingAmount : null
          });
          else next(null, {
            status: 200,
            swixStatus: 0,
            txInfos: [],
            fromToken: result.fromSymbol,
            toToken: result.toSymbol,
            destAddr: result.destinationAddress,
            remainingAmount: 'remainingAmount' in result ? result.remainingAmount : null
          });
        } else next({
          status: 400,
          message: 'No swix found.'
        }, null);
      });
    }
  ], (error, success) => {
    let response = Object.assign({
      success: !error
    }, error || success);
    let status = response.status;
    delete(response.status);
    res.status(status).send(response);
  });
};

let getPendingSwixes = (req, res) => {
  swixerDbo.getPendingSwix((error, result) => {
    if (error) res.status(400).send({
      success: false,
      message: 'Error in fetching transactions.'
    });
    else res.status(200).send({
      success: true,
      result: result
    });
  });
};

let getAverageTransactionCount = (req, res) => {
  swixerDbo.getAverageTransactionCount((error, avg) => {
    if (error) {
      console.log('Error in getting average transaction count', error)

      res.status(400).send({
        success: false,
        message: 'Error in getting average transaction count'
      })
    } else {
      res.status(200).send({
        success: true,
        avg: avg
      })
    }
  })
}

let getActiveSwix = (req, res) => {
  swixerDbo.getActiveSwix((error, activeList) => {
    if (error) {
      console.log('Error in getting active swixes', error)

      res.status(400).send({
        success: false,
        message: 'Error in getting active swixes'
      })
    } else {
      res.status(200).send({
        success: true,
        list: activeList
      })
    }
  })
}

let getCompletedSwixes = (req, res) => {
  swixerDbo.getCompletedSwixes((error, completedSwixes) => {
    if (error) {
      console.log('Error in getting completed swixes', error)

      res.status(400).send({
        success: false,
        message: 'Error in getting completed swixes'
      })
    } else {
      res.status(200).send({
        success: true,
        list: completedSwixes
      })
    }
  })
}

const getTxHashDetails = (req, res) => {
  let {
    swixHash,
    txHash,
  } = req.body

  let fromSymbol = ''
  let receipt = null
  let swix = null

  async.waterfall([
    (next) => {
      swixerDbo.getSwix(swixHash, (error, _swix) => {
        if (error) {
          console.log('Error in finding swix', error)

          next({
            message: 'Error in finding swix'
          }, null)
        } else if (!_swix) {
          next({
            message: 'Swix not found'
          }, null)
        } else {
          swix = _swix
          fromSymbol = _swix.fromSymbol
          next(null);
        }
      })
    }, (next) => {
      getTxReceipt(txHash, fromSymbol, (error, _receipt) => {
        if (error) next(error, null)
        else if (_receipt) {
          let status = parseInt(_receipt.status)
          let txTime = parseInt(_receipt.time)
          txTime = new Date(txTime)
          if (status === 1) {
            if (txTime > new Date(swix.insertedOn)) {
              next(null)
            } else {
              next({
                status: 3000,
                message: 'Tx time is incorrect'
              })
            }
          } else if (status === 0) {
            next({
              status: 3001,
              message: 'Failed'
            }, null)
          }
        } else {
          next({
            status: 3002,
            message: 'NotFound'
          })
        }
      })
    }, (next) => {
      getTxn(txHash, fromSymbol, (error, _tx) => {
        receipt = _tx;

        if (error) next(error, null)
        else next(null)
      })
    }, (next) => {
      getDetailsFromTx(receipt, fromSymbol, swix.toAddress, (error, details) => {
        if (error) next(error, null)
        else next(null, details)
      })
    }, (details, next) => {
      if (details.toAddress === swix.toAddress) {
        let queryObject = {
          swixHash: swixHash
        }

        let updateObject = {
          inTxStatus: 'success',
          inTxHash: txHash,
          inTxValue: details['amount']
        }

        swixerDbo.updateSwix(queryObject, updateObject, (error, resp) => {
          let errorMessage = {
            message: 'Error in updating swix'
          }

          if (error) next(errorMessage, null)
          else next(null, resp)
        })
      } else {
        next({
          status: 3004,
          message: 'To address is not Deposit address'
        })
      }
    }
  ], (error, resp) => {

    let errorMessage = {
      success: false,
      message: 'Error in finding tx'
    }

    if (error) {
      if (error.status) {
        let queryObject = {
          swixHash: swixHash
        }

        let updateObject = {
          inTxStatus: error.message,
          inTxHash: txHash
        }

        swixerDbo.updateSwix(queryObject, updateObject, (err, resp) => {
          if (err) {
            errorMessage.message = 'Error in updating tx details'
            res.status(400).send(errorMessage)
          } else {
            errorMessage.message = error.message
            res.status(400).send(errorMessage)
          }
        })
      } else {
        errorMessage.message = error.message
        res.status(400).send(errorMessage)
      }

    } else {
      res.status(200).send({
        success: true,
        message: 'details updated successfully'
      })
    }
  })
}

module.exports = {
  getStatus,
  getPendingSwixes,
  getAverageTransactionCount,
  getActiveSwix,
  getCompletedSwixes,
  getTxHashDetails
};