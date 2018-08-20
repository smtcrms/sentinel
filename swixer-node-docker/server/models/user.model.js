let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  }
}, {
  strict: true,
  versionKey: false
});

module.exports = mongoose.model('User', userSchema);