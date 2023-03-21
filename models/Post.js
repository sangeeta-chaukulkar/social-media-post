const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sequencing = require("./sequencing");

const postSchema = new Schema({
  post_id : {type : Number},
  post_message : { type : String, required: true },
  previous_messages : [{}], 
  is_active : { type : Number, default :0 }, 
  userId : { type : Number ,required : true }
}, { timestamps: true })


postSchema.pre("save", function (next) {
  let doc = this;
  sequencing.getNextValue("post_id").
  then(counter => {
      if(!counter) {
          sequencing.insertCounter("post_id")
          .then(counter => {
              next();
          })
          .catch(error => next(error))
      } else {
          doc.post_id = counter;
          next();
      }
  })
  .catch(error => next(error))
});
module.exports = mongoose.model('Post',postSchema)