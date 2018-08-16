let async = require('async');
let swixerDbo = require('../dbos/swixer.dbo');


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

module.exports = {
  getStatus,
  getPendingSwixes,
  getAverageTransactionCount,
  getActiveSwix,
  getCompletedSwixes
};