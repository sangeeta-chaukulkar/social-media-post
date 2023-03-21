const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  role_id : {type :Number,required :true},
  role_name: { type : String , required: true }
})

module.exports = mongoose.model('Role',roleSchema)