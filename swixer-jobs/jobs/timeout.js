let {
  scheduleJob
} = require('node-schedule');

let {
  waterfall,
  eachLimit
} = require('async');

let {
  updateSwix
} = require('../server/dbos/swixer.dbo');

let SwixerModel = require('../server/models/swixer.model');

const timedOutTxsList = (list, cb) => {
  eachLimit(list, 1, (item, iterate) => {
    let address = item.toAddress; // deposit address

    waterfall([
      (next) => {
        let queryObject = {
          toAddress: address
        }

        let udpateObject = {
          status: 'timeout',
          message: 'funds not deposited',
          tries: 10,
          remainingAmount: 0
        }

        // updating the state of the swix txn
        updateSwix(queryObject, udpateObject, (error, resp) => {
          if (error) {
            next({
              message: 'Error at updating swix status in resend job',
              error
            }, null);
          } else {
            next();
          }
        });
      }
    ], (error, resp) => {
      iterate();
    })
  }, () => {
    cb();
  })
}

const TransactionsTimedOutJob = () => {
  scheduleJob('0 0 * * *', () => { // schedule job functioin executes for every 24 hours. at 00:00 minutes
    let time = Date.now() - 24 * 60 * 60 * 1000; // substracting 24 hours from current time stamp

    let queryObject = {
      'status': 'wait',
      'isScheduled': false,
      'remainingAmount': {
        '$exists': false
      },
      'receivedValue': {
        '$exists': false
      },
      'tries': {
        '$eq': 0
      },
      'insertedOn': {
        '$lte': new Date(time)
      }
    }

    SwixerModel.find(queryObject, { //fetching all the swixes which are waiting for more than 24 hours
      '_id': 0
    }, (error, result) => {
      //Update swix transctions as unreachable state if it is checking for in transaction more than 24 hours

      timedOutTxsList(result, () => {})
    });
  })
}

module.exports = {
  TransactionsTimedOutJob
}