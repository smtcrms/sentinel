let {
  verifyToken
} = require('../helpers/user.helper')

const autherized = (req, res, next) => {
  let token = req.headers.token

  verifyToken(token, (error, user) => {
    if (!error && user) {
      user = user.data
      if (user.role === 'admin') {
        req.user = user;
        next();
      } else {
        res.status(409).send({
          success: false,
          message: 'Unauthorized'
        })
      }
    } else {
      res.status(409).send({
        success: false,
        message: 'Unauthorized'
      })
    }
  })
}

module.exports = {
  autherized
}