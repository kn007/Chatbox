var socketHandler = require('./socketHandler.js');
var adminHandler = require('./adminHandler.js');
var utils = require('../utils/utils.js');

var usernameHandler = {};

var onlineUsernames = {};

function checkUsername(name) {

    if (name in onlineUsernames){


        var num = 2;

        while (true) {

            var newName = name + '(' + num + ')';

            if (newName in onlineUsernames)
                num ++;

            else{
                onlineUsernames[newName] = 1;
                return newName;
            }
        }


    } else {
        onlineUsernames[name] = 1;
    }

    return name;
}

usernameHandler.checkUsername = checkUsername;

usernameHandler.releaseUsername = function (name) { delete onlineUsernames[name]; }

function changeName(io, user, newName) {
    
    var oldName = user.username;

    // consideration: do we want to release the name as soon as user change name?
    usernameHandler.releaseUsername(oldName); 
    var newName = checkUsername(newName);


    user.username = newName
    var socketIDsToChangeName = user.socketIDList;

    for (var i = 0; i< socketIDsToChangeName.length; i++) 
    	socketHandler.getSocket(socketIDsToChangeName[i]).emit('change username', { username: newName });
    

    // echo globally that this client has changed name
    io.sockets.emit('log change name', {
        username: user.username,
        oldname: oldName
    });

    adminHandler.log(oldName + ' changed name to ' + user.username);
    return newName;
}

usernameHandler.adminEditName = function(io, uid, newName) {

	var user = socketHandler.getUser(uid);

    // change name and sync name change
    var oldName = user.username;

    if (oldName === newName) return;

    newName = changeName(io, user, newName);

    var action = {};
    action.type = 'Name Changed';
    action.time = utils.getTime();
    action.url = 'N/A';
    action.detail = 'Changed name from ' + oldName + ' to ' + newName;
    user.actionList.push(action);
}



usernameHandler.userEditName = function(io, socket, newName) {

    // add logic here to limit visitor changing name


    // change name and sync name change
    var oldName = socket.user.username;

    if (oldName === newName) return;


    newName = changeName(io, socket.user, newName);

    var action = {};
    action.type = 'Change Name';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = 'Changed name from ' + oldName + ' to ' + newName;
    socket.user.actionList.push(action);

}


module.exports = usernameHandler;