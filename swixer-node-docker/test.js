let mongoose = require('mongoose');
let mongoDbConfig = require('./config/vars').mongoDb;
let mongoDbUrl = `mongodb://${mongoDbConfig.address}:${mongoDbConfig.port}/${mongoDbConfig.dbName}`;
let async = require('async');
let { getBalancesOfAddress } = require('./server/helpers/account.helper');
let lodash = require('lodash');


let validAccountsSchema = new mongoose.Schema({
  address: String,
  balances: Object
}, {
    strict: true,
    versionKey: false
  });

let validAccounts = mongoose.model('ValidAccounts', validAccountsSchema);

let getBalancesOfAddresses = (addresses, coinSymbols, cb) => {
  let balances = {};
  let count = 0;
  async.eachLimit(addresses, 10,
    (address, next) => {
      getBalancesOfAddress(address, coinSymbols,
        (error, _balances) => {
          console.log(count, error, _balances);
          ++count;
          if (error) next(error);
          else {
            if (lodash.sum(Object.values(_balances))) {
              validAccounts.findOneAndUpdate({
                address
              }, {
                  $set: {
                    balances: _balances
                  }
                }, {
                  upsert: true
                }, () => { })
            } else {
              validAccounts.findOneAndDelete({
                address
              }, () => { })
            }
            balances[address] = _balances;
            next(null);
          }
        });
    }, (error) => {
      if (error) cb(error, null);
      else cb(null, balances);
    });
};

async.waterfall([
  (next) => {
    mongoose.connect(mongoDbUrl,
      (error, db) => {
        if (error) next(error, null);
        else next(null);
      });
  }, (next) => {
    validAccounts.find({
      'type': {
        $in: ['ETH']
      },
      'balances': {
        $exists: false
      },
    },
      {
        '_id': 0
      }, (error, details) => {
        if (error) next({
          status: 500,
          message: 'Error occurred while getting accounts.'
        }, null);
        else {
          let addresses = lodash.map(details, 'address');
          next(null, addresses);
        }
      });
  }, (addresses, next) => {
    console.log(addresses.length);
    // addresses = addresses.slice(0, 10000);
    getBalancesOfAddresses(addresses, ['ETH', 'SENT', 'BNB'], () => {
      next();
    });
  }
], (error, success) => {
  process.exit(0);
});
