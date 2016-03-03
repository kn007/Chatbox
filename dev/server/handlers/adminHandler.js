var utils = require('../utils/utils.js');
var socketHandler = require('./socketHandler.js');
var msgHandler = require('./msgHandler.js');

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

    if(inToken === token) {

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
                    kickUser(io, user, commandType, commandContent);
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

function kickUser(io, user, commandType, commandContent) {

    // broadcast kick message first then kick, so that user being kicked can see it too
    io.sockets.emit(commandType, {content: commandContent, username: user.username}); 

    var tmpSocketIDList = [];

    for (var i = 0; i< user.socketIDList.length; i++) 
        tmpSocketIDList.push(user.socketIDList[i]);

    for (var j = 0; j< tmpSocketIDList.length; j++) 
        socketHandler.getSocket(tmpSocketIDList[j]).disconnect();

}


function sendCommandToSocket(socket, commandType, commandContent) {


    if (commandType === 'admin kick') { // only kick one socket of a user

        socket.emit(commandType, {content: commandContent}); // what content? explain why being kicked?
        socket.disconnect();
    }

    else
        socket.emit(commandType, {content: commandContent});


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


        // if (adminUser.id !== socket.user.id) {
            adminUser = socket.user;
        // }

        // send serilizable user and socket object
        var simpleUserDict = {};

        for (var key in socketHandler.getAllUsers()) {

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

    // getUserList might still be called when token is wrong
    }else {

        if (adminUser.id === socket.user.id) 
        	adminUser = {};
        


        socket.emit('listUsers', {
            success: false
        });
    }

}

 

module.exports = adminHandler;