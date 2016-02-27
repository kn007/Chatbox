var socketHandler = require('./socketHandler.js');
var adminHandler = require('./adminHandler.js');
var utils = require('../utils/utils.js');

var usernameHandler = {};



function changeName(io, user, newName) {


    var oldName = user.username;
    user.username = newName;
    var socketIDsToChangeName = user.socketIDList;

    for (var i = 0; i< socketIDsToChangeName.length; i++) 
    	socketHandler.getSocket(socketIDsToChangeName[i]).emit('change username', { username: newName });
    

    // echo globally that this client has changed name
    io.sockets.emit('log change name', {
        username: user.username,
        oldname: oldName
    });

    adminHandler.log(oldName + ' changed name to ' + user.username);
}

usernameHandler.adminEditName = function(io, uid, newName) {

	var user = socketHandler.getUser(uid);

    // change name and sync name change
    var oldName = user.username;

    changeName(io, user, newName);

    var action = {};
    action.type = 'name changed by admin';
    action.time = utils.getTime();
    action.url = 'N/A';
    action.detail = 'Changed name from' + oldName + ' to ' + newName;
    user.actionList.push(action);
}



usernameHandler.userEditName = function(io, socket, newName) {

    // add logic here to limit visitor changing name

    // if (newName === oldName) return; 

    // change name and sync name change
    var oldName = socket.user.username;
    changeName(io, socket.user, newName);

    var action = {};
    action.type = 'change name';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = 'Changed name from' + oldName + ' to ' + newName;
    socket.user.actionList.push(action);

}


module.exports = usernameHandler;