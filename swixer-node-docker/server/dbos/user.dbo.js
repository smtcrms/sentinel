let UserModel = require('../models/user.model')

const findUser = (queryObject, cb) => {
  UserModel.findOne(queryObject, (error, resp) => {
    let errorMessage = {
      message: 'Error in finding user'
    }
    if (error) cb(errorMessage, null)
    else cb(null, resp)
  })
}

module.exports = {
  findUser
}