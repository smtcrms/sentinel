let axios = require('axios');
let gateways = require('../../config/btc/gateways');

let getAccount = (coinSymbol, cb) => {
  let url = `${gateways[coinSymbol].server}/address`;
  axios.get(url)
    .then((response) => {
      if (response.status === 200 &&
        response.data.success === true) {
        let account = {
          address: response.data.address,
          privateKey: response.data.address
        };
        cb(null, account);
      } else cb({
        message: 'Unsuccessful request.'
      }, null);
    })
    .catch((error) => {
      cb(error, null);
    });
};

let getBalance = (address, coinSymbol, cb) => {
  let url = `${gateways[coinSymbol].server}/balance?address=${address}`;
  axios.get(url)
    .then((response) => {
      if (response.status === 200 &&
        response.data.success === true) {
        let balance = response.data.balance;
        cb(null, balance);
      } else cb({
        message: 'Unsuccessful request.'
      }, null);
    })
    .catch((error) => {
      console.log(error);
      cb(error, null);
    });
};

const getBTCTxReceipt = (txHash, coinSymbol, cb) => {

  let url = `${gateways[coinSymbol].txHashUrl}${txHash}`
  try {
    axios.get(url)
      .then((resp) => {
        resp = resp.data
        if (resp !== 'unknown') {
          resp.status = 1
          cb(null, resp)
        } else {
          cb(null, {
            status: 0
          })
        }
      })
  } catch (error) {
    console.log('Error in fetching pivx tx details', error)

    cb({
      message: 'Error in fetching pivx tx details'
    }, null)
  }
}

module.exports = {
  getAccount,
  getBalance,
  getBTCTxReceipt
};