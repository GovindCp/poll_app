const mongoose = require('mongoose'),
  UserModel = require('../model/user'),
  PollModel = require('../model/poll'),
  validator = require("../../validators/reqValidator"),
  validate = require("validate.js"),
  config = require("../../config/env");

// Create Poll
function createPoll(req, res) {
    // valdating request parameters
    var optionsData = [];
    validator.createPollValidate(req.body).then((data) => {
        var options = req.body.options;
        if(options.length>=2){
            for(var i=0,len=options.length;i<len;i++){
                var optionDet = {};
                optionDet.value = options[i];
                optionDet.vote_count = 0;
                optionsData.push(optionDet);
            }
            optionsData.push({value:"custom",vote_count:0,customDet:[]});
            var poll = new PollModel({
                subject:req.body.subject,
                options:optionsData,
                userId: req.currentUser._id
            });
            return poll.save();
        }
        throw "Options count should not be less than two!!"
    }).then((saveDet) => {
        return res.status(200).send({success:true,data:saveDet});
    }).catch((err) => {
        return res.status(400).send({success:false,message: err });
    })
}

function getPollDetails(req, res) {
    // valdating request parameters
    validator.getPollByIdValidate(req.query).then((data) => {
        return PollModel.findById({_id:req.query.pollId});
    }).then((PollData) => {
        return res.status(200).send({success:true,data:PollData});
    }).catch((err) => {
        return res.status(400).send({success:false,message: err });
    })
}

function getPollList(req, res) {
    // valdating request parameters
    validator.getPollListValidate(req.query).then((data) => {
        if(req.query.createdbyme && req.query.createdbyme==="true"){
            return PollModel.find({userId:req.currentUser._id});
        }else{
            return PollModel.find({});
        }
    }).then((pollData) => {
        return res.status(200).send({success:true,data:pollData});
    }).catch((err) => {
        return res.status(400).send({success:false,message: err });
    })
}

function deactivatePoll(req, res) {
    validator.deactivatePollValidate(req.body).then((data) => {
        return PollModel.findOneAndUpdate({_id:req.body.pollId,userId:req.currentUser._id,isActive:true},{$set:{isActive:false}},{new:true});
    }).then((updateDet) => {
        if(updateDet && updateDet!=null){
            return res.status(200).send({success:true,message:"Poll deactivated successfully."});
        }
        throw "Invalid poll details!!"
    }).catch((err) => {
        return res.status(400).send({success:false,message: err });
    })
}

function delatePoll(req, res) {
    validator.deletePollValidate(req.body).then((data) => {
        return PollModel.findOneAndRemove({_id:req.body.pollId,userId:req.currentUser._id,isActive:false});
    }).then((updateDet) => {
        if(updateDet && updateDet!=null){
            return res.status(200).send({success:true,message:"Poll deleted successfully."});
        }
        throw "Invalid poll details!!"
    }).catch((err) => {
        return res.status(400).send({success:false,message: err });
    })
}

function getDeactivatedPoll(req, res) {
    validator.getDeactivatePollValidate(req.body).then((data) => {
        return PollModel.find({isActive:false});
    }).then((pollData) => {
        return res.status(200).send({success:true,data:pollData});
    }).catch((err) => {
        return res.status(400).send({success:false,message: err });
    })
}

function updatePoll(req, res) {
    validator.updatePollValidate(req.body).then((data)=>{
        return PollModel.findOne({_id:req.body.pollId,isActive:true,options:{$elemMatch:{value:req.body.option}}});
    }).then((pollDet)=>{
        if(pollDet && pollDet!=null){
            return PollModel.findOne({_id:req.body.pollId,voters:{$ne:req.currentUser._id}});
        }else{
            throw "Invalid poll details/options!!";
        }
    }).then((voterDet)=>{
        if(voterDet && voterDet!=null){
            if(req.body.option!='custom'){
                return PollModel.findOneAndUpdate({_id:req.body.pollId,"options.value":req.body.option},{$push:{voters:req.currentUser._id},$inc:{"options.$.vote_count":1}},{new:true});
            }else if(req.body.option==='custom' && req.body.custom_text && req.body.custom_text!=""){
                return PollModel.findOneAndUpdate({_id:req.body.pollId,"options.value":req.body.option},{$push:{voters:req.currentUser._id,"options.$.customDet":req.body.custom_text},$inc:{"options.$.vote_count":1}},{new:true});
            }else{
                throw "Custom text can't be empty!!"
            }
        }else{
            throw "Already casted your vote!!";
        }
    }).then((updateDet)=>{
        return res.status(200).send({success:true,data:updateDet});
    }).catch((err)=>{
        return res.status(400).send({success:false,message:err});
    })
}

module.exports = {
    createPoll,
    getPollDetails,
    getPollList,
    deactivatePoll,
    delatePoll,
    getDeactivatedPoll,
    updatePoll
}
