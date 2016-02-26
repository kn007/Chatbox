var socketHandler = require('./socketHandler.js');
var utils = require('../utils/utils.js');

var usernameHandler = {};



function changeName(user, newName) {

    var socketsToChangeName = user.socketList;

    for (var i = 0; i< socketsToChangeName.length; i++) {
    	// console.log('socketsToChangeName[i]  '+socketsToChangeName[i]);
    	socketHandler.getSocket(socketsToChangeName[i]).emit('change username', { username: newName });

    }
}

usernameHandler.adminEditName = function(uid, newName) {

	var user = socketHandler.getUser(uid);

    var oldName = user.username;
    user.username = newName;

    // change name and sync name change
    changeName(user, newName);

    var action = {};
    action.type = 'name changed by admin';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = 'Changed name from' + oldName + ' to ' + newName;
    socket.user.actionList.push(action);


}



usernameHandler.userEditName = function(socket, newName) {


    var oldName = socket.user.username;
    socket.user.username = newName;

    if (newName === oldName) return;

    // change name and sync name change
    changeName(socket.user, newName);

    var action = {};
    action.type = 'change name';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = 'Changed name from' + oldName + ' to ' + newName;
    socket.user.actionList.push(action);

}


module.exports = usernameHandler;