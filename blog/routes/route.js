var moment = require('moment');

var alert = require('alert-node');

var mysql_dbc = require('../DB/db')();
var connection = mysql_dbc.init();

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorHandler');

var signUp = function(req, res){
    console.log('회원가입 실행됨');

    var createTime = moment().format("YYYY-MM-DD HH:mm:ss");

    var users = {
        "id": req.body.id || req.query.id,
        "password": req.body.password || req.query.password,
        "name": req.body.name || req.query.name,
        "email": req.body.email || req.query.email,
        "createdTime": createTime
    }

    var password_check = req.body.password_check || req.query.password_check

    if(users.password != password_check){
        alert('잘못된 비밀번호');
    }
    else{
        connection.query('INSERT INTO users SET ?;', users, function(error, results, fields){
            if(error){
                console.log("error ocurred", error);
                res.send({
                    "code": 400,
                    "failed": "error ocurred"
                })
            }
            else{
                for(var i = 0; i<results.length; i++){
                    console.log('저장된 유저 정보: ' + results[i]);
                }
                res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
                res.write('<h1>회원가입 성공</h1>');
                res.write('<a href="../public/login.html">로그인 화면으로 이동</a>');
                res.end();
            }
        })
    }
}

var login = function(req, res){
    console.log('로그인 실행됨');

    var users = {
        "id": req.body.id || req.query.id,
        "password": req.body.password || req.query.password
    }

    var sql = "SELECT * FROM users;";
    connection.query(sql, function(err, results, fields){
        for(var i = 0; i<results.length; i++){
            if(results.id[i] == users.id && results.password[i] == users.password){
                    req.session.user = {
                        id: id,
                        name: results.name[i],
                        authorized: true //근데 이건 뭐하는 거?
                    }
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h1>로그인 성공</h1>');
                    res.write('<p>id:'+id+'</p>');
                    res.lwrite('<p>name:'+name+'</p>');
                    res.end();
                }
                else{
                    alert("아이디 혹은 비밀번호가 틀렸습니다");
            }
        }
    })
}

module.exports.signUp = signUp;
module.exports.login = login; //미완성