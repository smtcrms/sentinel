let SwixModel = require('../models/swixer.model');


let insertSwix = (details, cb) => {
  swix = new SwixModel(details);
  swix.save((error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let getSwix = (findObject, cb) => {
  SwixDetailsModel.findOne(findObject, {
    '_id': 0
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

let getValidSwixes = (cb) => {
  SwixDetailsModel.find({
    'status': 0,
    'inTxHash': {
      $exists: true
    }
  }, {
      '_id': 0
    }, (error, result) => {
      if (error) cb(error, null);
      else cb(null, result || []);
    });
};

let updateSwix = (findObject, updateObject, cb) => {
  SwixDetailsModel.findOneAndUpdate(findObject, {
    $set: Object.assign(updateObject, {
      'updatedOn': Date.now()
    })
  }, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result);
  });
};

module.exports = {
  insertSwix,
  getSwix,
  updateSwix,
  getValidSwixes,
};
