var express    = require('express');
// create our router
var router = express.Router();
var server = require('./server.js');
var token_fresh = "";
var exec = require('child_process').exec
//Add your key here
var iftttKey = require('./config').iftttKey;
var appId = require('./config').heatzy_Id;
// middleware to use for all requests
router.use('/actions', require('./actions') );
router.use('/triggers', require('./triggers') )


router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');

    // Add service key validation
    var serviceKey = req.get("IFTTT-Service-Key");
    // var channelKey = req.get("IFTTT-Channel-Key");
    console.log("Status check - serviceKey", serviceKey);
    if(serviceKey === iftttKey) {
        next();
    }
    else {
        const errors = [{
            "message": "Invalid channel key!"
        }];
        res.status(401).json({ errors });
    }
});



// test route to make sure everything is working (accessed at GET http://localhost:8080/ifttt/v1)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to ifttt!' });
});

// Send status 200 - to notify IFTTT
router.get('/status', function(req, res) {
    res.sendStatus(200);
});

module.exports = router;