let mongoose = require('mongoose');


let accountSchema = new mongoose.Schema({
  address: {
    type: String,
    unique: true
  },
  privateKey: {
    type: String,
    unique: true
  },
  type: String,
  addedOn: {
    type: Date,
    default: Date.now
  },
  isCreated: {
    type: Boolean,
    default: true
  }
}, {
    strict: true,
    versionKey: false
  });

module.exports = mongoose.model('Account', accountSchema);
