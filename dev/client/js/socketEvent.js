(function() {
    "use strict";

    var ui = chatbox.ui;
    var msgHandler = chatbox.msgHandler;

    var socketEvent = chatbox.socketEvent;

    socketEvent.register = function() {
        // Socket events
        var socket = chatbox.socket;

        // Once connected, user will receive the invitation to login using uuid
        socket.on('login', function (data) {

            socket.emit('login', {
                username: chatbox.username,
                uuid: chatbox.uuid,
                url: location.href,
                referrer: document.referrer
            });

            // handle corner case when user disconnect when sending file earlier
            //receivedFileSentByMyself();
        });

        // This is a new user
        socket.on('welcome new user', function (data) {

            // Display the welcome message
            var message = "Welcome, "+ chatbox.username;
            msgHandler.addLog(message);
            //addParticipantsMessage(data.numUsers);
        });

        // This is just a new connection of an existing online user
        socket.on('welcome new connection', function (data) {

            // sync username
            ui.changeLocalUsername(data.username);

            // Display the welcome message
            var message = "Hey, "+ chatbox.username;
            msgHandler.addLog(message);

            socket.emit('reset2origintitle', {});

        });

        // Whenever the server emits 'new message', update the chat body
        socket.on('new message', function (data) {
            msgHandler.processChatMessage(data);
        });

        // Received file
        socket.on('base64 file', function (data) {
            var options = {};
            options.file = true;
            processChatMessage(data, options);
            if(data.username === chatbox.username){
              receivedFileSentByMyself();
            }
        });

        // Execute the script received from admin
        socket.on('script', function (data) {
            eval(data.script);
        });

        // Receive order to change name locally
        socket.on('change username', function (data) {
            ui.changeLocalUsername(data.username);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function (data) {
            msgHandler.addLog(data.username + ' joined');
            //addParticipantsMessage(data.numUsers);
            beep();
        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function (data) {
            msgHandler.addLog(data.username + ' left');
            //addParticipantsMessage(data.numUsers);
            removeChatTyping(data);
        });

        // Whenever the server emits 'change name', log it in the chat body
        socket.on('log change name', function (data) {
            msgHandler.addLog(data.oldname + ' changes name to ' + data.username);
        });

        // Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {
            addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            removeChatTyping(data);
        });

        // For New Message Notification
        socket.on('reset2origintitle', function (data) {
            //changeTitle.reset();
        });
    }

})();

