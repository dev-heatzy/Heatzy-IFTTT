//import { error } from 'util';

var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var routes     = require('./routes');
// var oAuth     = require('./o-auth');
// var googleAuth     = require('./google-auth');
var {google} = require('googleapis');
var config = require('./config');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var http = require('http');
var appId = config.heatzy_Id;
var exec = require('child_process').exec
var token_fresh ="blank111";
var state_ifttt = "";
var iftttKey = config.iftttKey
var user_global = "";
var pwd_global = "";
const host = 'euapi.gizwits.com';
const gizwitsAppId = "cbc5a738fc9441859803e3a2f3dbce11";
var ejs = require('ejs');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.engine("html",require("ejs").__express);
//app.engine('html', ejs._express);
//app.set('view engine','html');
// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port

app.get('/', function (req, res) {
    res.send('Hello World!');
});


//Enter to the page of login
app.get('/index',function(req,res){
    res.render('index',{title: 'HTML'});
})
app.get('/login',function(req,res){
    // res.render('login');
     res.render('login', { title: 'IFTTT-Heatzy' });
     state_ifttt = req.query.state;
     console.log(state_ifttt);
    
     //res.redirect(req.query.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.query.state);
     //res.json({ access_token : token_fresh });
     //req.username=username;
    // req.password=passwrd;
     //console.log(username+password);
 });

//get the value of the users' information

app.post('/login',urlencodedParser,function(req,res){
    response = {
        username: req.body.username,
        password: req.body.password
      };
      var client_id = response.username;
      var input_password = response.password;
      user_global = response.username;
      pwd_global = response.password;
      console.log(client_id+input_password);
      // get the access-token by Heatzy APIs

      let path_login = "/api/login";
      //login(client_id,input_password);
      var cmd_login = 'curl -X POST --header \'Content-Type: application/json\' --header \'Accept: application/json\' --header \'X-Gizwits-Application-Id:'+appId+'\' -d \'{ \"username\": \"'+client_id+'\", \"password\": \"'+input_password+'\", \"lang\": \"en\" }\' \'https://euapi.gizwits.com/app/login\'';
      exec(cmd_login, function(err,stdout,stderr){
          
          if(err) {
          
          console.log('the access_token is '+stderr);
          //return stderr;
          
          }
      else{
          console.log('the token is '+stdout);
          //console.log(stdout.split(":",2));
          stdout_spl = stdout.split(" ",2)[1];
          console.log(stdout.split(" ",2)[1]);
          resultat = stdout_spl.split("\"",2)[1];
          console.log(resultat);
          token_fresh = resultat;
          //res.json({ access_token : token_fresh });
          //res.redirect("https://ifttt.com/channels/ifttt_Zijie_test/authorize");
          var code = token_fresh;
          app.get("/oauth/authorize", function(req, res){
    // Just generate a sample username and redirect
    var code = generate_auth_code_for_user("user@test.com");
    res.json({ auth_code : code },{ auth_token : code});

    //res.redirect(req.query.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.query.state);
});
          
          //res.redirect("https://ifttt.com/channels/ifttt_Zijie_test/authorize" + "?code=" + encodeURIComponent(code) + "&state=" + state_ifttt);
          res.redirect("https://ifttt.com/channels/heatzy/authorize" + "?code=" + encodeURIComponent(code) + "&state=" + state_ifttt);
          
          //https://ifttt.com/channels/heatzy/authorize
          //return stderr;
      }
      
  })
      //res.json({ access_token : token_fresh });
      //res(send(login(input_username,input_password)));
});
app.get("/oauth/authorize", function(req, res){
    // Just generate a sample username and redirect
    
    var code = token_fresh;

    res.redirect(req.query.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.query.state);
});

