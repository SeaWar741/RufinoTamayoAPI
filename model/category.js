const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, default: null},
  callToAction: { type: String, default: null},
  campo:{type:String, default: null}
});

module.exports = mongoose.model("category", categorySchema,'Categories');