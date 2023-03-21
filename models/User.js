const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sequencing = require("./sequencing");
const userSchema = new Schema({
    user_id : {type : Number,unique :true},
  name : { type : String, required: true},
  email : { type : String, required: true,unique :true },
  password : { type : String, required: true },
  role_id : { type : Schema.Types.ObjectId, ref : 'Role' ,required : true }}
)

userSchema.pre("save", function (next) {
      let doc = this;
      sequencing.getNextValue("user_id").
      then(counter => {
          if(!counter) {
              sequencing.insertCounter("user_id")
              .then(counter => {
                  doc.user_id = counter;
                  next();
              })
              .catch(error => next(error))
          } else {
              doc.user_id = counter;
              next();
          }
      })
      .catch(error => console.log(error))
  });
module.exports = mongoose.model('User',userSchema)