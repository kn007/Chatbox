var utils = require('./utils/utils.js');

// users are grouped by browser base on cookie's uuid implementation,
// therefore 1 connection is the smallest unique unit and 1 user is not.
// 1 user may contain multiple connections when he opens multiple tabs in same browser.
var userDict = {};
var userCount = 0;

var socketDict = {};
var socketCount = 0;


var dataHandler = {};


function userExist(uuid) {
	return uuid in userDict;
}

dataHandler.userExist = userExist;

dataHandler.getUser = function(uid) {return userDict[uid];}
dataHandler.getSocket = function(sid) {return socketDict[sid];}


dataHandler.socketConnected = function(socket) {

	socketDict[socket.id] = socket;
	socket.joined = false;
}

dataHandler.socketJoin = function(socket, url, referrer, uid, username) {

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

    	mapSocketWithUser(socket, userDict[uid]);

    } else {

    	var newUser = newUserJoin(uid, username, socket);
    	mapSocketWithUser(socket, newUser);
    }

	socket.joined = true;

}

function mapSocketWithUser(socket, user) {

	socket.user = user;
	user.socketList.push(socket);
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
    user.socketList.push(firstSocket.id);
    user.actionList = [];

    userDict[uid] = user;

    return user;
}


module.exports = dataHandler;