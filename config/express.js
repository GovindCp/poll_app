const express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./env'),
    routes = require('../app/routes'),
    UserCtrl = require('../app/controller/userController'),
    UserModel = require('../app/model/user'),
    jwt = require('jsonwebtoken'),
    app = express();
                   
app.use(bodyParser.urlencoded({ 'extended': 'true' }));         // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.post('/api/prelogin/v1/register', UserCtrl.register);
app.post('/api/prelogin/v1/login', UserCtrl.login);
app.post('/api/prelogin/v1/forgotpassword', UserCtrl.forgotPassword);
app.post('/api/prelogin/v1/verifyOtp', UserCtrl.verifyOtp);

app.all('/api/v1*', function (req, res, next) {
    var token = req.get('X-Access-Token');
    if (token) {
        // Verify token
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                // If token expired
                if (err.name === "TokenExpiredError") {
                    return res.status(401).send({
                        "message": "Token Expired",
                        "statusCode": "401",
                        "data": null
                    });
                }
                // If provided invalid token
                return res.status(401).send({
                    "message": "Invalid Token",
                    "statusCode": "401",
                    "data": null
                });
            } else {
                // If token is valid
                // Validating user
                req.currentUser = decoded;
                next();
            }
        });
    } else {
        //if no token provided
        return res.status(401).send({
            "message": "No Token Provided",
            "statusCode": "401",
            "data": null
        });
    }
});
app.use('/api/v1', routes);
// catch 404
app.use((req, res, next) => {
    return res.status(404).send({
        "message": "API Not Found",
        "statusCode": "404",
        "data": null
    });
});
app.use(function (err, req, res, next) {
    console.error(err.stack)
    next();
})
app.set('x-powered-by', false);
module.exports = app;