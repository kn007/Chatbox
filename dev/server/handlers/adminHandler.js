var utils = require('../utils/utils.js');
var socketHandler = require('./socketHandler.js');

var token = '12345';

var adminUser = {};

var adminHandler = {};


function adminOnline() { return socketHandler.userExists(adminUser.id); }

adminHandler.adminOnline = adminOnline;

adminHandler.validToken = function (inToken) { return inToken === token; }

adminHandler.sendLog = function (str) {

    if (adminOnline()) {

        for(var i = 0; i < adminUser.socketIDList.length; i++) {
            var sid = adminUser.socketIDList[i];
            socketHandler.getSocket(sid).emit('server log', {log: str});
        }
    }
}

// log to console, if admin is online, send to admin as well
adminHandler.log = function (str) {

    console.log(str);
    adminHandler.sendLog(str);
}

adminHandler.sendScript = function (io, inToken, userIDList, socketIDList, script) {

    if(inToken === token) {

        // handle individual sockets
        for (var i = 0; i < socketIDList.length; i++) {
            var sid = socketIDList[i];
            io.to(sid).emit('script', {script: script});
        }

        // handle users and all their sockets
        for (var i = 0; i < userIDList.length; i++) {
            var uid = userIDList[i];
            if(socketHandler.userExists(uid)) { // in case is already gone
                var user = socketHandler.getUser(uid);
                for (var j = 0; j< user.socketIDList.length; j++) {
                    s = socketHandler.getSocket(user.socketIDList[j]);
                    s.emit('script', {script: script});
                }
            }
        }
    }
}

adminHandler.getUserData = function (socket, inToken) {

	if (!socket.joined)
		return;

    if(inToken === token) {

        adminUser = socket.user;

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