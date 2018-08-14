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

const timeoutJob = (list, cb) => {
  eachLimit(list, 1, (item, iterate) => {
    let address = item.toAddress;

    waterfall([
      (next) => {
        updateSwix({
          toAddress: address
        }, {
          status: 'timeout',
          message: 'funds not deposited',
          tries: 10,
          remainingAmount: 0
        }, (err, resp) => {
          if (err) {
            console.log('Error at updating swix status in resend job', err);

            next({}, null);
          } else {
            next();
          }
        });
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
    let time = Date.now();
    time -= 24 * 60 * 60 * 1000;

    SwixerModel.find({
      'status': 'wait',
      'isScheduled': false,
      'remainingAmount': {
        $exists: false
      },
      'receivedValue': {
        $exists: false
      },
      'tries': {
        $eq: 0
      },
      'insertedOn': {
        $lte: new Date(time)
      }
    }, {
      '_id': 0
    }, (error, result) => {
      //Update swix transctions as unreachable state if it is more than 24 hours

      timeoutJob(result, () => {
        console.log('completed the swix transactions to unreachable state job')
      })
    });
  })
}

module.exports = {
  timeout
}