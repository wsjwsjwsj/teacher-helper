var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var moment = require('moment');
var cookieParser = require('cookie-parser');    //导入中间件
var request = require('request');
var fs = require('fs');

var app = express();

app.use(cookieParser('wsj'));    

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
   secret:'123',
   name:'user',
   cookie:{maxAge:1000*60*60},
   resave:false,
   saveUninitialized:true
}));


app.get('/',function(req,res){
    if(req.session.user)     
       return res.redirect('/user'); 
    var code = req.query.code;
        request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+getToken().access_token+'&code=' + code, function(err, ress, data){
           if(!JSON.parse(data).errcode){
             req.session.user = JSON.parse(data);       
           return res.redirect('/user');  
                 
           }   
           else{

           }

         }); 

   });

app.get('/user',function(req,res){
       console.log(req.session.user);
       res.render('student',{});
   });

function getToken(){
    var token;
    if(fs.existsSync('token.dat')){
      token = JSON.parse(fs.readFileSync('token.dat'));
    }

    if(!token || token.timeout < Date.now()){
      request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wx1d3765eb45497a18&corpsecret=9CFgKICkBIL5L1iKzzPd1XcThRkPc3lLeTa9Cm5hQ1q3Xm_YBL0rut-oMzvM4PN-', function(err, res, data){
        var result = JSON.parse(data);
        result.timeout = Date.now() + 7200;
        fs.writeFileSync('token.dat', JSON.stringify(result));
        token = result;
      });      
    }
   // console.log(token);
    return token;
}

app.listen(3000,function(req,res){
       console.log("app is running at port 3000");
   });
