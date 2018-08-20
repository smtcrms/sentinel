let jwt = require('jsonwebtoken')
let {
  jwtsecret
} = require('../../config/vars')

const getToken = (data, tokenType) => {
  let expireTime = 1 * 60 * 60 // 1 hour

  if (tokenType === 'refresh') {
    expireTime = 30 * 24 * 60 * 60 // 30 days
  }
  let token = jwt.sign({
    data: data,
  }, jwtsecret, {
    expiresIn: expireTime,
  })
  return token
}

const verifyToken = (token, cb) => {
  try {
    let data = jwt.verify(token, jwtsecret)
    cb(null, data)
  } catch (error) {
    cb({
      status: 409,
      message: 'Unauthorized'
    }, null)
  }
}

module.exports = {
  getToken,
  verifyToken
}