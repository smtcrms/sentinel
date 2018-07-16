let async = require('async');
let swixerDbo = require('../dbos/swixer.dbo');


let getStatus = (req, res) => {
  let { swixHash } = req.query;
  async.waterfall([
    (next) => {
      swixerDbo.getSwix({ swixHash },
        (error, swix) => {
          if (error) next({
            status: 500,
            message: 'Error occurred while getting swix.'
          }, null);
          else if (swix) next(null, {
            status: 200,
            swixStatus: swix.status,
            txHashes: swix.txHashes,
            remainingAmount: swix.remainingAmount || null
          });
          else next({
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
    delete (response.status);
    res.status(status).send(response);
  });
};

let addInTxHash = (req, res, job) => {
  let { swixHash,
    txHash } = req.body;
  async.waterfall([
    (next) => {
      swixerDbo.getSwix({ swixHash },
        (error, swix) => {
          if (error) next({
            status: 500,
            message: 'Error occurred while getting swix.'
          }, null);
          else if (swix) next(null);
          else next({
            status: 400,
            message: 'No swix found.'
          }, null);
        });
    }, (next) => {
      swixerDbo.updateSwix({ swixHash }, {
        inTxHash: txHash
      }, (error, result) => {
        if (error) next({
          status: 500,
          message: 'Error occurred while updating in txHash.'
        }, null);
        else next(null, {
          status: 200,
          message: 'Swix txHash updated successfully.'
        })
      })
    }
  ], (error, success) => {
    let response = Object.assign({
      success: !error
    }, error || success);
    let status = response.status;
    delete (response.status);
    res.status(status).send(response);
    if (response.success) job(swixHash, console.log);
  });
};

module.exports = {
  getStatus,
  addInTxHash
};