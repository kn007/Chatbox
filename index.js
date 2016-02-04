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
    socket.user = defaultUser; // assign a default user before we create the real user
    socketList.push(socket);
    console.log('New connection established. Current total connection count: '+ socketList.length );
    //console.log("socket.id: " + socket.id);
    console.log("socket.remoteAddress: " + socket.remoteAddress);
    
    if (using_reverse_proxy != 1) {
        socket.remoteAddress = socket.request.connection.remoteAddress;
    }else{
        socket.remoteAddress = socket.handshake.headers['x-real-ip'];
    }



    // once the new user is connected, we ask him to tell us his name
    // tell him how many people online now
    // TODO: may not need to say welcome when it's his second third connection
    socket.emit('login', {
        numUsers: userCount + 1
    });



    // once a new client is connected, this is the first msg he send
    // we'll find out if he's a new user or existing one looking at the cookieID
    // then we'll map the user with the socket
    socket.on('login', function (data) {

        var user;

        if(data.uuid in userDict) {
            // existing user making new connection
            user = userDict[data.uuid];
            console.log(user.username + ' made a new connection.');

            // force sync all user's client side usernames
            socket.emit('change username', {
                username: user.username              
            });   

        }else{ 
            // a new user is joining
            user = {};
            user.cookieID = data.uuid;
            user.username = setName(data.username);
            user.socketList = [];
            userDict[user.cookieID] = user;
            userCount++;
            console.log(user.username + ' just joined. Current user count: '+userCount);

            // echo to others that a person has joined
       
            socket.broadcast.emit('user joined', {
                username: socket.user.username,
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

        // also need to remove socket from user's socketlist
        // when a user has 0 socket connection, remove the user
        var socketIndexInUser = user.socketList.indexOf(socket);
        if (socketIndexInUser != -1) {
            user.socketList.splice(socketIndexInUser, 1);
            if(user.socketList.length === 0){
                console.log("It's his last connection.");
                delete userDict[user.cookieID];
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







    // below commands are for admin only, so we always want to verify token first



    // send script to target users
    socket.on('script', function (data) {

        if(data.token === token) {

            // userKey is cookieID
            for (var i = 0; i < data.to.length; i++) {
                var userKey = data.to[i];
                if(userKey in userDict) {
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
            // Don't send userDict to admin, it's way too big since it link to socket object etc.
            // just send a new array of users with info we want
            var userList = [];

            for (userKey in userDict) {
                var user = userDict[userKey];
                var simpleUser = {};
                simpleUser.id = user.cookieID;
                simpleUser.username = user.username;
                simpleUser.count = user.socketList.length;
                simpleUser.ip = user.remoteAddress;
                // what more to include?
                userList.push(simpleUser);
            }



            socket.emit('listUsers', {      
                userlist: userList,
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
