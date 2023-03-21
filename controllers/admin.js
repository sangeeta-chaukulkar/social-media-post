const bcrypt = require('bcrypt');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const User= require('../models/User')
const Role= require('../models/Role')
const {Counter} = require("../models/sequencing");

exports.userLogout = async (req, res) => {
     res.clearCookie("jwt");
     return res.json({message:"Logout successfully"})    
}

exports.deletePost = async (req, res) => {
  try {
    const  deletedPost = await Post.findOneAndDelete({post_id : req.params.postid},{userId: req.user.user_id})
    const agag = Post.find({userId : req.user.user_id}).select({post_id:1})
    const next_messages = await Post.updateMany({userId : req.user.user_id},{$pull:{previous_messages:{post_id:req.params.postid}}})

    res.json(deletedPost)
  } catch (err){
    res.status(400).json({ message: err.message });
  }
}


exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({  email : email} )
  .then(user => {
    if(!user){
       res.status(404).json( { message: "User Not Found" });
    }
    bcrypt.compare(password,user.password)
    .then(isMatch=>{
      if(isMatch){
        jwt.sign({ email : user.email}, process.env.TOKEN_SECRET, { expiresIn: '5m' },(err,token)=>{
          res.cookie("jwt",token,{httpOnly:true})
          res.json({token:token,message:'Login successfully'}); 
        });
      }
      else{
         res.status(401).json({ message: "Credentials are incorrect" });
      }
    })
    
  })
  .catch(err=>{
    console.log(err);
  })
}

exports.postUser = async (req, res) => {
  const name= req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = Number(req.body.role_id) || Number(2);
  var finalCount;
  const  userCount= await Counter.findById({ "_id": "user_id" }).select({seq: 1})
  
  if( typeof userCount === 'undefined' || userCount === null){ finalCount = 1 }
    else { finalCount = userCount.seq + 1 }
  User.findOne({  email: email })
  .then(present => {
    if(present){
      return res.json({message:'User already exists, Please Login'});
    }
    bcrypt.hash(password,12)  
    .then(hashpassword=>{
      Role.findOne({ role_id : role }).then(roles => {
      if (!roles) {
        return res.status(404).json({ message: 'Role not found' });
      }
      const user = new User({
      name : name,
      email : email,
      password: hashpassword,
      role_id : roles
    })
    user.user_id = finalCount;
    user.save().then(() => {
      res.json({message : "User created successfully"});
    }) })
    
  })
})
  .catch(err => {
    console.log(err);
  });
  
};


exports.createPost = async (req, res) => {
  const post_message = req.body.post_message;
  const is_active = req.body.is_active;
  var finalPostId;
  const  postCount= await Counter.findById({ "_id": "post_id" }).select({seq: 1})
  const previous_messages = await Post.find({userId : req.user.user_id}).select({post_message:1,post_id:1,createdAt:1}).sort({createdAt: -1})

  if( typeof postCount === 'undefined' || postCount === null){ finalPostId = 1 }
    else { finalPostId = postCount.seq + 1 }
  
  const postInsert = new Post({
    post_message ,
    previous_messages,
    is_active,
    userId : req.user.user_id
  })
  postInsert.post_id = finalPostId;
  postInsert.save()
    .then(posts => {
      return res.status(201).json({ posts, message: 'post added successfuly'});
    })
    .catch(err => {
      return res.status(402).json({ message: err});
    });
}


exports.getUser = async (req, res)=> {
  let docs = await  User.aggregate([ {$match : { user_id : req.user.user_id }},
    { $lookup : {              from : "roles" ,
                               localField: "role_id",
                               foreignField : "_id",
                               pipeline: [ { $project : { _id : 0,role_name: 1}}],
                               as : "user_role" }
},
])
res.json(docs)
}


exports.getPosts = (req, res)=> {
  Post.find({userId : req.user.user_id }).then(posts => {
      return res.status(200).json({posts, success: true})
  })
  .catch(err => {
      return res.status(402).json({ error: err, success: false})
  })
}

exports.editPost =  async (req, res)=> {
  try{
    const id = req.params.postid; 
    const updat= { post_message : req.body.post_message, is_active : req.body.is_active }
     const update_entry= await Post.findOneAndUpdate({post_id :id},{$set: updat},{new:true})
     const next_messages = await Post.updateMany({userId : req.user.user_id},{$set:{"previous_messages.$[elem].post_message" : req.body.post_message}},{arrayFilters:[{$and : [{ "elem.post_id":req.params.postid}]}]})

  return res.status(200).json({message: update_entry, success: true}) 
      }
  catch(error){
    return res.status(500).send({error: 'Internal server error'}) 
  }
   
}
