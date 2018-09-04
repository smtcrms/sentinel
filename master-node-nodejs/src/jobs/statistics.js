import {
  scheduleJob
} from "node-schedule";
import {
  waterfall
} from "async";
import {
  Node,
  Statistic
} from "../models";

export const stats = (message) => {
  if (message === 'start') {
    let j = scheduleJob('0 0 * * *', () => {
      let nodes = {};
      let currentTime = new Date();
      let timestamp = null
      waterfall([
        (next) => {
          Node.find({
              'vpn.status': 'up'
            },
            (err, up) => {
              nodes.up = up.length;
            }
          )
          Node.find(
            (err, total) => {
              nodes.total = total.length;
              next();
            }
          )
        }, (next) => {
          timestamp = currentTime;
          timestamp.setHours(0);
          timestamp.setMinutes(0);
          timestamp.setSeconds(0);
          timestamp = timestamp.getTime() / 1000
          Statistic.update({
            timestamp: timestamp
          }, {
            '$set': {
              'nodes': nodes
            }
          }, {
            upsert: true
          }, (err, resp) => {
            next();
          })
        }
      ], (err, resp) => {
        console.log('statistics : ', timestamp)
      })
    })
  }
}
