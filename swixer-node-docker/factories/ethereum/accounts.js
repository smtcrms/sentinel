let web3 = require('../web3');
let tokens = require('./tokens');
let {
  generatePrivateKey,
  generatePublicKey,
  generateAddress
} = require('../keys');
let redis = require('redis');
let redisClient = redis.createClient();


let getTransactionCount = (address, cb) => {
  let key = address
  redisClient.get(key, (err, previousNonce) => {
    web3.eth.getTransactionCount(address, 'pending', (error, nonce) => {
      if ((err === null) && ((previousNonce === null) || nonce > previousNonce)) {
        redisClient.set(key, nonce);
        cb(null, nonce);
      } else {
        setTimeout(() => {
          getTransactionCount(address, cb)
        }, 2000);
      }
    })
  });
};

let getBalance = (address, coinSymbol, cb) => {
  if (coinSymbol === 'ETH') {
    web3.eth.getBalance(address,
      (error, balance) => {
        if (error) cb(error, null);
        else {
          balance = web3.toDecimal(balance);
          cb(null, balance);
        }
      });
  } else {
    tokens.getBalance(address, coinSymbol,
      (error, balance) => {
        if (error) cb(error, null);
        else {
          balance = web3.toDecimal(balance);
          cb(null, balance);
        }
      });
  }
};

let getAccount = (cb) => {
  try {
    let privateKey = generatePrivateKey();
    let address = '0x' + generateAddress(generatePublicKey(privateKey, false)).toString('hex');
    let account = {
      address,
      privateKey: privateKey.toString('hex')
    };
    cb(null, account);
  } catch (error) {
    cb(error, null);
  }
};

let getTimeOfTx = (txHash, cb) => {
  try {
    let blockNumber = web3.eth.getTransaction(txHash).blockNumber
    let time = web3.eth.getBlock(blockNumber).timestamp
    cb(null, time * 1000)
  } catch (error) {
    console.log('Error occured in getting time', error)
    cb({
      'message': 'Error occured in getting time '
    }, null)
  }
}

let getETHTxReceipt = ((txHash, cb) => {
  let errorMessage = {
    message: 'Error in finding Tx Receipt'
  }

  web3.eth.getTransactionReceipt(txHash, (error, receipt) => {

    if (error || !receipt) {
      console.log('Error in finding Tx Receipt', error);

      cb(errorMessage, null)
    } else {
      getTimeOfTx(txHash, (error, time) => {
        if (error) cb(error, null)
        else {
          receipt.time = time
          cb(null, receipt)
        }
      })
    }
  })
})

let getETHTx = ((txHash, cb) => {
  let errorMessage = {
    message: 'Error in finding Txn'
  }

  web3.eth.getTransaction(txHash, (error, tx) => {

    if (error) {
      console.log('Error in finding Txn', error);

      cb(errorMessage, null)
    } else cb(null, tx)
  })
})

module.exports = {
  getBalance,
  getTransactionCount,
  getAccount,
  getETHTxReceipt,
  getETHTx
};