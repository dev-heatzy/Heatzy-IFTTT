var express    = require('express');
var router = express.Router();
const data = require('../data.json');

router.get('/', function(req, res, next) {
    const models = data.models;
    console.log("test get action")
    //res.status(200).json({ models });
    var bearer_token = req.header("Authorization").split(" ")[1];
    if (bearer_token.length >10){
        res.status(200).json({
            models
        });
    }
    else{
        res.status(401).json(
           {"errors":[{'message':"Invalid access token"},
        {"valid":false}]
        })
    }
});

router.post('/', function(req, res, next) {
    console.log("setup - body", req.body);
    const data = [{
                "id": 1,
                "url": "http://www.google.com"
            }];
    var bearer_token = req.header("Authorization").split(" ")[1];
    if (bearer_token.length >10){
        res.status(200).json({
            data 
        });
    }
    else{
        res.status(401).json(
           {"errors":[{'message':"Invalid access token"},
        {"valid":false}]
        })
    }
    //res.status(200).json({ data });
});

module.exports = router;