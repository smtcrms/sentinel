let SwixDetailsModel = require('../models/swixer.model');


let insertSwixDetails = (swixDetails, cb) => {
  swixDetails = new SwixDetailsModel(swixDetails);
  swixDetails.save((error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let getPendingSwix = (cb) => {
  SwixDetailsModel.find({
    receivedValue: {
      $gt: 0
    },
    $or: [{
        'remainingAmount': {
          $exists: false
        }
      },
      {
        'remainingAmount': {
          $gt: 0
        }
      }
    ],
    remainingAmount: {
      $gt: 0
    },
  }, {
    _id: 0,
    fromSymbol: 1,
    toSymbol: 1,
    swixHash: 1,
    txInfos: 1,
    destinationAddress: 1,
    remainingAmount: 1,
    insertedOn: 1,
    lastUpdateOn: 1,
    receivedValue: 1
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result || []);
  });
};


let getSwix = (swixHash, cb) => {
  SwixDetailsModel.findOne({
    swixHash
  }, {
    _id: 0
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let getValidSwixes = (cb) => {
  SwixDetailsModel.find({
    isScheduled: false,
    $or: [{
        'remainingAmount': {
          $exists: false
        }
      },
      {
        'remainingAmount': {
          $gt: 0
        }
      }
    ],
    'tries': {
      $lt: 10
    }
  }, {
    '_id': 0
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result || []);
  });
};

let updateSwixStatus = (toAddress, message, isScheduled, cb) => {
  SwixDetailsModel.findOneAndUpdate({
    toAddress
  }, {
    $set: {
      isScheduled,
      message,
      'lastUpdateOn': Date.now()
    }
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let increaseTries = (toAddress, cb) => {
  SwixDetailsModel.findOneAndUpdate({
    toAddress
  }, {
    $inc: {
      'tries': 1
    }
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let updateSwixTransactionStatus = (toAddress, txInfo, remainingAmount, cb) => {
  SwixDetailsModel.findOneAndUpdate({
    toAddress
  }, {
    $push: {
      'txInfos': txInfo
    },
    $set: {
      remainingAmount
    }
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

const updateSwix = (findObj, updateObj, cb) => {
  SwixDetailsModel.update(findObj, {
    $set: updateObj
  }, (err, resp) => {
    if (err) cb(err, null)
    else cb(null, resp)
  })
}

let getAverageTransactionCount = (cb) => {
  SwixDetailsModel.aggregate([{
    $project: {
      date: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$insertedOn'
        }
      }
    }
  }, {
    $group: {
      _id: '$date',
      count: {
        $sum: 1
      }
    }
  }, {
    $group: {
      _id: null,
      avg: {
        $avg: '$count'
      }
    }
  }], (error, avg) => {
    if (error) cb(error, null)
    else cb(null, avg)
  })
}

let getActiveSwix = (cb) => {
  SwixDetailsModel.find({
    status: 'wait'
  }, {
    _id: 0,
    fromSymbol: 1,
    toSymbol: 1,
    swixHash: 1,
    fromAddress: 1,
    toAddress: 1,
    txInfos: 1,
    remainingAmount: 1
  }, (error, activeList) => {
    if (error) cb(error, null)
    else cb(null, activeList)
  })
}

let getCompletedSwixes = (cb) => {
  SwixDetailsModel.find({
    remainingAmount: 0
  }, {
    fromSymbol: 1,
    toSymbol: 1,
    swixHash: 1,
    destinationAddress: 1,
    txInfos: 1,
    receivedValue: 1,
    insertedOn: 1
  }, (error, list) => {
    if (error) cb(error, null)
    else cb(null, list)
  })
}

module.exports = {
  insertSwixDetails,
  getSwix,
  getValidSwixes,
  updateSwixStatus,
  increaseTries,
  updateSwixTransactionStatus,
  updateSwix,
  getPendingSwix,
  getAverageTransactionCount,
  getActiveSwix,
  getCompletedSwixes
};