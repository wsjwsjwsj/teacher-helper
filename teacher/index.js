var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var moment = require('moment');
var cookieParser = require('cookie-parser');    
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
    return token;
}

function getTeacherInfo(teacherid, token, res){
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	request('https://api.mysspku.com/index.php/V2/TeacherInfo/getDetail?teacherid='+teacherid+'&token='+token, function(err, ress, data){
		var teacher;
		if(err)
			console.log(err);
        var result = JSON.parse(data);
        console.log(result);
        if(result.errcode == 0){
        	teacher = result.data;
        	res.render('teacherInfo',{
        			title: "个人信息",
        			teacher: teacher,
        			img: '<img class="am-thumbnail" id="photo" name="photo" src="'+ teacher.imgurl +'" style="height:160px;width:100% auto;"></img>'
        		}); 
        }    
    });  
      
}

function getStudentInfo(teacherid, token, res){
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    request('https://api.mysspku.com/index.php/V2/TeacherInfo/getStudents?teacherid='+teacherid+'&token='+token, function(err, ress, data){
		var students;
		if(err)
			console.log(err);
        var result = JSON.parse(data);
        if(result.errcode == 0){
        	students = result.data.students;
        	//console.log(students);
        	res.render('student',{
        			students: students
        		}); 
        }    
    });  
}

app.get('/student',function(req,res){
    if(req.session.user){
    	console.log(req.session.user);
    	req.session.user.UserId = '12154545';
    	getStudentInfo(req.session.user.UserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
    }     
    else{ 
    	var code = req.query.code;
        request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+getToken().access_token+'&code=' + code, function(err, ress, data){
            if(!JSON.parse(data).errcode){
                req.session.user = JSON.parse(data);       
                console.log(req.session.user);
                req.session.user.UserId = '12154545'; 
                getStudentInfo(req.session.user.UserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
            }   
           else{
           }
        });
        
        } 
   });

app.get('/teacher',function(req,res){
    if(req.session.user){
    	console.log(req.session.user);
    	req.session.user.UserId = '12154545';
    	getTeacherInfo(req.session.user.UserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
    }
    else{
    	var code = req.query.code;
        request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+getToken().access_token+'&code=' + code, function(err, ress, data){
            if(!JSON.parse(data).errcode){
                req.session.user = JSON.parse(data); 
                console.log(req.session.user);
                req.session.user.UserId = '12154545'; 
                getTeacherInfo(req.session.user.UserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
            }   
            else{
            }
        }); 
       
        }

   });

app.listen(3000,function(req,res){
       console.log("app is running at port 3000");
   });
