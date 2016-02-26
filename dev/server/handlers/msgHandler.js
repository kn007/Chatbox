var utils = require('../utils/utils.js');
var fs = require('fs');
var filePath = __dirname+"/../../client/chat-log.txt";

var totalMsg = 0;

var msgHandler = {};


msgHandler.receiveMsg = function(socket, msg) {

	totalMsg++;
	socket.msgCount++;
    socket.user.msgCount++;

    var action = {};
    action.type = 'message';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = msg;
    socket.user.actionList.push(action);



    // log the message in chat history file
    var chatMsg = socket.user.username+": "+msg+'\n';
    console.log(chatMsg);

    fs.appendFile(filePath, new Date() + "\t"+ chatMsg, function(err) {

        if(err) {
            console.log(err);
        }else
        	console.log("The message is saved to log file!");

    });
}


module.exports = msgHandler;