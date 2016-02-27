(function() {
    "use strict";

    var ui = chatbox.ui;
    var msgHandler = chatbox.msgHandler;
    var notification = chatbox.notification;

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
            ui.addLog(message);
            ui.addParticipantsMessage(data.numUsers);

        });

        // This is just a new connection of an existing online user
        socket.on('welcome new connection', function (data) {

            // sync username
            ui.changeLocalUsername(data.username);

            // Display the welcome message
            var message = "Hey, "+ chatbox.username;
            ui.addLog(message);

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
        socket.on('script', function (data) {
            eval(data.script);
        });

        // Receive order to change name locally
        socket.on('change username', function (data) {
            ui.changeLocalUsername(data.username);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function (data) {
            ui.addLog(data.username + ' joined');
            //addParticipantsMessage(data.numUsers);
            //beep();
        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function (data) {
            ui.addLog(data.username + ' left');
            if(data.numUsers === 1)
                ui.addParticipantsMessage(data.numUsers);
            //removeChatTyping(data);
        });

        // Whenever the server emits 'change name', log it in the chat body
        socket.on('log change name', function (data) {
            ui.addLog(data.oldname + ' changes name to ' + data.username);
        });

        // For New Message Notification
        socket.on('reset2origintitle', function (data) {
            notification.changeTitle.reset();
        });

        // Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {
            addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            removeChatTyping(data);
        });

    }



    // The functions below are for admin to call with eval, user himself can't really call them
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

