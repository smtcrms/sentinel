import mongoose from "mongoose";
let Schema = mongoose.Schema

let ActiveSchema = new Schema({
  date: Number,
  timestamp: Number,
  active: Number
}, {
  versionKey: false,
});

export const Active = mongoose.model('active', ActiveSchema);
