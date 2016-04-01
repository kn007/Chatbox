"use strict";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);



var roomHandler = require('./handlers/roomHandler.js');
var socketHandler = require('./handlers/socketHandler.js');
var adminHandler = require('./handlers/adminHandler.js');
var msgHandler = require('./handlers/msgHandler.js');
var fileHandler = require('./handlers/fileHandler.js');
var usernameHandler = require('./handlers/usernameHandler.js');

//set timeout, default is 1 min
//io.set("heartbeat timeout", 3*60*1000);

//set which port this app runs on
var port = 4321;

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

var inProdDir = __dirname.indexOf("prod") > -1;

if (inProdDir)
    console.log('Running in prod directory');
else
    console.log('Running in dev directory');

app.get('/admin', function (req, res) {

    if(inProdDir)
        res.redirect('/admin.html');
    else
        res.redirect('/controlpanel/views/');

});

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
            
        var roomID = roomHandler.socketJoin(socket, data.roomID);

        var user = socket.user;

        if (newUser) {


            // ensure username unique in same chat room
            usernameHandler.registerUniqueName(user, user.username);
            

            //TODO: if the username distributed to user from server is different from the client one
            // we need to tell the client to update local name

            // welcome the new user
            socket.emit('welcome new user', {
                username: user.username,
                // numUsers: socketHandler.getUserCount() // this should be user count in same room
                onlineUsers: usernameHandler.getNamesInRoom(roomID) 
            });

            // echo to others that a new user just joined
            io.in(roomID).emit('user joined', {
                username: user.username,
                // numUsers: socketHandler.getUserCount() // this should be user count in same room
            });

            adminHandler.log(user.username + ' joined in room ' + roomID);


        } else {

            // the user already exists, this is just a new connection from him
            // force sync all user's client side usernames
            socket.emit('welcome new connection', {
                username: user.username,
                // numUsers: socketHandler.getUserCount(), // this should be user count in same room
                onlineUsers: usernameHandler.getNamesInRoom(roomID)

            });

            adminHandler.log(user.username + ' logged in ('+(user.socketIDList.length) +').', user.roomID);

        }

    });

    // when the socket disconnects
    socket.on('disconnect', function () {
        
        var lastConnectionOfUser = socketHandler.socketDisconnected(socket);

        // the user only exist after login
        if (!socket.joined)
            adminHandler.log('Socket disconnected before logging in, sid: ' + socket.id);
        else
            adminHandler.log(socket.user.username + ' closed a connection ('+(socket.user.socketIDList.length)+').', socket.user.roomID);

        if (lastConnectionOfUser) {

            usernameHandler.releaseUsername(socket.user.roomID, socket.user.username);
            roomHandler.leftRoom(socket.user);

            io.in(socket.user.roomID).emit('stop typing', { username: socket.user.username });

            io.in(socket.user.roomID).emit('user left', {
                username: socket.user.username,
                numUsers: socketHandler.getUserCount()
            });
        }

    });

    // this is when one user wants to change his name
    // enforce that all his socket connections change name too
    socket.on('user edits name', function (data) {


        var user = socket.user;
        var oldName = user.username;

        if (oldName === data.newName) 
            return;

        usernameHandler.userEditName(socket, data.newName);

        io.in(user.roomID).emit('log change name', {
            username: user.username,
            oldname: oldName
        });

        adminHandler.log(oldName + ' changed name to ' + user.username, socket.user.roomID);

    });


    socket.on('report', function (data) {

        adminHandler.log(socket.user.username + ": " + data.msg, socket.user.roomID);

    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {

        io.in(socket.user.roomID).emit('new message', {//send to everybody including sender
            username: socket.user.username,
            message: data.msg
        });
        msgHandler.receiveMsg(socket, data.msg);
        roomHandler.newMsg(socket.user.roomID);

    });

    socket.on('base64 file', function (data) {

        adminHandler.log('received base64 file from ' + socket.user.username, socket.user.roomID);

        fileHandler.receiveFile(socket, data.file, data.fileName);

        io.in(socket.user.roomID).emit('base64 file',

            {
              username: socket.user.username,
              file: data.file,
              fileName: data.fileName
            }

        );

    });


    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function (data) {

        io.in(socket.user.roomID).emit('typing', { username: socket.user.username });

    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function (data) {
    
        io.in(socket.user.roomID).emit('stop typing', { username: socket.user.username });

    });

    // for New Message Received Notification callback
    socket.on('reset2origintitle', function (data) {
        if (!socket.joined) return;
        var socketsToResetTitle = socket.user.socketIDList;
        for (var i = 0; i< socketsToResetTitle.length; i++) 
            socketHandler.getSocket(socketsToResetTitle[i]).emit('reset2origintitle', {});
        
    });


    //============================================================================================
    //============================================================================================
    //   code below are for admin only, so we always want to verify token first in adminHandler
    //============================================================================================
    //============================================================================================


    // admin change visitor's username
    socket.on('admin change username', function (data) {

        adminHandler.adminChangeUsername(io, data.token, data.userID, data.newName);

    });

    socket.on('getServerStat', function (data) {

        adminHandler.getServerStat(socket, data.token);
        
    });

    // send script to target users
    socket.on('admin command', function (data) {

        adminHandler.sendCommand(io, data.token, data.userKeyList, data.socketKeyList, data.type, data.content);

    });

    // send real time data statistic to admin
    // this callback is currently also used for admin authentication
    socket.on('getUserList', function (data) {

        adminHandler.getUserData(socket, data.token);

    });


});
