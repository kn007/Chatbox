var utils = require('./utils/utils.js');

// users are grouped by browser base on cookie's uuid implementation,
// therefore 1 connection is the smallest unique unit and 1 user is not.
// 1 user may contain multiple connections when he opens multiple tabs in same browser.
var userDict = {};
var userCount = 0;

var socketDict = {};



var dataHandler = {};


function socketConnected(socket) {

	socketDict[socket.id] = socket;
	socket.login = false;
}



function socketJoin(socket, url, referrer) {

	

    if (using_reverse_proxy != 1) {
        socket.remoteAddress = socket.request.connection.remoteAddress;
    }else{
        socket.remoteAddress = socket.handshake.headers['x-real-ip'];
    }

    socket.joinTime = utils.getTime();
    socket.lastActiveTime = socket.joinTime;
    socket.msgCount = 0;

    // url and referrer are from client-side script
    socket.url = data.url;
    socket.referrer = data.referrer;


	socket.login = true;

}

function userJoin(uuid, username, firstSocket) {

	var user = createUser(uuid, username, firstSocket);
        


    userDict[user.id] = user;
    firstSocket.user = user;

}

// create the user from the first socket
function createUser(uuid, username, firstSocket) {

    var user = {};
    user.id = uuid;
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


    return user;
}



module.exports = dataHandler;