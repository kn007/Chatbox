"use strict";

var utils = require('../utils/utils.js');
var socketHandler = require('./socketHandler.js');

var fs = require('fs');
var logFilePath = __dirname+"/../../client/chat-log.txt";

var totalMsg = 0;

var msgHandler = {};

msgHandler.getTotalMsgCount = function() { return totalMsg; };

msgHandler.receiveMsg = function(socket, msg) {

	socketHandler.recordSocketActionTime(socket, msg);

	totalMsg++;
	socket.msgCount++;
    socket.user.msgCount++;

    var action = {};
    action.type = 'Send Message';
    action.time = utils.getTime();
    action.url = socket.url;
    action.detail = "Message: "+msg;
    socket.user.actionList.push(action);



    // log the message in chat history file
    var chatMsg = socket.user.username+": "+msg+'\n';
    console.log(chatMsg);

    fs.appendFile(logFilePath, new Date() + "\t"+ chatMsg, function(err) {

        if(err) 
            console.log(err);
        else
        	console.log("The message is saved to log file!");

    });
};


module.exports = msgHandler;