let mongoose = require('mongoose')
let Schema = mongoose.Schema

let refundSchema = new Schema({
  address: String,
  txInfos: Array,
  amount: Number,
  remainingAmount: Number,
  time: Number
})

module.exports = mongoose.model('Refund', refundSchema)