// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//set chat history log file
var fs = require('fs');
var filePath = __dirname+"/public/chat-log.txt";

//set timeout, default is 1 min
//io.set("heartbeat timeout", 3*60*1000);

//set which port this app runs on
var port = 4321;
//set admin password
var token = "12345";
//set 1 if you using reverse proxy
var using_reverse_proxy = 0;


var socketList = [];
// users are grouped by browser base on cookie's uuid implementation,
// therefore 1 connection is the smallest unique unit and 1 user is not.
// 1 user may contain multiple connections when he opens multiple tabs in same browser.
var userDict = {};
var userCount = 0;

var adminUser;

var chatboxUpTime = (new Date()).toString();
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

// server the public folder
app.use(express.static(__dirname + '/public'));



// Chatbox

// log to console, if admin is online, send to admin as well
function log(str) {
    console.log(str);
    if (adminUser && adminUser.id in userDict) {
        for(var i = 0; i < adminUser.socketList.length; i++) {
            var s = adminUser.socketList[i];
            s.emit('server log', {log: str});
        }
    }
}

// set username, avoid no name
function setName(name) {

    if (typeof name != 'undefined' && name!=='')
        return name;
    return "no name";
}


function getCookie(cookie, cname) {
    var name = cname + "=";
    var ca = cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
}

function getTime() {
    return (new Date()).getTime().toString();
}

function recordActionTime(socket, msg) {
    socket.lastActive = getTime();
    socket.user.lastActive = socket.lastActive;
    if(msg){
        socket.lastMsg = msg;
        socket.user.lastMsg = msg;
    }
}



