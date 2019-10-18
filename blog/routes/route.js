var moment = require('moment');
var app = require('express');
var alert = require('alert-node');

var mysql_dbc = require('../DB/db')();
var connection = mysql_dbc.init();

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
        alert('잘못된 비밀번호입니다.');
    }
    else{
        var select_sql = 'SELECT * FROM users WHERE id=?;';
        connection.query(select_sql, [users.id], function(err, results){
            console.log(results[0].id);
            if(err){
                console.log("error ocurred", err);
                res.send({
                    "code": 400,
                    "failed": "error ocurred"
                })
            }
           
            if(results[0].id.length > 0){
                alert('동일한 아이디가 존재합니다.');
            }
            
            else{
                var select_sql2 = 'SELECT * FROM users WHERE email=?;';
                connection.query(select_sql2, [users.email], function(err, results){
                    if(err){
                        console.log("error ocurred", err);
                        res.send({
                            "code": 400,
                            "failed": "error ocurred"
                        })
                    }

                    if(users.email == results[0].email){
                            alert('동일한 이메일이 존재합니다.');
                        }

                    else{
                        var insert_sql = 'INSERT INTO users SET ?;';
                        connection.query(insert_sql, users, function(err, results){
                            if(err){
                                console.log("error ocurred", err);
                                res.send({
                                    "code": 400,
                                    "failed": "error ocurred"
                                })
                            }

                            else{
                                res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
                                res.write('<h1>회원가입 성공</h1>');
                                res.write('<a href="../public/login.html">로그인 화면으로 이동</a>');
                                res.end();
                            }
                        }) 
                    }
                })            
            }
        })
        connection.end();
    }
}

var login = function(req, res){
    console.log('로그인 실행됨');

    var users = {
        "id": req.body.id || req.query.id,
        "password": req.body.password || req.query.password
    }

    var sql = "SELECT * FROM blog.users WHERE id=?;";
    connection.query(sql, users.id, function(err, results, fields){
        if(err){
            console.log(err);
        }
        else{
            if(results[0].id == users.id && results[0].password == users.password){
                    req.session.user = {
                        id: results.id,
                        name: results.name,
                        authorized: true
                    }
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h1>로그인 성공</h1>');
                    res.write('<p>id:' + results[0].id + '</p>');
                    res.write('<p>name:' + results[0].name + '</p>');
                    res.end();
                }

            else if(req.session.user){
                alert('이미 로그인되어 있습니다.');
                }

            else{
                alert("아이디 혹은 비밀번호가 틀렸습니다");
            }        
        }
    })
}

const logout = function(req, res){
    console.log('로그아웃 실행됨');
    if(req.session.user){
        req.session.destroy(function (err){
            if(err){
                console.log(err);
            }
            alert('로그아웃 완료');
            res.redirect('/public/login.html');
        })
    }
    else{
        alert('아직 로그인되어 있지 않습니다.');
        res.redirect('/public/login.html');
    }
}

module.exports.signUp = signUp;
module.exports.login = login;
module.exports.logout = logout;