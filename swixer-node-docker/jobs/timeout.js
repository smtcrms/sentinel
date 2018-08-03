let {
  scheduleJob
} = require('node-schedule');

let {
  waterfall,
  eachLimit
} = require('async');

let {
  updateSwix
} = require('../server/dbos/swixer.dbo')

let SwixerModel = require('../server/models/swixer.model');

const timeoutJob = (list, cb) => {
  eachLimit(list, 1, (item, iterate) => {
    let address = item.toAddress;

    waterfall([
      (next) => {
        updateSwix({
          toAddress: address
        }, {
          isScheduled: true,
          status: 'timeout',
          message: 'no funds deposited',
          tries: 10,
          remainingAmount: 0
        }, (err, resp) => {
          if (err) {
            console.log('error at updating swix status in resend job');
            next({}, null)
          } else {
            next()
          }
        })
      }
    ], (err, resp) => {
      iterate();
    })
  }, () => {
    cb();
  })
}

const timeout = () => {
  scheduleJob('0 0 * * *', () => {
    SwixerModel.find({
      'isScheduled': false,
      'remainingAmount': {
        $exists: false
      },
      'receivedValue': {
        $exists: false
      },
      'tries': {
        $eq: 0
      }
    }, {
      '_id': 0
    }, (error, result) => {
      timeoutJob(result, () => {
        console.log('timeout job')
      })
    });
  })
}

module.exports = {
  timeout
}