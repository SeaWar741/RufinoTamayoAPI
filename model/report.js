const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  username: { type: String, default: null },
  creationDate: { type: Date, default: new Date()},
  attentionDate: { type: Date, default: null},
  title:{type:String, default: null},
  description:{type:String, default: null},
  images:{type:[String], default: null},
  category: {type: String, default: null},
  lat:{type:String,default:null},
  long:{type:String,default:null}
});

module.exports = mongoose.model("report", reportSchema,'Reports');