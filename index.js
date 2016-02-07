// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);



//set chat history log file
var fs = require('fs');
var filePath = __dirname+"/chat-log.txt";

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

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));




// Chatbox

// set username, avoid no name
function setName(name) {

    if (typeof name != 'undefined' && name!=='')
        return name;
    return "no name";
}




io.on('connection', function (socket) {


    var defaultUser = {};
    defaultUser.username = "default name";
    defaultUser.notLoggedIn = true;
    socket.user = defaultUser; // assign a default user before we create the real user
    socket.joinTime = (new Date()).getTime();
    socketList.push(socket);


    if (using_reverse_proxy != 1) {
        socket.remoteAddress = socket.request.connection.remoteAddress;
    }else{
        socket.remoteAddress = socket.handshake.headers['x-real-ip'];
    }

    console.log('New connection established. Current total connection count: '+ socketList.length );
    //console.log("socket.id: " + socket.id);
    console.log("socket.remoteAddress: " + socket.remoteAddress);
    console.log(socket.request.headers['referer']);




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

        var user; // the user for this socket

        // the user already exists, this is just a new connection from him
        if(data.uuid in userDict) {
            // existing user making new connection
            user = userDict[data.uuid];
            console.log(user.username + ' made a new connection.');

            // force sync all user's client side usernames
            socket.emit('welcome new connection', {
                username: user.username,
                count: user.socketList.length + 1
            });

        }else{
            // a new user is joining
            user = {};
            user.id = data.uuid;
            user.username = setName(data.username);
            user.ip = socket.remoteAddress;
            user.joinTime = socket.joinTime;
            user.userAgent = socket.request.headers['user-agent'];
            user.socketList = [];


            userDict[user.id] = user;
            userCount++;
            console.log(user.username + ' just joined. Current user count: '+userCount);

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

        // map user <----> socket
        user.socketList.push(socket);
        socket.user = user;




    });

    // when the user disconnects..
    socket.on('disconnect', function () {
        var user = socket.user;

        console.log(user.username + ' closed a connection.');

        // remove from socket list
        var socketIndex = socketList.indexOf(socket);
        if (socketIndex != -1) {
            socketList.splice(socketIndex, 1);
        }


        // the user only exist after login
        if(user.notLoggedIn){
            return;
        }


        // also need to remove socket from user's socketlist
        // when a user has 0 socket connection, remove the user
        var socketIndexInUser = user.socketList.indexOf(socket);
        if (socketIndexInUser != -1) {
            user.socketList.splice(socketIndexInUser, 1);
            if(user.socketList.length === 0){
                console.log("It's his last connection.");
                delete userDict[user.id];
                userCount--;
                // echo globally that this user has left
                socket.broadcast.emit('user left', {
                    username: socket.user.username,
                    numUsers: userCount
                });

            }
        }

    });

    // this is when one user want to change his name
    // enforce that all his socket connections change name too
    socket.on('user edits name', function (data) {

        var oldName = socket.user.username;
        var newName =  data.newName;
        socket.user.username = newName;

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

    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {


        // socket.broadcast.emit('new message', {//send to everybody but sender
        io.sockets.emit('new message', {//send to everybody including sender
            username: socket.user.username,
            message: data.msg
        });

        socket.lastMsg = data.msg;
        socket.user.lastMsg = data.msg;


        // log the message in chat history file
        var chatMsg = socket.user.username+": "+data.msg+'\n';
        console.log(chatMsg);

        fs.appendFile(filePath, chatMsg, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The message is saved!");
        });

    });

    socket.on('base64 file', function (data) {
        console.log('received base64 file from' + data.username);

        // socket.broadcast.emit('base64 image', //exclude sender
        io.sockets.emit('base64 file',

            {
              username: socket.user.username,
              file: data.file,
              fileName: data.fileName
            }

        );
    });


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

    // for New Message Received Notification callback
    socket.on('reset2origintitle', function (data) {
        var socketsToResetTitle = socket.user.socketList;
        for (var i = 0; i< socketsToResetTitle.length; i++) {
            socketsToResetTitle[i].emit('reset2origintitle', {});
        }
    });


    // below commands are for admin only, so we always want to verify token first

    // change username
    socket.on('admin change username', function (data) {

        if(data.token === token) {

            var user = userDict[data.userID];
            var newName =  data.newName;
            var oldName = user.username;
            user.username = newName;

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


            // handle whole users
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



    socket.on('getUserList', function (data) {

        if(data.token === token) {
            // Don't send the original user object or socket object to browser!
            // create simple models for socket and user to send to browser
            var simpleUserDict = {};

            for (var key in userDict) {
                var user = userDict[key];

                // create simpleUser model
                var simpleUser = {};
                simpleUser.id = user.id; // key = user.id
                simpleUser.username = user.username;
                simpleUser.lastMsg = user.lastMsg;
                simpleUser.count = user.socketList.length;
                simpleUser.ip = user.ip;
                simpleUser.joinTime = user.joinTime;
                simpleUser.userAgent = user.userAgent;

                var simpleSocketList = [];
                for (var i = 0; i < user.socketList.length; i++) {
                    var s = user.socketList[i];

                    // create simpleSocket model
                    var simpleSocket = {};
                    simpleSocket.id = s.id;
                    simpleSocket.lastMsg = s.lastMsg;
                    simpleSocket.url = s.request.headers['referer'];
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

            socket.emit('listUsers', {
                success: false
            });
        }

    });


});
