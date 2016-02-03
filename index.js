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


var socketList = [];

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

    socketList.push(socket);
    
    console.log('New user connected');
    // set an initial name before receiving real name from client
    socket.username = setName('initName'); 
    socket.remoteAddress = socket.request.connection.remoteAddress;


    console.log("socket.id: " + socket.id);
    console.log("socket.remoteAddress: " + socket.remoteAddress);


    // once the new user is connected, we ask him to tell us his name
    // tell him how many people online now
    socket.emit('login', {
        numUsers: socketList.length
    });



    // once a new client is connected, this is the first msg he send
    socket.on('login', function (data) {
        socket.username = setName(data.username);
        console.log('There are '+ socketList.length + ' users now.');

        // echo to others that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: socketList.length
        });    

    });

    // when the user disconnects.. 
    socket.on('disconnect', function () {

        var index = socketList.indexOf(socket);
        if (index != -1) {
            socketList.splice(index, 1);
        }

         // echo globally that this client has left
        socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: socketList.length
        });
        
    });

    socket.on('change name', function (data) {

        var oldName = socket.username;
        socket.username = data.name;

         // echo globally that this client has changed name, including user himself
        io.sockets.emit('change name', {
            username: socket.username,
            oldname: oldName
        });
        
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {

        // update username
        socket.username = setName(data.username);

  
        // socket.broadcast.emit('new message', {//send to everybody but sender
        io.sockets.emit('new message', {//send to everybody including sender
            username: socket.username,
            message: data.msg
        });
        

        // log the message in chat history file
        var chatMsg = socket.username+": "+data.msg+'\n';
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
        socket.username = setName(data.username);
        
        // socket.broadcast.emit('base64 image', //exclude sender
        io.sockets.emit('base64 file', 

            {
              username: socket.username,
              file: data.file,
              fileName: data.fileName
            }

        );
    });


    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function (data) {
        socket.username = setName(data.name);
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function (data) {
        socket.username = setName(data.name);
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });







    // below commands are for admin only, so we always want to verify token first



    // send script to target users
    socket.on('script', function (data) {

        if(data.token === token) {

            /*
            for(var s in io.sockets.sockets) {

                if(data.to.indexOf(io.sockets.sockets[s]['username'])>=0) {
                    
                    var socketID = io.sockets.sockets[s]['id'];
                    io.sockets.connected[socketID].emit('script', {      
                        script: data.script
                    });

                }

            }
            */

            // O(mn) time complexity, maybe should change to dictionary
            // what about the IP dictionary ?
            for (var i = 0; i < socketList.length; i++) {
                if(data.to.indexOf(socketList[i].username)!= -1) {
                    socketList[i].emit('script', {      
                        script: data.script
                    });
                }
            }


        }

    });


    socket.on('getUserList', function (data) {

        if(data.token === token) {

            // group by IP address
            var userDict = {};

            for(var i=0; i<socketList.length; i++) {

                var s = socketList[i];

                if(s.remoteAddress in userDict) {

                    userDict[s.remoteAddress].count++;

                }else {

                    var user = {};
                    user.username = s.username;
                    user.ip = s.remoteAddress;
                    user.count = 1;
                    userDict[user.ip] = user;

                }
            }



            socket.emit('listUsers', {      
                userdict: userDict,
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
