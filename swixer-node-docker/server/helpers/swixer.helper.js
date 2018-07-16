var { createHash } = require('crypto');


let generateSwixHash = (swixDetails, cb) => {
  let { fromSymbol,
    toSymbol,
    refundAddress,
    toAddress,
    destinationAddress,
    delayInSeconds } = swixDetails;
  try {
    swixDetails = JSON.stringify({
      delayInSeconds,
      destinationAddress,
      fromSymbol,
      refundAddress,
      toAddress,
      toSymbol
    });
    let hash = createHash('md5').update(swixDetails).digest('hex');
    cb(null, hash);
  } catch (error) {
    cb(error, null);
  }
};

module.exports = {
  generateSwixHash
};