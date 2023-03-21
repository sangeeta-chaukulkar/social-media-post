const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = (req, res, next) => {
    try {

        const token = req.cookies.jwt;
        const email = String(jwt.verify(token, process.env.TOKEN_SECRET).email);
        User.findOne({email : email }).then(user => {
            req.user = user;
            next();
        }).catch(err => { throw new Error(err)})
      } catch(err) {
        console.log(err);
        return res.status(401).json({message: "Kindly login in order to perform operations"})
      }
}

module.exports = {
    authenticate
}