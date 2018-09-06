import { stats } from './jobs/statistics';
import { alive } from './jobs/alive';
import { payments } from './jobs/payments';
import { swaps } from './jobs/swaps';
import { activeNodesJob } from "./jobs/active.nodes";
import { earnedBalances } from "./jobs/earned.balances";

export const app = () => {
  // stats('start')
  // alive({ message: 'start', maxSecs: 60 })
  // payments('start');
  // swaps({ message: 'start' })
  // activeNodesJob()
  earnedBalances()
}