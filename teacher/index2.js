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

function getStudentInfo(token, res){
    var students =[{"stuid":"1601210452","name":"王强", "pinyin":"wang qiang","gender":"男","grade":"2016"}, 
        {"stuid":"1501210654","name":"李四", "pinyin":"li si","gender":"女","grade":"2015"},
        {"stuid":"1401211023","name":"张三", "pinyin":"zhang san","gender":"男","grade":"2014"},
        {"stuid":"1301210994","name":"王二", "pinyin":"wang er","gender":"女","grade":"2013"},
        {"stuid":"1201210124","name":"李杰", "pinyin":"li jie","gender":"男","grade":"2012"},
        {"stuid":"1101210548","name":"赵云", "pinyin":"zhao yun","gender":"女","grade":"2011"},
        {"stuid":"1001211994","name":"曹洁", "pinyin":"cao jie","gender":"男","grade":"2010"},
        {"stuid":"0901209843","name":"王强", "pinyin":"wang qiang","gender":"男","grade":"2009"},
        {"stuid":"1601210987","name":"王国强", "pinyin":"wang guo qiang","gender":"男","grade":"2016"}, 
        {"stuid":"1501210512","name":"高梅", "pinyin":"gao mei","gender":"女","grade":"2015"},
        {"stuid":"1401210270","name":"赵子龙", "pinyin":"zhao zi long","gender":"男","grade":"2014"},
        {"stuid":"1301210010","name":"闫晓宇", "pinyin":"yan xiao yu","gender":"女","grade":"2013"},
        {"stuid":"1201210410","name":"诸葛云", "pinyin":"zhu ge yun","gender":"男","grade":"2012"},
        {"stuid":"1101210800","name":"李雯", "pinyin":"li wen","gender":"女","grade":"2011"},
        {"stuid":"1001211324","name":"曹冰清", "pinyin":"cao bing qing","gender":"女","grade":"2010"},
        {"stuid":"0901209110","name":"钱浩", "pinyin":"qian hao","gender":"男","grade":"2009"},
        {"stuid":"1601210123","name":"孙阳", "pinyin":"sun yang","gender":"男","grade":"2016"}, 
        {"stuid":"1501210567","name":"周星", "pinyin":"zhou xin","gender":"女","grade":"2015"},
        {"stuid":"1401211009","name":"吴雄", "pinyin":"wu xiong","gender":"男","grade":"2014"},
        {"stuid":"1301210007","name":"郑小倩", "pinyin":"zheng xiao qian","gender":"女","grade":"2013"},
        {"stuid":"1201210213","name":"令狐冲", "pinyin":"ling hu chong","gender":"男","grade":"2012"},
        {"stuid":"1101210888","name":"东方不败", "pinyin":"dong fang bu bai","gender":"女","grade":"2011"},
        {"stuid":"1001210101","name":"陈晨", "pinyin":"chen chen","gender":"男","grade":"2010"},
        {"stuid":"0901210555","name":"姚山", "pinyin":"yao shan","gender":"男","grade":"2009"}];
    res.render('studentInfo',{
        students: students
    }); 
}    

function getDetail(stuid, token, ress){
    var studentDetail = {};
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    request('https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid='+stuid+'&token='+token, function(err, res, data){
        if(err)
            console.log(err);
        var result1 = JSON.parse(data);
        if(result1.errcode == 0){
            studentDetail.detail = result1.data;
            getPaperProposal(studentDetail, stuid, token, ress);
        }    
    });
}

function getPaperProposal(studentDetail, stuid, token, ress){

    request('https://api.mysspku.com/index.php/V2/StudentInfo/getPaperProposal?stuid='+stuid+'&token='+token, function(err, res, data){
        if(err)
            console.log(err);
        var result2 = JSON.parse(data);
        if(result2.errcode == 0){
            studentDetail.paper = result2.data;
            getPaperProcess(studentDetail, stuid, token, ress);
        }    
    });
}

function getPaperProcess(studentDetail, stuid, token, ress){
    request('https://api.mysspku.com/index.php/V2/StudentInfo/getPaperProcess?stuid='+stuid+'&token='+token, function(err, res, data){
        if(err)
            console.log(err);
        var result3 = JSON.parse(data);
        if(result3.errcode == 0){
            studentDetail.paperPass = result3.data;
            getInternInfo(studentDetail, stuid, token, ress);
        }    
    });
}

function getInternInfo(studentDetail, stuid, token, ress){
    request('https://api.mysspku.com/index.php/V2/StudentInfo/getInternInfo?stuid='+stuid+'&token='+token, function(err, res, data){
        if(err)
            console.log(err);
        var result4 = JSON.parse(data);
        if(result4.errcode == 0){
            studentDetail.intern = result4.data;
            getJobInfo(studentDetail, stuid, token, ress);
        }    
    });
 }    

 function getJobInfo(studentDetail, stuid, token, ress){
    request('https://api.mysspku.com/index.php/V2/StudentInfo/getJobInfo?stuid='+stuid+'&token='+token, function(err, res, data){
        if(err)
            console.log(err);
        var result5 = JSON.parse(data);
        if(result5.errcode == 0){
            studentDetail.job = result5.data;
            getFamily(studentDetail, stuid, token, ress);
        }    
    });
}

function getFamily(studentDetail, stuid, token, ress){
    request('https://api.mysspku.com/index.php/V2/StudentInfo/getFamily?stuid='+stuid+'&token='+token, function(err, res, data){
        if(err)
            console.log(err);
        var result6 = JSON.parse(data);
        if(result6.errcode == 0){
            studentDetail.family = result6.data;

         console.log(studentDetail);
         ress.json(studentDetail); 
        }    
    });
    //console.log(Json.parse(studentDetail);
    //ress.json(studentDetail);   
}

app.get('/student',function(req,res){
    if(req.session.user){
    	console.log(req.session.user);
    	getStudentInfo('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
    }     
    else{ 
    	var code = req.query.code;
        request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+getToken().access_token+'&code=' + code, function(err, ress, data){
            if(!JSON.parse(data).errcode){
                req.session.user = JSON.parse(data);       
                console.log(req.session.user); 
                getStudentInfo('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
            }   
           else{}
            });
        } 
   });

app.get('/student/:id',function(req,res){
    //console.log(getDetail(req.params.id, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
    getDetail(req.params.id, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', res);
   });

app.listen(3000,function(req,res){
       console.log("app is running at port 3000");
   });