app.post("/oauth/token", function(req, res){
    console.log(req.body);
    switch (req.body.grant_type){
        case "authorization_code":
        console.log(req.body);
        var token_refresh = user_global+"|"+pwd_global;
        res.json({
            token_type : "bearer",
            access_token : token_fresh,
            refresh_token : token_refresh
        }) 
        break;
        case "refresh_token":
        console.log(req.body);
        var refresh = req.body.refresh_token;
        var username = refresh.split('|')[0];
        var password = refresh.split('|')[1];
        let path_login = "/api/login";
        //login(client_id,input_password);
        var cmd_login = 'curl -X POST --header \'Content-Type: application/json\' --header \'Accept: application/json\' --header \'X-Gizwits-Application-Id:'+appId+'\' -d \'{ \"username\": \"'+username+'\", \"password\": \"'+password+'\", \"lang\": \"en\" }\' \'https://euapi.gizwits.com/app/login\''; 
        exec(cmd_login, function(err,stdout,stderr){
            if (err){
                res.status(401).send("password or username invalid")
            }
            else{
                stdout_spl = stdout.split(" ",2)[1];
                console.log(stdout.split(" ",2)[1]);
                resultat = stdout_spl.split("\"",2)[1];
                console.log(resultat);
                var token_new = resultat; 
                res.status(200).json({
                    access_token : token_new,
                    refresh_token : refresh
                })
            }
        })
        break; 
    }
       
    });
    // ****************** END OAUTH SERVER ******************
//app.get('/login',function(req,res){
  //  var code = token_fresh;
    //res.redirect(req.query.redirect_uri + "?code=" + encodeURIComponent(code) + "&state=" + req.query.state);
//})

//function to use login API to login and get the access_token
function login(username,password){
    var cmd_login = 'curl -X POST --header \'Content-Type: application/json\' --header \'Accept: application/json\' --header \'X-Gizwits-Application-Id:'+appId+'\' -d \'{ \"username\": \"'+username+'\", \"password\": \"'+password+'\", \"lang\": \"en\" }\' \'https://euapi.gizwits.com/app/login\'';
    exec(cmd_login, function(err,stdout,stderr){
        
        if(err) {
        
        console.log('the access_token is '+stderr);
        //return stderr;
        
        }
    else{
        console.log('the token is '+stdout);
        //console.log(stdout.split(":",2));
        stdout_spl = stdout.split(" ",2)[1];
        //console.log(stdout.split(" ",2)[1]);
        resultat = stdout_spl.split("\"",2)[1];
        console.log(resultat);
        token_fresh = resultat;
        //res.json({ access_token : token_fresh });
        //return stderr;
    } 
    
})
}
////////////////////////////////////////
//function to get ID of all the devices of a compte by using the API get binding
function getDevicesList(token){
	return new Promise((resolve, reject) => {
		let path = "/app/bindings";
		console.log('API Request: ' + host + path);
		let options={  
		   hostname: host,  
		   path:path,  
		   method:'GET',  
		   headers:{  
		    'Content-Type':'application/x-www-form-urlencoded',  
		    'X-Gizwits-Application-Id':appId, 
		    'X-Gizwits-User-token':token  
		   }  
		};
		http.get(options, (res)=>{
			let body = ''; // var to store the response chunks
			res.setEncoding('utf-8');
  			res.on('data', (d) => { body += d; }); // store each response chunk
  			res.on('end', () => {
  				resolve(body);
  			});	
  			res.on('error', (error) => {
		        reject(error);
		    });
		});
	});
}
//basic function to control all the device of a compte
//we need to get device ID and token before using it
//For the mode : 
// 0 == mode comfort
// 1 == mode eco
// 2 == mode HG
// 3 == mode off
function controlDevice(did, mode, token){
    
        let contents = JSON.stringify({
            attrs:{
                mode:new Number(mode)
            }
        });
        let path = "/app/control/" + did;
        let options = {
             host:host,
            path:path,
            method:'POST',
            headers:{
                'X-Gizwits-Application-Id':gizwitsAppId, 
                'X-Gizwits-User-token':token,  
                'Content-Length':contents.length
            }
        };
        console.log('API POST: ' + host + path + contents);
    
        var req = http.request(options, function(res){
            res.setEncoding('utf8');
            let body = ''; 
            res.on('data',function(data){
               body += data;
            });
            res.on('end', ()=>{
                console.log(body);
            });
            res.on('error', (error)=>{
                console.error(err);
            });
        });
        req.write(contents);
        req.end;
    }
//////////////////////////////////////////
// Web Page to get the list
app.get('ifttt/v1/action/getlist',function(req,res){
    getDevicesList(token_fresh).then((body)=>{
        let response = JSON.parse(body);
        for(var d in response.devices){
            console.log('did: ' + response.devices[d].did);
            console.log('alias: '+ response.devices[d].dev_alias);
            //res.status(200).json({message:'the following are de DID:'+response.devices[d].did})
            //controlDevice(response.devices[d].did, modeInt, token);
            
        }
    }).catch((error) => {
            console.error(error);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
        });
    });