io.on('connection', function (socket) {

    totalSockets++;

    var defaultUser = {};
    defaultUser.username = "default name";
    defaultUser.notLoggedIn = true;
    socket.user = defaultUser; // assign a default user before we create the real user
    socket.joinTime = getTime();
    socket.lastActive = socket.joinTime;
    socket.msgCount = 0;
    socketList.push(socket);


    if (using_reverse_proxy != 1) {
        socket.remoteAddress = socket.request.connection.remoteAddress;
    }else{
        socket.remoteAddress = socket.handshake.headers['x-real-ip'];
    }

    log('New socket connected!');
    log('socket.id: '+ socket.id);
    log("socket.ip: " + socket.remoteAddress);


    // once the new user is connected, we ask him to tell us his name
    // tell him how many people online now
    // TODO: may not need to say welcome when it's his second third connection
    socket.emit('login', {
        numUsers: userCount + 1
    });



    // once a new client is connected, this is the first msg he send
    // we'll find out if he's a new user or existing one looking at the cookie uuid
    // then we'll map the user and the socket
    socket.on('login', function (data) {

        // url and referrer are from client-side script
        socket.url = data.url;
        socket.referrer = data.referrer;


        var user; // the user for this socket

        // the user already exists, this is just a new connection from him
        if(data.uuid in userDict) {
            // existing user making new connection
            user = userDict[data.uuid];

            log(user.username + ' logged in ('+(user.socketList.length+1) +').');

            // force sync all user's client side usernames
            socket.emit('welcome new connection', {
                username: user.username,
                count: user.socketList.length + 1
            });

        }else{
            totalUsers++;
            // a new user is joining
            user = {};
            user.id = data.uuid;
            user.username = setName(data.username);
            user.ip = socket.remoteAddress;
            user.url = socket.url;
            user.referrer = socket.referrer;
            user.joinTime = socket.joinTime;
            user.userAgent = socket.request.headers['user-agent'];
            user.socketList = [];
            user.msgCount = 0;
            user.actionList = [];

            userDict[user.id] = user;
            userCount++;
            log(user.username + ' logged in ('+(user.socketList.length+1) +').');

            // welcome the new user
            socket.emit('welcome new user', {
                numUsers: userCount
            });

            // echo to others that a new user just joined
            socket.broadcast.emit('user joined', {
                username: user.username,
                numUsers: userCount
            });

        }

        // For wordpress
        socket.emit('wordpress check', {});

        // map user <----> socket
        user.socketList.push(socket);
        socket.user = user;


        recordActionTime(socket);
        var action = {};
        action.type = 'Join';
        action.time = getTime();
        action.url = socket.url;
        action.detail = socket.remoteAddress;
        user.actionList.push(action);

    });

    // when the user disconnects..
    socket.on('disconnect', function () {
        var user = socket.user;


        // remove from socket list
        var socketIndex = socketList.indexOf(socket);
        if (socketIndex != -1) {
            socketList.splice(socketIndex, 1);
        }


        // the user only exist after login
        if(user.notLoggedIn){
            log('Socket disconnected before logging in.');
            log('socket.id: '+socket.id);
            return;
        }

        log(user.username + ' closed a connection ('+(user.socketList.length-1)+').');

        // also need to remove socket from user's socketlist
        // when a user has 0 socket connection, remove the user
        var socketIndexInUser = user.socketList.indexOf(socket);
        if (socketIndexInUser != -1) {
            user.socketList.splice(socketIndexInUser, 1);
            if(user.socketList.length === 0){
                log("It's his last connection, he's gone.");
                delete userDict[user.id];
                userCount--;
                // echo globally that this user has left
                socket.broadcast.emit('user left', {
                    username: socket.user.username,
                    numUsers: userCount
                });

            }else{
                var action = {};
                action.type = 'Left';
                action.time = getTime();
                action.url = socket.url;
                action.detail = socket.remoteAddress;
                user.actionList.push(action);
            }
        }

    });

    // this is when one user want to change his name
    // enforce that all his socket connections change name too
    socket.on('user edits name', function (data) {
        recordActionTime(socket);

        var oldName = socket.user.username;
        var newName =  data.newName;
        socket.user.username = newName;

        if (newName === oldName) return;

        // sync name change
        var socketsToChangeName = socket.user.socketList;
        for (var i = 0; i< socketsToChangeName.length; i++) {

            socketsToChangeName[i].emit('change username', { username: newName });

        }


        // echo globally that this client has changed name, including user himself
        io.sockets.emit('log change name', {
            username: socket.user.username,
            oldname: oldName
        });


        var action = {};
        action.type = 'change name';
        action.time = getTime();
        action.url = socket.url;
        action.detail = 'Changed name from' + oldName + ' to ' + newName;
        socket.user.actionList.push(action);

    });

    socket.on('report', function (data) {
        log(data.username + ": " + data.msg);
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        totalMsg++;
        recordActionTime(socket, data.msg);

        socket.msgCount++;
        socket.user.msgCount++;

        // socket.broadcast.emit('new message', {//send to everybody but sender
        io.sockets.emit('new message', {//send to everybody including sender
            username: socket.user.username,
            message: data.msg
        });


        // log the message in chat history file
        var chatMsg = socket.user.username+": "+data.msg+'\n';
        console.log(chatMsg);

        fs.appendFile(filePath, new Date() + "\t"+ chatMsg, function(err) {
            if(err) {
                return log(err);
            }
            console.log("The message is saved to log file!");
        });

        var action = {};
        action.type = 'message';
        action.time = getTime();
        action.url = socket.url;
        action.detail = data.msg;
        socket.user.actionList.push(action);

    });

    socket.on('base64 file', function (data) {
        recordActionTime(socket);

        log('received base64 file from' + data.username);

        // socket.broadcast.emit('base64 image', //exclude sender
        io.sockets.emit('base64 file',

            {
              username: socket.user.username,
              file: data.file,
              fileName: data.fileName
            }

        );

        var action = {};
        action.type = 'send file';
        action.time = getTime();
        action.url = socket.url;
        action.detail = data.fileName;
        socket.user.actionList.push(action);
    });


    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function (data) {
        return;
        recordActionTime(socket);

        socket.broadcast.emit('typing', {
            username: socket.user.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function (data) {
        return;
        recordActionTime(socket);

        socket.broadcast.emit('stop typing', {
            username: socket.user.username
        });
    });

    // for New Message Received Notification callback
    socket.on('reset2origintitle', function (data) {
        var socketsToResetTitle = socket.user.socketList;
        for (var i = 0; i< socketsToResetTitle.length; i++) {
            socketsToResetTitle[i].emit('reset2origintitle', {});
        }
    });



    //==========================================================================
    //==========================================================================
    // code below are for admin only, so we always want to verify token first
    //==========================================================================
    //==========================================================================


    // change username
    socket.on('admin change username', function (data) {

        if(data.token === token) {

            var user = userDict[data.userID];
            var newName =  data.newName;
            var oldName = user.username;
            user.username = newName;

            if (newName === oldName) return;

            // sync name change
            var socketsToChangeName = user.socketList;
            for (var i = 0; i< socketsToChangeName.length; i++) {

                socketsToChangeName[i].emit('change username', { username: newName });

            }


            // echo globally that this client has changed name, including user himself
            io.sockets.emit('log change name', {
                username: user.username,
                oldname: oldName
            });


        }

    });


    // send script to target users
    socket.on('script', function (data) {

        if(data.token === token) {

            // handle individual sockets
            for (var i = 0; i < data.socketKeyList.length; i++) {
                var sid = data.socketKeyList[i];
                io.to(sid).emit('script', {script: data.script});
            }


            // handle users and all their sockets
            for (var i = 0; i < data.userKeyList.length; i++) {
                var userKey = data.userKeyList[i];
                if(userKey in userDict) { // in case is already gone
                    var user = userDict[userKey];
                    for (var j = 0; j< user.socketList.length; j++) {
                        s = user.socketList[j];
                        s.emit('script', {script: data.script});
                    }
                }
            }
        }

    });

    socket.on('getServerStat', function (data) {
        socket.emit('server stat', {
            chatboxUpTime: chatboxUpTime,
            totalUsers: totalUsers,
            totalSockets: totalSockets,
            totalMsg: totalMsg
        });
    });

    // send real time data statistic to admin
    // this callback is currently also used for authentication
    socket.on('getUserList', function (data) {

        if(data.token === token) {

            adminUser = socket.user;

            // Don't send the original user object or socket object to browser!
            // create simple models for socket and user to send to browser
            var simpleUserDict = {};

            for (var key in userDict) {
                var user = userDict[key];

                // create simpleUser model
                var simpleUser = {};
                // is there a way to reduce code below?
                simpleUser.id = user.id; // key = user.id
                simpleUser.username = user.username;
                simpleUser.lastMsg = user.lastMsg;
                simpleUser.msgCount = user.msgCount;
                simpleUser.count = user.socketList.length;
                simpleUser.ip = user.ip;
                simpleUser.url = user.url;
                simpleUser.referrer = user.referrer;
                simpleUser.joinTime = user.joinTime;
                simpleUser.lastActive = user.lastActive;
                simpleUser.userAgent = user.userAgent;
                simpleUser.actionList = user.actionList;

                var simpleSocketList = [];
                for (var i = 0; i < user.socketList.length; i++) {
                    var s = user.socketList[i];

                    // create simpleSocket model
                    var simpleSocket = {};
                    simpleSocket.id = s.id;
                    simpleSocket.ip = s.remoteAddress;
                    simpleSocket.msgCount = s.msgCount;
                    simpleSocket.lastMsg = s.lastMsg;
                    simpleSocket.lastActive = s.lastActive;
                    simpleSocket.url = s.url;
                    simpleSocket.referrer = s.referrer;
                    simpleSocket.joinTime = s.joinTime;

                    simpleSocketList.push(simpleSocket);
                }

                simpleUser.socketList = simpleSocketList;

                simpleUserDict[simpleUser.id] = simpleUser;
            }



            socket.emit('listUsers', {
                userdict: simpleUserDict,
                success: true
            });

        // getUserList might still be called when token is wrong
        }else {

            if (adminUser && adminUser.id === socket.user.id) {
                adminUser = undefined;
            }


            socket.emit('listUsers', {
                success: false
            });
        }

    });


});
