import mongoose from "mongoose";
let Schema = mongoose.Schema

let EarningSchema = new Schema({
  node_address: String,
  earned_balances: Number,
}, {
  versionKey: false,
});

export const Earning = mongoose.model('earning', EarningSchema);
