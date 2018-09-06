import {
  scheduleJob
} from "node-schedule";
import {
  Node,
  Earning
} from "../models";
import {
  ERC20Manager
} from "../eth/erc20";
import async from "async";

export const earnedBalances = () => {
  let errorMessage = {
    'message': 'Error in earnedBalances job'
  }
  scheduleJob('*/10 * * * *', () => {
    Node.find({}, (error, nodes) => {

      if (!error) {
        async.each(nodes, (_node, iterate) => {
          let balance = null;
          _node = _node.toObject()
          async.waterfall([
            (next) => {
              ERC20Manager['rinkeby']['SENT'].getBalance(_node['account_addr'], (error, _balance) => {
                if (error) {
                  console.log('error in fetching balance', error);
                  next(errorMessage, null);
                } else {
                  balance = parseInt(_balance);
                  next(null);
                }
              })
            }, (next) => {
              Earning.update({
                node_address: _node['account_addr']
              }, {
                $set: {
                  earned_balances: balance
                }
              }, {
                upsert: true
              }, (error, resp) => {
                if (error) {
                  console.log('error in fetching balance', error);
                  next(errorMessage, null)
                } else next(null)
              })
            }
          ], (error, resp) => {
            if (error) console.log(error);
            iterate();
          })
        }, () => {

        })
      } else {
        console.log('error in finding nodes', error);
      }
    })
  })
}