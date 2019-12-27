const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');

const socket = require('socket.io');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));
app.use('/js', express.static('./public/js'));
app.use('/css', express.static('./public/css'));

const server = http.createServer(app);
const io = socket(server);

io.sockets.on('connection', function(socket){
    socket.on('newUser', function(name){
        socket.name = name;
        io.sockets.emit('update', {type:'connect', name:'SERVER', message: socket.name + '님이 접속했습니다.'});
    })
    socket.on('message', function(data){
        data.name = socket.name;
        socket.broadcast.emit('update', data);
    })

    socket.on('disconnect', function(){
        io.sockets.emit('update', {type:'disconnect', name:'SERVER',message: socket.name + '님이 퇴장하셨습니다.'});
    })
})

server.listen(app.get('port'), function(){
    console.log('서버시작했다리~');
})