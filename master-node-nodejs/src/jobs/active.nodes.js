import {
  scheduleJob
} from "node-schedule";
import {
  Node,
  Active
} from "../models";

export const activeNodesJob = () => {
  scheduleJob('0 * * * *', () => {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date = parseInt(date / 1000)
    Node.countDocuments({
      'vpn.status': 'up'
    }, (error, count) => {
      if (error) {
        console.log('error in active nodes job', error);
      } else {
        let timeStamp = parseInt(Date.now() / 1000);
        let activeData = new Active({
          date: date,
          timestamp: timeStamp,
          active: count
        });

        activeData.save((error, resp) => {
          if (error) {
            console.log('error in storing data');
          } else {

          }
        })
      }
    });
  })
}

let dt = new Date()
