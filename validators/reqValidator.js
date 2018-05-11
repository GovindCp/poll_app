const validate = require("validate.js");

var constraints = {
    "userRegistration":{
        "name":{
            "presence":true
        },
        "age":{
            "presence":true
        },
        "address":{
            "presence":true
        },
        "email": {
            "presence": true
        }
    },
    "login":{
        "email": {
            "presence": true,
            "length": {
                "maximum": 75
            },
            "email": {
                "message": "Not a valid email"
            }
        },
        "password": {
            "presence":true
        }
    },
    "forgotPasswordValidator":{
        "email": {
            "presence": true,
            "length": {
                "maximum": 75
            },
        }
    },
    "verifyOtpValidator":{
        "email": {
            "presence": true,
            "length": {
                "maximum": 75
            },
        },
        "otp": {
            "presence": true,
            "length": {
                "maximum": 8
            },
        },
        "newPassword": {
            "presence": true
        },
        "confirmPassword": {
            "presence": true,
            "equality":"newPassword"
        },
    },
    "createPoll":{
        "subject":{
            "presence": true,
        },
        "options":{
            "presence":true,
        }
    },
    "getPollById":{
        "pollId":{
            "presence":true,
        },
    },
    "getPollList":{},
    "deactivatePoll":{
        "pollId":{
            "presence": true,
        },
    },
    "deletePoll":{
        "pollId":{
            "presence": true,
        },
    },
    "getDeactivatePoll":{},
    "updatePoll":{
        "pollId":{
            "presence": true
        },
        "option":{
            "presence": true
        }
    }
};

module.exports.userRegValidate = function (body) {
    return validate.async(body, constraints.userRegistration);
};

module.exports.loginValidator = function (body) {
    return validate.async(body, constraints.login);
};

module.exports.forgotPasswordValidator = function (body) {
    return validate.async(body, constraints.forgotPasswordValidator);
};

module.exports.verifyOtpValidator = function (body) {
    return validate.async(body, constraints.verifyOtpValidator);
};

module.exports.createPollValidate = function (body) {
    return validate.async(body, constraints.createPoll);
};

module.exports.getPollListValidate = function (body) {
    return validate.async(body, constraints.getPollList);
};

module.exports.getPollByIdValidate = function (body) {
    return validate.async(body, constraints.getPollById);
};

module.exports.deactivatePollValidate = function (body) {
    return validate.async(body, constraints.deactivatePoll);
};

module.exports.deletePollValidate = function (body) {
    return validate.async(body, constraints.deletePoll);
};

module.exports.getDeactivatePollValidate = function (body) {
    return validate.async(body, constraints.getDeactivatePoll);
};

module.exports.updatePollValidate = function (body) {
    return validate.async(body, constraints.updatePoll);
};
