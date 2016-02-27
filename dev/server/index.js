var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//set chat history log file
var fs = require('fs');
var filePath = __dirname+"/../client/chat-log.txt";

var utils = require('./utils/utils.js');
var socketHandler = require('./handlers/socketHandler.js');
var adminHandler = require('./handlers/adminHandler.js');
var msgHandler = require('./handlers/msgHandler.js');
var fileHandler = require('./handlers/fileHandler.js');
var usernameHandler = require('./handlers/usernameHandler.js');

//set timeout, default is 1 min
//io.set("heartbeat timeout", 3*60*1000);

//set which port this app runs on
var port = 4321;


var totalUsers = 0;
var totalSockets = 0;
var totalMsg = 0;
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing

// allow ajax request from different domain, you can comment it out if you don't want it
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// serve the client folder 
app.use(express.static(__dirname + '/../client'));



// Chatbox



io.on('connection', function (socket) {


    adminHandler.log('New socket connected!');
    adminHandler.log('socket.id: '+ socket.id);
    socketHandler.socketConnected(socket);

    adminHandler.log("socket.ip: " + socket.remoteAddress);
    

    // once the new user is connected, we ask him to tell us his name
    // tell him how many people online now
    // TODO: may not need to say welcome when it's his second third connection
    socket.emit('login', {
        numUsers: socketHandler.getUserCount()
    });



    // once a new client is connected, this is the first msg he send
    // we'll find out if he's a new user or existing one looking at the cookie uuid
    // then we'll map the user and the socket
    socket.on('login', function (data) {


        var newUser = false;

        newUser = socketHandler.socketJoin(socket, data.url, data.referrer, data.uuid, data.username);

        var user = socket.user;
        adminHandler.log(user.username + ' logged in ('+(user.socketIDList.length) +').');

        // the user already exists, this is just a new connection from him
        if (!newUser) {

            // welcome the new user
            socket.emit('welcome new user', {
                numUsers: socketHandler.getUserCount()
            });

            // echo to others that a new user just joined
            socket.broadcast.emit('user joined', {
                username: user.username,
                numUsers: socketHandler.getUserCount()
            });

        } else {

            // force sync all user's client side usernames
            socket.emit('welcome new connection', {
                username: socket.user.username
            });

        }

    });

    // when the socket disconnects
    socket.on('disconnect', function () {
        
        socketHandler.socketDisconnected(socket);

        // the user only exist after login
        if (!socket.joined)
            adminHandler.log('Socket disconnected before logging in, sid: ' + socket.id);
        else
            adminHandler.log(socket.user.username + ' closed a connection ('+(socket.user.socketIDList.length)+').');

    });

    // this is when one user wants to change his name
    // enforce that all his socket connections change name too
    socket.on('user edits name', function (data) {

        usernameHandler.userEditName(io, socket, data.newName);

    });

    socket.on('report', function (data) {

        adminHandler.log(socket.user.username + ": " + data.msg);

    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {

        msgHandler.receiveMsg(socket, data.msg);

        io.sockets.emit('new message', {//send to everybody including sender
            username: socket.user.username,
            message: data.msg
        });

    });

    socket.on('base64 file', function (data) {

        adminHandler.log('received base64 file from ' + socket.user.username);

        fileHandler.receiveFile(socket, data.file, data.fileName);

        io.sockets.emit('base64 file',

            {
              username: socket.user.username,
              file: data.file,
              fileName: data.fileName
            }

        );

    });

/*
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function (data) {

        socket.broadcast.emit('typing', {
            username: socket.user.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function (data) {
    
        socket.broadcast.emit('stop typing', {
            username: socket.user.username
        });
    });
*/


    // for New Message Received Notification callback
    socket.on('reset2origintitle', function (data) {
        var socketsToResetTitle = socket.user.socketIDList;
        for (var i = 0; i< socketsToResetTitle.length; i++) 
            socketHandler.getSocket(socketsToResetTitle[i]).emit('reset2origintitle', {});
        
    });



    //==========================================================================
    //==========================================================================
    // code below are for admin only, so we always want to verify token first
    //==========================================================================
    //==========================================================================


    // admin change visitor's username
    socket.on('admin change username', function (data) {

        if(adminHandler.validToken(data.token)) {

            usernameHandler.adminEditName(io, data.userID, data.newName);

        }

    });

    socket.on('getServerStat', function (data) {
        adminHandler.getServerStat(socket, data.token);
    });

    // send script to target users
    socket.on('script', function (data) {

        adminHandler.sendScript(io, data.token, data.userKeyList, data.socketKeyList, data.script);

    });

    // send real time data statistic to admin
    // this callback is currently also used for admin authentication
    socket.on('getUserList', function (data) {
        adminHandler.getUserData(socket, data.token);

    });


});
