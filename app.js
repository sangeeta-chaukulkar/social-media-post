const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose')
const path = require('path');
const adminRoutes = require('./routes/admin');
var cookieParser = require('cookie-parser')

const app=express()
app.use(cors())
app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(adminRoutes)


mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@posts.vrevq5i.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
 .then(result => {
  app.listen(3000);  
  console.log("connected")  
  })
  .catch(err => {
    console.log(err);
  });
