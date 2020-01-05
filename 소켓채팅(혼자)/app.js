const http = require('http');
const express = require('express');
const static = require('serve-static');
const socket = require('socket.io');
const path = require('path');

const mysql_dbc = require('./db/db')();
const connection = mysql_dbc.init();

const socket_route = require('./routes/chat');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));

app.use('/js', express.static('./public/js'));
app.use('/css', express.static('./public/css'));

const server = http.createServer(app);
const io = socket(server);

/*const router = express.Router();
app.use('/', router);*/

const onUser = [];
let currentUser = 0;

io.sockets.on('connection', function(socket){
    socket.on('newUser', function(name){
        socket.name = name;
        
        let sql = "SELECT name FROM users WHERE name=?";

        connection.query(sql, socket.name, function(err, results){
            if(err){
                console.log(err);
            }
            else{ //입력된 이름이 접속된 이름과 같을 때 
                for(var i=0; i<onUser.length; i++){
                    if(onUser[i] == socket.name){
                        io.sockets.emit('error');
                        break;
                    }
                }

                if(!name){//이름이 입력되지 않았을 때
                    io.sockets.emit('nullName');
                }

                else if(results.length != 0){//입력된 이름이 db에 있을 때
                    onUser.push(socket.name);
                    currentUser++;
                    console.log(currentUser);
                    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: socket.name+'님이 접속하셨습니다.'});
                }

                else{ //입력된 이름이 db에 없을 때
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
                        currentUser++;
                        console.log(currentUser);
                        io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: '새로운 유저, '+socket.name+'님이 접속하셨습니다.'});

                        connection.end();
                    })
                }
            }  
        }) 
    })

    socket.on('message', function(data){
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
                // console.log(results[0].id);
                // let info = io.sockets.connected[results[0].id];
                // console.log(info);

                if(results == 0){
                    io.to(socket.id).emit('update', {type: 'message', name:'SERVER', message: other_name + '이라는 이름이 존재하지 않습니다.'});
                }
                // else if(!io.sockets.connected[results[0].id]){
                //     io.to(socket.id).emit('update', {type: 'message', name:'SERVER', message: other_name + '님은 접속상태가 아닙니다.'});
                // }
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
        onUser.splice(socket.name, 1);
        currentUser--;
        io.sockets.emit('update', {type: 'disconnect', name:'SERVER', message: socket.name + '님이 퇴장하셨습니다.'});
    })
    
})

server.listen(app.get('port'), function(){
    console.log('서버시작했지롱~');
})