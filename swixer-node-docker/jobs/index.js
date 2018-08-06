let {
  gasFee
} = require('./ethScheduler')
let {
  refund
} = require('./refund')
let {
  timeout
} = require('./timeout')
let {
  balance
} = require('./balanceUpdate')
let {
  input
} = require('./inputCheck')
let {
  output
} = require('./outputCheck')

const jobs = () => {
  gasFee()
  timeout()
  input()
  output()
  // balance()
  // refund()
}

module.exports = {
  jobs
}