let mongoose = require('mongoose');


let swixSchema = new mongoose.Schema({
  fromSymbol: {
    type: String,
    required: true
  },
  toSymbol: {
    type: String,
    required: true
  },
  refundAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true,
    unique: true
  },
  destinationAddress: {
    type: String,
    required: true
  },
  delayInSeconds: {
    type: Number,
    required: true
  },
  insertedOn: {
    type: Date,
    default: Date.now
  },
  swixHash: {
    type: String,
    unique: true
  },
  status: {
    type: Number,
    default: 0,
  },
  fromAccountsCount: {
    type: Number,
    default: 4
  },
  receivedAmount: Number,
  remainingAmount: Number,
  exchangeRate: Number,
  updatedOn: Date,
  inTxHash: String,
  outTxHashes: Array
}, {
    strict: true,
    versionKey: false
  });

module.exports = mongoose.model('Swix', swixSchema);