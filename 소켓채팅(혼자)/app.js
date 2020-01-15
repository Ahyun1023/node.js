const http = require('http');
const express = require('express');
const static = require('serve-static');
const socket = require('socket.io');
const path = require('path');

const multer = require('multer');
const fs = require('fs');

const mysql_dbc = require('./db/db')();
const connection = mysql_dbc.init();

const socket_route = require('./routes/chat');
const img_route = require('./routes/img_route');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));

app.use('/js', express.static('./public/js'));
app.use('/css', express.static('./public/css'));

const server = http.createServer(app);
const io = socket(server);

const storage = multer.diskStorage({
    destination : function(req, file, callback){
        callback(null, 'uploads')
    },
    filename : function(req, file, callback){
        callback(null, file.originalname);
    }
});

const upload = multer({
    storage : storage,
    limits: {
        files : 10,
        fileSize : 1024 * 1024 * 1024
    }
});

const onUser = [];

io.sockets.on('connection', function(socket){
    socket.on('newUser', function(name){
        if(!name){
            io.sockets.emit('nullName');
        }
        socket.name = name;
        
        let sql = "SELECT name FROM users WHERE name=?";
        connection.query(sql, socket.name, function(err, results){
            if(err){
                console.log(err);
            }

            if(results.length != 0 && socket.name){//입력된 이름이 db에 있을 때
                onUser.push(socket.name);
                io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: socket.name+'님이 접속하셨습니다.'});
            }

            else if(results.length == 0 && socket.name){ //입력된 이름이 db에 없을 때
                context = {
                    id: socket.id,
                    name: socket.name
                }
                sql = 'INSERT INTO users SET ?';
                connection.query(sql, context, function(err, results){
                    if(err){
                        console.log(err);
                    }
                    onUser.push(socket.name);
                    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: '새로운 유저, '+socket.name+'님이 접속하셨습니다.'});

                    connection.end();
                })
            } 
        }) 
    })

    socket.on('message', function(data){
        console.log(data);
        data.name = socket.name;

        if(data.message.indexOf('/s') != -1){
            let start = data.message.indexOf('(');
            let end = data.message.indexOf(')', start+1);
            let other_name = data.message.substring(start+1, end); //괄호 안의 문자열을 찾음 (이름)

            let sql = 'SELECT id FROM users WHERE name=?';
            connection.query(sql, other_name, function(err, results){
                if(err){
                    console.log(err);
                }

                if(results == 0){
                    io.to(socket.id).emit('update', {type: 'message', name:'SERVER', message: other_name + '이라는 이름이 존재하지 않습니다.'});
                }
                else if(asdf){ //이미지가 포함되어 있을 때... app.post를 시키고 그렇게 받은 url을 broadcast를 시키고 app.get으로 이미지를 띄우라는데... 할 수 있을지...!

                }

                else{
                    io.to(results[0].id).emit('update', data);
                }
            })
        }
        else{
            socket.broadcast.emit('update', data);
        }
    })

    socket.on('disconnect', function(){
        onUser.splice(onUser.indexOf(socket.name), 1);
        console.log(onUser);

        io.sockets.emit('update', {type: 'disconnect', name:'SERVER', message: socket.name + '님이 퇴장하셨습니다.'});
    })
})

server.listen(app.get('port'), function(){
    console.log('서버시작했지롱~');
})
