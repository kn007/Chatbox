var utils = require('../utils/utils.js');
var socketHandler = require('./socketHandler.js');
var msgHandler = require('./msgHandler.js');
var usernameHandler = require('./usernameHandler.js');
var roomHandler = require('./roomHandler.js');

var token = '12345';
var chatboxUpTime = (new Date()).toString();

var adminUser = {}; // TODO: multiple admin user

var adminHandler = {};


function adminOnline() { return socketHandler.userExists(adminUser.id); }

adminHandler.adminOnline = adminOnline;

adminHandler.validToken = function (inToken) { return inToken === token; }

adminHandler.sendLog = function (str) {

    if (adminOnline()) {

        for(var i = 0; i < adminUser.socketIDList.length; i++) {
            var sid = adminUser.socketIDList[i];
            if (socketHandler.getSocket(sid).joined)
                socketHandler.getSocket(sid).emit('server log', {log: str});
        }
    }
}

// log to console, if admin is online, send to admin as well
adminHandler.log = function (str) {

    console.log(str);
    adminHandler.sendLog(str);
}

adminHandler.sendCommand = function (io, inToken, userIDList, socketIDList, commandType, commandContent) {

    // TODO: need to double check if target user/sockets are in the room as room Admin
    if(inToken === token || roomHandler.validToken(inToken)) {

        adminHandler.log('Received command from admin, type: ' + commandType);

        // handle individual sockets
        for (var i = 0; i < socketIDList.length; i++) {
            var sid = socketIDList[i];
            var s = socketHandler.getSocket(sid);
            sendCommandToSocket(s, commandType, commandContent);
        }

        // handle users and all their sockets
        for (var i = 0; i < userIDList.length; i++) {
            var uid = userIDList[i];
            if(socketHandler.userExists(uid)) { // in case is already gone
                var user = socketHandler.getUser(uid);

                if (commandType === 'admin kick'){
                    kickAllUsersSockets(io, user, commandType, commandContent);
                }else {
                    for (var j = 0; j< user.socketIDList.length; j++) {
                        var s = socketHandler.getSocket(user.socketIDList[j]);
                        sendCommandToSocket(s, commandType, commandContent);
                    }
                }
            }
        }
    } 
}

// When admin changes a user's username
adminHandler.adminChangeUsername = function (io, inToken, userID, newName) {
    
    // TODO: need to double check if target user/sockets are in the room as room Admin
    if(inToken === token || roomHandler.validToken(inToken)) {

        var user = socketHandler.getUser(userID);

        var oldName = user.username;

        usernameHandler.adminEditName(user, newName);

        io.in(user.roomID).emit('log change name', {
            username: user.username,
            oldname: oldName
        });

        adminHandler.log(oldName + ' changed name to ' + user.username);
    }

}




function kickAllUsersSockets(io, user, commandType, commandContent) {

    // broadcast kick message first then kick, so that user being kicked can see it too
    io.in(user.roomID).emit(commandType, {content: commandContent, username: user.username}); 

    var tmpSocketIDList = [];

    for (var i = 0; i< user.socketIDList.length; i++) 
        tmpSocketIDList.push(user.socketIDList[i]);

    for (var j = 0; j< tmpSocketIDList.length; j++) 
        socketHandler.getSocket(tmpSocketIDList[j]).disconnect();

}


function sendCommandToSocket(socket, commandType, commandContent) {

    socket.emit(commandType, {content: commandContent});

    if (commandType === 'admin kick') { // only kick one socket of a user
        socket.disconnect();
    }

}



function getServerStat(socket, inToken) {
    
    if(inToken === token) {

        socket.emit('server stat', {
            chatboxUpTime: chatboxUpTime,
            totalUsers: socketHandler.getTotalUserCount(),
            totalSockets: socketHandler.totalSocketConnectionCount(),
            totalMsg: msgHandler.getTotalMsgCount()
        });
    }
}

adminHandler.getServerStat = getServerStat;

adminHandler.getUserData = function (socket, inToken) {

	if (!socket.joined)
		return;

    if(inToken === token) {

        adminUser = socket.user;

        sendOnlineUserData(socket, socketHandler.getAllUsers());


    }else if (roomHandler.validToken(inToken)) {
        
        sendOnlineUserData(socket, roomHandler.getUsersInRoom(inToken));

    }else {

        // bad token
        socket.emit('listUsers', {
                success: false
        });

    }

}


// send serilizable user and socket object
function sendOnlineUserData(socket, userDict) {

    var simpleUserDict = {};

    for (var key in userDict) {

        var user = socketHandler.getUser(key);

        var simpleSocketList = [];

        for (var i = 0; i < user.socketIDList.length; i++) {

            var s = socketHandler.getSocket(user.socketIDList[i]);

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

        user.socketList = simpleSocketList;

        simpleUserDict[user.id] = user;
    }

    socket.emit('listUsers', {
            userdict: simpleUserDict,
            success: true
    });

}

 

module.exports = adminHandler;