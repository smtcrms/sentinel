let async = require('async');
let trim = require('trim-character')
let accounts = require('../../factories/accounts');
let coins = require('../../config/coins');
let {
  getETHTxReceipt,
  getETHTx
} = require('../../factories/ethereum/accounts');

let {
  getBTCTxReceipt
} = require('../../factories/bitcoin/accounts');

let getAccount = (coinSymbol, cb) => {
  accounts.getAccount(coinSymbol,
    (error, account) => {
      cb(error, account);
    });
};

let getBalance = (address, coinSymbol, cb) => {
  accounts.getBalance(address, coinSymbol,
    (error, balance) => {
      cb(error, balance);
    });
};

let getBalancesOfAccount = (address, cb) => {
  let balances = {};
  let accountType = accounts.getAccountType(address);
  let coinSymbols = accountType === 'ETH' ? ['ETH', 'SENT', 'BNB'] : ['PIVX'];
  async.each(coinSymbols,
    (coinSymbol, next) => {
      getBalance(address, coinSymbol,
        (error, balance) => {
          if (error) next(error);
          else {
            balances[coinSymbol] = balance;
            next(null);
          }
        });
    }, (error) => {
      if (error) cb(error, null);
      else cb(null, balances);
    });
};

let getBalancesOfAccounts = (addresses, cb) => {
  let balances = {};
  async.each(addresses,
    (address, next) => {
      getBalancesOfAccount(address,
        (error, _balances) => {
          if (error) next(error);
          else {
            if (_balances.ETH > 0) {
              //console.log('address', address, 'ETH', _balances.ETH / 1e18, 'SENT', _balances.SENT / 1e8)
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

const getTxReceipt = (txHash, coinSymbol, cb) => {
  let coinType = coins[coinSymbol].type

  if (coinType === 'ETH') {
    getETHTxReceipt(txHash, (error, receipt) => {
      if (error) cb(error, null)
      else cb(null, receipt)
    })
  } else if (coinType === 'BTC') {
    getBTCTxReceipt(txHash, coinSymbol, (error, receipt) => {
      if (error) {
        console.log('Error in fetching BTC tx', error)
        cb(error, null)
      } else {
        cb(null, receipt)
      }
    })
  } else {
    cb({
      'message': 'token is invalid'
    }, null)
  }
}

const getTxn = (txHash, coinSymbol, cb) => {
  let coinType = coins[coinSymbol].type

  if (coinType === 'ETH') {
    getETHTx(txHash, (error, _tx) => {
      if (error) cb(error, null)
      else cb(null, _tx)
    })
  } else if (coinType === 'BTC') {
    getTxReceipt(txHash, coinSymbol, (error, _tx) => {
      if (error) cb(error, null)
      else cb(null, _tx)
    })
  }
}

const getDetailsFromTx = (tx, coinSymbol, address, cb) => {
  let coinType = coins[coinSymbol].type
  try {
    if (coinType === 'ETH') {
      let inputData = tx.input
      let details = {}
      // console.log('input data', tx, tx.input)

      if (inputData === '0x') {
        details['toAddress'] = tx.to
        details['amount'] = parseInt(tx.value)
        cb(null, details)
      } else if (inputData.length === 138 && inputData.substring(0, 10) === '0xa9059cbb') {
        let details = {}

        details['toAddress'] = ''
        let data = inputData.substring(10)
        data = trim.left(data, '0')
        details['toAddress'] = '0x' + data.substring(0, 40)
        data = data.substring(40)
        amount = '0x' + trim.left(data, '0')
        details['amount'] = parseInt(amount)
        cb(null, details)
      }
    } else if (coinType === 'BTC') {
      let details = null
      let vout = tx.vout
      vout.map((voutTx) => {
        if (voutTx['scriptPubKey']['addresses'][0] === address) {
          details = {}
          details['toAddress'] = address;
          details['amount'] = voutTx.value;
          cb(null, details)
        }
      })
      if (!details) {
        cb({
          message: 'to address is not deposit address'
        }, null)
      }
    }
  } catch (error) {
    console.log('Error occured in fetching details from tx receipt', error)

    cb({
      message: 'Error occured in fetching details from tx receipt'
    }, null)
  }
}


module.exports = {
  getAccount,
  getBalance,
  getBalancesOfAccount,
  getBalancesOfAccounts,
  getTxReceipt,
  getTxn,
  getDetailsFromTx
};