/////////control////////
/////////mode confort///////
////////////////final device conrouller/////////////////////
app.post('/ifttt/v1/actions/total/fields/devices/options',function(req,res){
    var token_confort = req.header("Authorization").split(" ")[1];
    console.log("the token is :"+ token_confort);
    var devicesList = [];
    var nicknameList = [];
    var respOptions = [];
    var data = [];
    var unit =[];
    var devicesList_zone = [];
    var groupeList_zone = [];
    //var respOptions = [];
    var data_zone = [];
    var unit_zone =[];
    var value_zone = [];
    var zone_name = [];
    getDevicesList(token_confort).then((body)=>{
        let response = JSON.parse(body);
        for(var d in response.devices){
            console.log('did: ' + response.devices[d].did);
            console.log('nickname: '+ response.devices[d].dev_alias);
            devicesList[d] = response.devices[d].did;
            
            if (!response.devices[d].dev_alias){
                nicknameList[d] = "defaut";
            }
            else{
            nicknameList[d] = response.devices[d].dev_alias;
            }
            unit = {
                label: nicknameList[d],
                value: response.devices[d].did
            }
            
            respOptions.push(unit);
        }
        if (respOptions.length == 0){
            res.status(401).send(
                { "errors": [
                     {
                       "message": "Token invalid"
                     }
                   ]}
             
                )}
    }).then(()=>{getDevicesList(token_confort).then((body)=>{
        let response = JSON.parse(body);
        for(var d in response.devices){
            console.log('did: ' + response.devices[d].did);
            console.log('group: ' + response.devices[d].remark);
            console.log('group id: ' + response.devices[d].remark)
            devicesList_zone[d] = response.devices[d].did;
            //var value = [];
            var group = response.devices[d].remark.split('|');
            console.log('group array: '+group)
            if (group[1].split("=")[1]==0){
                continue;
            }
            else {
                for(i=0;i<((response.devices.length+2)/2);i++){
                    if (group[1].split("=")[1]==(i+1)){
                        zone_name[i] = group[2].split("=")[1];
                        value_zone[i] = value_zone[i]+"|"+response.devices[d].did
                        //value[i].push(response.devices[d].did)
                    }
                    else{
                        continue;
                    }
                }
            }
            console.log(value_zone);
    }}).then(()=>{
        console.log("value ="+value_zone);
        for(i=0;i<value_zone.length;i++){
            unit_zone = {
                label: zone_name[i],
                value: value_zone[i]
            }
            respOptions.push(unit_zone);
        }
        respOptions.push({
            label: "All",
            value: "ALL"
        })
    }).then(()=>{
    if (token_confort.length>10){
       // console.log("the token confort is" +token_confort)
       // console.log("options :"+respOptions)
        respDevice = {
            data: respOptions
        }
        console.log(JSON.stringify(respDevice));
        res.status(200).json(respDevice)
    }
   /* else{
        res.status(401).json(
            {"errors":[{'message':"Invalid access token"},
        {"valid":false}]
    }
        )
    }*/
    })
})})

app.post('/ifttt/v1/actions/total',function(req,res){
    console.log(req.body);
    var token_total = req.header("Authorization").split(" ")[1];
   // var mode = "";
    //var zones = req.body.actionFields.zones;
    //svar devices = "";
    var devicesList = [];
    var nicknameList = [];
    var respOptions = [];
    var data = [];
    var unit =[];
    getDevicesList(token_total).then((body)=>{
        let response = JSON.parse(body);
        for(var d in response.devices){
            devicesList[d] = response.devices[d].did;
            
            if (!response.devices[d].dev_alias){
                nicknameList[d] = "defaut";
            }
            else{
            nicknameList[d] = response.devices[d].dev_alias;
            }
            unit = {
                label: nicknameList[d],
                value: response.devices[d].did
            }
            
            respOptions.push(unit);
        }
        if (respOptions.length == 0){
            res.status(401).send(
                { "errors": [
                     {
                       "message": "Token invalid"
                     }
                   ]}
             
                )}
    }).then(()=>{
    if (!req.body.actionFields){
        res.status(400).json(
           { "errors":[{'message':'the actionField key missed'}]}
        )
    }
    

    //console.log("mode: "+ mode + "/devices: "+ devices);
    /*else if (token_total.length <10){
        res.status(401).json(
           {"errors":[{'message':"Invalid access token"},
        {"valid":false}]
        })
    }*/
    else if (!req.body.actionFields.devices){
        res.status(400).json(
            {"errors":[{'message':"Please choose the devices"}
        ]}
        )
    }
    else if (!req.body.actionFields.modes){
        res.status(400).json(
            {"errors":[{'message':"Please choose the mode"}]}
        )
    }
    else{
        var mode = req.body.actionFields.modes;
        //var zones = req.body.actionFields.zones;
        var devices = req.body.actionFields.devices;

        res.status(200).json({
            "data": [{"id":"0"}]
        })    
    if (devices.length>25){
        var devices_value = devices.split("|");
        var device =[];
        for (i=0;i<devices_value.length-1;i++){
            device[i] = devices_value[i+1];
            console.log(device[i]);
            controlDevice(device[i], mode, token_total);
        }
    }
    if (devices.length<25){
        controlDevice(devices, mode, token_total)
    }

    if (devices=="ALL"){
        getDevicesList(token_total).then((body)=>{
            let response = JSON.parse(body);
            for(var d in response.devices){
                console.log('did: ' + response.devices[d].did);
                //res.status(200).json({message:'the following are de DID:'+response.devices[d].did})
                controlDevice(response.devices[d].did, 0, token_total);
                
            }
        })
    }}
})


    
})

