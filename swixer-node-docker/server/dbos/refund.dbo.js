let RefundModel = require('../models/refund.model')


const updateRefund = (queryObj, updateObj, cb) => {
  let optionObj = {
    upsert: true
  }
  
  RefundModel.update(queryObj, updateObj, optionObj, (error, resp) => {
    let errorMessage = {
      'message': 'Error in updating refund'
    }

    if (error) cb(errorMessage, null)
    else cb(null, resp)
  })
}

module.exports = {
  updateRefund
}