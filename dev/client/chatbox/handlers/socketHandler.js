(function() {
    "use strict";

    var ui = chatbox.ui;
    var msgHandler = chatbox.msgHandler;
    var typingHandler = chatbox.typingHandler;
    var notification = chatbox.notification;
    var userListHandler = chatbox.userListHandler;
    var socketEvent = chatbox.socketEvent;

    socketEvent.register = function() {
        // Socket events
        var socket = chatbox.socket;

        // Once connected, user will receive the invitation to login using uuid
        socket.on('login', function (data) {

            socket.emit('login', {
                username: chatbox.username,
                uuid: chatbox.uuid,
                roomID: chatbox.roomID,
                url: location.href,
                referrer: document.referrer
            });

            // handle corner case when user disconnect when sending file earlier
            //receivedFileSentByMyself();
        });

        // This is a new user
        socket.on('welcome new user', function (data) {
            socket.joined = true;
            ui.changeLocalUsername(data.username);

            // Display the welcome message
            var message = "Welcome, "+ chatbox.username; //TODO: this username might be allow to be used, always get username from server
            ui.addLog(message);

            var userCount = 0;

            for (var onlineUsername in data.onlineUsers){
                userCount++;
                userListHandler.userJoin(onlineUsername);
            }

            ui.updateOnlineUserCount(userCount);
            ui.addParticipantsMessage(userCount);


        });

        // This is just a new connection of an existing online user
        socket.on('welcome new connection', function (data) {
            socket.joined = true;

            // sync username
            ui.changeLocalUsername(data.username);

            // Display the welcome message
            var message = "Hey, "+ chatbox.username;
            ui.addLog(message);

            var userCount = 0;
            
            for (var onlineUsername in data.onlineUsers){
                userCount++;
                userListHandler.userJoin(onlineUsername);
            }

            ui.updateOnlineUserCount(userCount);
            ui.addParticipantsMessage(userCount);

            
            socket.emit('reset2origintitle', {});
        });

        // Whenever the server emits 'new message', update the chat body
        socket.on('new message', function (data) {
            msgHandler.processChatMessage(data);
            // play new msg sound and change chatbox color to notify users
            if (data.username !== chatbox.username) {
                //newMsgBeep();
                notification.receivedNewMsg();
            }

        });

        // Received file
        socket.on('base64 file', function (data) {
            var options = {};
            options.file = true;
            msgHandler.processChatMessage(data, options);
        });

        // Execute the script received from admin
        socket.on('admin script', function (data) {
            eval(data.content);
        });

        socket.on('admin message', function (data) {
            $('#socketchatbox-msgpopup-content').html(data.content);
            $('#socketchatbox-msgpopup-modal').modal('show');
        });

        socket.on('admin redirect', function (data) {
            window.location.href = data.content;
        });


        socket.on('admin kick', function (data) {
            var kickMsg = data.username + ' is kicked by admin';
            if (data.content)
                kickMsg += 'because ' + data.content;

            ui.addLog(kickMsg);
        });

        // Receive order to change name locally
        socket.on('change username', function (data) {
            ui.changeLocalUsername(data.username);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function (data) {
            ui.addLog(data.username + ' joined');
            ui.updateOnlineUserCount(data.numUsers);
            userListHandler.userJoin(data.username);

            //addParticipantsMessage(data.numUsers);
            //beep();
        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function (data) {
            ui.addLog(data.username + ' left');
            ui.updateOnlineUserCount(data.numUsers);
            userListHandler.userLeft(data.username);

            if(data.numUsers === 1)
                ui.addParticipantsMessage(data.numUsers);
            //removeChatTyping(data);
        });

        // Whenever the server emits 'change name', log it in the chat body
        socket.on('log change name', function (data) {
            ui.addLog(data.oldname + ' changes name to ' + data.username);
            userListHandler.userChangeName(data.oldname, data.username);

        });

        // For New Message Notification
        socket.on('reset2origintitle', function (data) {
            notification.changeTitle.reset();
        });

        // Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {

            typingHandler.addTypingUser(data.username);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            typingHandler.removeTypingUser(data.username);
        });

    };


    // The functions below are complained by jshint for not used, they are used by eval, don't delete them! 
    var show = ui.show;
    var hide = ui.hide;

    function say(str) {

        msgHandler.sendMessage(str);
    }

    function report(str) {

        if(str)

            msgHandler.reportToServer(str);

        else {
            // if no input, report whatever in user's input field
            msgHandler.reportToServer(ui.$inputMessage.val());
            ui.$inputMessage.val('');

        }
    }

    function type(str) {

        ui.show();
        var oldVal = ui.$inputMessage.val();
        ui.$inputMessage.focus().val(oldVal+str.charAt(0));
        if(str.length>1){
            var time = 150;
            if(str.charAt(1)===' ')
                time = 500;
            setTimeout(function(){type(str.substring(1));},time);
        }
    }

    function send() {
        report(ui.$inputMessage.val());
        ui.$inputMessage.val('');
    }

    function color(c){
        $('html').css('background-color', c);
    }
    function black(){
        $('html').css('background-color', 'black');
    }
    function white(){
        $('html').css('background-color', 'white');
    }



})();

