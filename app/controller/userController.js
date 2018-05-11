const validator = require("../../validators/reqValidator"),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  UserModel = require('../model/user'),
  config = require('../../config/env'),
  bcrypt = require('bcrypt-nodejs');

// Register user for poll
function register(req, res) {
  var pwd;
  // validating request params
  validator.userRegValidate(req.body).then((data) => {
    return UserModel.findOne({ email: req.body.email });
  }).then((userData) => {
    if(!userData && userData==null){
      var user = new UserModel({
        name: req.body.name,
        age: req.body.age,
        address: req.body.address,
        email: req.body.email,
        password: pwd = randomString() // setting password
      });
      return user.save();
    }else{
      throw "User is already registered!!"
    }
  }).then((userDet) => {
    userDet = userDet.toObject();
    userDet.password = pwd;
    delete userDet.__v;
    delete userDet.hash;
    delete userDet.salt
    delete userDet.otptime;
    return res.status(200).send({success:true,data:userDet});
  }).catch((err) => {
    return res.status(400).send({success:false,message: err.errmsg || err });
  })
}

// User login
function login(req, res) {
  // Validating the request params
  validator.loginValidator(req.body).then((data) => {
    return UserModel.findOne({email: req.body.email, isActive:true});
  }).then((user)=>{
    if(user!=null){
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          UserModel.findOneAndUpdate({email:req.body.email},{$set:{lastlogin:new Date()}},{new:true}).exec(function(err,userDet){
            if(err){
              throw err;
            }
            userDet = userDet.toObject();
            delete userDet.__v;
            delete userDet.hash;
            delete userDet.salt
            delete userDet.otptime;
            // Generating token
            var result = {};
            result._id = userDet._id;
            result.token =  __generateToken(userDet);
            return res.status(200).send({success:true,data:result})
          });
        }else{
          return res.status(400).send({success:true,message:"Invalid Credentials!!"});
        }
      });
    }else{
      return res.status(400).send({success:true,message:"User not found!!"})
    }
  }).catch((err)=>{
    return res.status(400).send({ message: err.errmsg || err });
  })
}
    
// Forgot password
var forgotPassword = function (req, res, next) {
  // Validating request params
  validator.forgotPasswordValidator(req.body).then((data) => {
    var randomOtp = randomString();
    return UserModel.findOneAndUpdate({email: req.body.email,isActive:true},{$set:{otp: randomOtp, otptime: new Date()}},{new: true});
  }).then((result)=>{
    if(result && result!=null){
      return res.status(200).send({ success: true,otp:result.otp});
    }
    throw "User not found!!";
  }).catch((err) => {
    return res.status(400).send({ message: err.errmsg || err });
  });
}

// Verify Otp
var verifyOtp = function (req, res, next) {
  // Validating request params
  validator.verifyOtpValidator(req.body).then((data) => {
    return UserModel.findOne({email: req.body.email});
  }).then((user)=>{
    if(user && user!=null){
      if (user.otp && user.otptime) {
        //Checking if otp is expired 
        var gd = parseInt(new Date(user.otptime).getTime());
        var cd = parseInt(new Date().getTime());
        if (parseInt(cd - gd) < 300000) {
          // Checking if otp match 
          if (req.body.otp === user.otp) {
            // Setting the new password 
            var hash = bcrypt.hashSync(req.body.newPassword, user.salt);
            return UserModel.findOneAndUpdate({email: req.body.email},{$set:{hash:hash,otp:undefined,otptime:undefined}});
          }else{
            throw "Invalid otp!!"
          }
        }else{
          throw "Otp has been expired.Click to generate new otp!!"
        }  
      }else{
        throw "Otp not found.Click to generate new otp!!"
      }
    }else{
      throw "User not found!!"
    }
  }).then((updateDet)=>{
    return res.status(200).send({success:true,message:"Password changed successfully."})
  }).catch((err) => {
    return res.status(400).send({ message: err.errmsg || err });
  });
}


function __generateToken(user) {
  var token = jwt.sign(user, config.secret, {
    expiresIn: '24hr' // expires in 1 day
  });
  return token;
}

function randomString() {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 8; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
}
  
module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp
}
