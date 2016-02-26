var utils = require('../utils/utils.js');

// users are grouped by browser base on cookie's uuid implementation,
// therefore 1 connection is the smallest unique unit and 1 user is not.
// 1 user may contain multiple connections when he opens multiple tabs in same browser.
var userDict = {};
var userCount = 0;

var socketDict = {};
var socketCount = 0;
var using_reverse_proxy = 0;

var socketHandler = {};




function mapSocketWithUser(socket, user) {

	socket.user = user;
	user.socketList.push(socket.id);
}


socketHandler.userExists = function(uid) {return uid in userDict;}
socketHandler.getUser = function(uid) {return userDict[uid];}
socketHandler.getUserCount = function() {return userCount;}
socketHandler.getSocket = function(sid) {return socketDict[sid];}

socketHandler.socketConnected = function(socket) {

	socketDict[socket.id] = socket;
	socket.joined = false;
}

socketHandler.socketDisconnected = function(socket) {

	// delete socket from socketDict
	delete socketDict[socket.id];


	// delete socket from user if socket has a user 

	if (socket.joined) {

		var user = socket.user;
		var socketIndexInUser = user.socketList.indexOf(socket.id);

        user.socketList.splice(socketIndexInUser, 1);

        // delete user if this is his last socket
        if(user.socketList.length === 0){

            delete userDict[user.id];
            
            userCount--;


        } else {

            var action = {};
            action.type = 'Left';
            action.time = utils.getTime();
            action.url = socket.url;
            action.detail = socket.remoteAddress;
            user.actionList.push(action);
        }
	} 
}

socketHandler.socketJoin = function(socket, url, referrer, uid, username) {

    if (using_reverse_proxy != 1) {
        socket.remoteAddress = socket.request.connection.remoteAddress;
    } else {
        socket.remoteAddress = socket.handshake.headers['x-real-ip'];
    }

    socket.joinTime = utils.getTime();
    socket.lastActiveTime = socket.joinTime;
    socket.msgCount = 0;

    // url and referrer are from client-side script
    socket.url = url;
    socket.referrer = referrer;


    if (uid in userDict) {
    	// existing user

    	mapSocketWithUser(socket, userDict[uid]);

    } else {

    	// new user
    	var newUser = newUserJoin(uid, username, socket);
    	mapSocketWithUser(socket, newUser);
    	userCount++;
    }

    var action = {};
    action.type = 'Join';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = socket.remoteAddress;
    socket.user.actionList.push(action);


	socket.joined = true;

}


// create the user from the first socket
function newUserJoin(uid, username, firstSocket) {

    var user = {};
    user.id = uid;
    user.username = utils.setUsername(username); // clean the name first
    user.ip = firstSocket.remoteAddress;
    user.url = firstSocket.url;
    user.referrer = firstSocket.referrer;
    user.joinTime = firstSocket.joinTime;
    user.userAgent = firstSocket.request.headers['user-agent'];
    user.msgCount = 0;
    user.socketList = [];
    user.actionList = [];

    userDict[uid] = user;

    return user;
}


module.exports = socketHandler;