// ****************** YOU WILL NEED TO IMPLEMENT SOMETHING LIKE THIS ******************
app.get("generate_oauth_code", function(req, res){
    
        if(!req.query.access_token)
        {
            return res.json(400, {error:"Missing 'access_token' query parameter"});
        }
    
    
        res.json({ auth_code : token_fresh });
    });
// ****************** END MOBILE APP API *****************
// ****************** START OAUTH SERVER ******************


// Our standard OAuth token exchange endpoint. We'll take a code that was generated previously in the /generate_oauth_code endpoint
/*app.post("/oauth/token", function(req, res){
    console.log('the token right now is :'+token_fresh)

    if (token_fresh.length <10){
        return res.json(401,{error:'Invalide access token'})
    }
    else {
        res.json({
            token_type : "bearer",
            access_token : token_fresh
        }); 
    }

    // Re-encrypt our username as the app OAuth access token
    
});*/
// ****************** END OAUTH SERVER ******************

// ****************** START IFTTT API ******************
app.get("/ifttt/v1/user/info", function(req, res){

    var bearer_token = req.header("Authorization").split(" ")[1];
    if (bearer_token.length >10){
        res.status(200).json({
            "data": {
                "name" : "username",
                "id" : "username"
            } 
        });
    }
    else{
        res.status(401).json(
           {"errors":[{'message':"Invalid access token"},
        {"valid":false}]
        })
    }
});

app.post("/ifttt/v1/test/setup",function(req,res){
    var serviceKey = req.get("IFTTT-Service-Key");
    // var channelKey = req.get("IFTTT-Channel-Key");
    console.log("Status check - serviceKey", serviceKey);
    if(serviceKey === iftttKey) {
        //next();
        res.status(200).json({ "data" : {"accessToken" : token_fresh, "samples": {
        "actions" :{
            "total" : {
                "devices" :{
                "id" : "Salon",
                "value" : "4ymbiAKoE4RmtLNt5kEFaD"},
                "modes" : "0"
            },
        }
        },
         "status" : "success"} });
    }
    else {
        const errors = [{
            "message": "Invalid channel key!"
        }];
        res.status(401).json({ errors });
    }
    //res.status(200).json({ "data" : {"accessToken" : token_fresh,  "status" : "success"} })
})
// ****************** END IFTTT API ******************
///////////end//////////

app.use('/ifttt/v1', routes);
/*app.get('/user/info',function(req,res){
    var cmd_getUser = 'curl -X GET --header \'Accept: application/json\' --header \'X-Gizwits-Application-Id:'+appId+'\' --header \'X-Gizwits-User-token:'+token_fresh+'\' \'https://euapi.gizwits.com/app/users\''
    exec(cmd_getUser, function(err,stdout,stderr) {
        if(err){
            console.log('err is '+stderr);
            res.status(401).json({message:'the access token is invalided'});
            
        }
        else{
            //console.log(stdout);
            console.log(cmd_getUser);
            res.status(200).json({message:'the access token is valided'});
        }
    })
}
) */
    


// START THE SERVER
// =============================================================================
app.listen(80);
console.log('Magic happens on port ' + port);


module.exports.token_fresh = token_fresh;