"use strict";

var utils = require('../utils/utils.js');

// users are grouped by browser base on cookie's uuid implementation,
// therefore 1 connection is the smallest unique unit and 1 user is not.
// 1 user may contain multiple connections when he opens multiple tabs in same browser.
var userDict = {};
var onlineUserCount = 0;

var socketDict = {};
var using_reverse_proxy = 0;

var socketHandler = {};
var totalSocketConnection = 0;
var totalUserCount = 0;



function mapSocketWithUser(socket, user) {

	socket.user = user;
	user.socketIDList.push(socket.id);
}

function recordSocketActionTime(socket, msg) {
    socket.lastActive = utils.getTime();
    socket.user.lastActive = socket.lastActive;
    if(msg){
        socket.lastMsg = msg;
        socket.user.lastMsg = msg;
    }
}

socketHandler.recordSocketActionTime = recordSocketActionTime;

socketHandler.userExists = function(uid) {return uid in userDict;};
socketHandler.getUser = function(uid) {return userDict[uid];};
socketHandler.getAllUsers = function() {return userDict;};
socketHandler.getUserCount = function() {return onlineUserCount;};
socketHandler.getTotalUserCount = function() {return totalUserCount;};
socketHandler.totalSocketConnectionCount = function() {return totalSocketConnection;};
socketHandler.getSocket = function(sid) {return socketDict[sid];};
socketHandler.getAllSockets = function() {return socketDict;};


socketHandler.socketConnected = function(socket) {

	socketDict[socket.id] = socket;

	if (using_reverse_proxy != 1) 
        socket.remoteAddress = socket.request.connection.remoteAddress;
    else 
        socket.remoteAddress = socket.handshake.headers['x-real-ip'];
    
    totalSocketConnection++;
	socket.joined = false;
};

// if it's user's last connection, return true
// otherwise return false
// if there's no user, also return false

socketHandler.socketDisconnected = function(socket) {

    var lastConnectionOfUser = false;
	// delete socket from socketDict
	delete socketDict[socket.id];


	// delete socket from user if socket has a user 

	if (socket.joined) {

		var user = socket.user;
		var socketIndexInUser = user.socketIDList.indexOf(socket.id);

        user.socketIDList.splice(socketIndexInUser, 1);

        // delete user if this is his last socket
        if(user.socketIDList.length === 0){

            delete userDict[user.id];
            onlineUserCount--;
            lastConnectionOfUser = true;

        } else {

            var action = {};
            action.type = 'Left';
            action.time = utils.getTime();
            action.url = socket.url;
            action.detail = "IP: "+ socket.remoteAddress + "<br/>Message sent: " + socket.msgCount;
            // + "<br/>Stay time: " + ((action.time-socket.joinTime)/1000) 

            user.actionList.push(action);
        }
	}

    return lastConnectionOfUser; 
};

socketHandler.socketJoin = function(socket, url, referrer, uid, username) {


	var firstSocketOfNewUser = false;

    socket.joinTime = utils.getTime();
    socket.lastActiveTime = socket.joinTime;
    socket.msgCount = 0;

    // url and referrer are from client-side script
    socket.url = url;
    socket.referrer = referrer;

    var action = {};


    if (uid in userDict) {
    	// existing user
        action.type = 'Join';

    	mapSocketWithUser(socket, userDict[uid]);

    } else {

    	// new user
        action.type = 'First Join';

    	firstSocketOfNewUser = true;

    	var newUser = newUserJoin(uid, username, socket);
    	mapSocketWithUser(socket, newUser);
    	onlineUserCount++;
        totalUserCount++;
    }

    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = "IP: " + socket.remoteAddress;
    socket.user.actionList.push(action);


	socket.joined = true;
	recordSocketActionTime(socket);

	return firstSocketOfNewUser;

};


// create the user from the first socket
function newUserJoin(uid, username, firstSocket) {

    var user = {};
    user.id = uid;
    user.username = username; // clean the name first
    user.ip = firstSocket.remoteAddress;
    user.url = firstSocket.url;
    user.referrer = firstSocket.referrer;
    user.joinTime = firstSocket.joinTime;
    user.userAgent = firstSocket.request.headers['user-agent'];
    user.msgCount = 0;
    user.socketIDList = [];
    user.actionList = [];

    userDict[uid] = user;

    return user;
}


module.exports = socketHandler;