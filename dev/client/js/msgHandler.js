(function() {
    "use strict";

    var historyHandler = chatbox.historyHandler;
    var msgHandler = chatbox.msgHandler;
    var utils = chatbox.utils;
    var ui = chatbox.ui;


    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms

    var typing = false;
    var lastTypingTime;


    // Process message before displaying
    function processChatMessage(data, options) {
        options = options || {};

        //avoid empty name
        if (typeof data.username === 'undefined' || data.username==='')
           data.username = "empty name";

        // Don't fade the message in if there is an 'X was typing'
        //var $typingMessages = getTypingMessages(data);

        // if ($typingMessages.length !== 0) {
        //     options.fade = false;
        //     $typingMessages.remove();
        // }

        var d = new Date();
        var posttime = '';
        if (!options.loadFromCookie) {
            posttime += "<span class='socketchatbox-messagetime'>";
            posttime += ' ('+('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2)+')';
            posttime += "</span>";
        }

        var $usernameDiv = $('<div></div>').html($("<div>").text(data.username).html()+posttime);


        $usernameDiv.addClass('socketchatbox-username');
        var $messageBodyDiv = $('<span class="socketchatbox-messageBody">');
        if (data.username === chatbox.username) {
            $messageBodyDiv.addClass('socketchatbox-messageBody-me');
        } else {
            $messageBodyDiv.addClass('socketchatbox-messageBody-others');
        }
        var messageToSaveIntoCookie = "";

        // receiving image file in base64
        if (options.file) {
            var mediaType = "img";
            if (data.file.substring(0,10)==='data:video')
                mediaType = "video controls";

            if (data.file.substring(0,10)==='data:image' || data.file.substring(0,10)==='data:video') {
                $messageBodyDiv.addClass("hasMedia");
                $messageBodyDiv.html("<a target='_blank' href='" + data.file + "'><"+mediaType+" class='chatbox-image' src='"+data.file+"'></a>");
            }else{
                $messageBodyDiv.html("<a target='_blank' download='" + data.fileName +"' href='"+data.file+"'>"+data.fileName+"</a>");
            }

            messageToSaveIntoCookie = data.fileName+" (File)";
            if(data.username === chatbox.username){
                ui.receivedFileSentByMyself();
            }


        }else{

            messageToSaveIntoCookie = data.message;

            if (utils.checkImageUrl(data.message)) {
                //receiving image url
                $messageBodyDiv.html("<a target='_blank' href='" + data.message + "'><img class='chatbox-image' src='" + data.message + "'></a>");
            }else {
                //receiving plain text
                $messageBodyDiv.text(data.message);
            }
        }

        // receiving new message
        if (!options.history && !options.typing) {

            // play new msg sound and change chatbox color to notify users
            if (data.username !== chatbox.username) {
                //newMsgBeep();
                if(document.hidden && changeTitleMode === 1 && changeTitle.done === 0) changeTitle.change();
                if(document.hidden && changeTitleMode === 2 && changeTitle.done === 0) changeTitle.flash();
                if(document.hidden && changeTitleMode === 3 && changeTitle.done === 0) changeTitle.notify();
                if(!document.hidden) chatbox.socket.emit('reset2origintitle', {});
            }

            historyHandler.save(data.username, messageToSaveIntoCookie);
        }


        var typingClass = options.typing ? 'socketchatbox-typing' : '';
        var $messageWrapper = $("<div class='socketchatbox-message-wrapper'></div>");
        var $messageDiv = $("<div class='socketchatbox-message'></div>")
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);
        $messageWrapper.append($messageDiv);
        if (data.username === chatbox.username) {
            $messageDiv.addClass('socketchatbox-message-me');
        } else {
            $messageDiv.addClass('socketchatbox-message-others');
        }

        ui.addMessageElement($messageWrapper, options);
    }

    msgHandler.processChatMessage = processChatMessage;



    function sendMessage (msg) {
        var data = {};
        data.username = chatbox.username;
        data.msg = msg+'';//cast string
        chatbox.socket.emit('new message', data);
    }

    msgHandler.sendMessage = sendMessage;

    // Different from sendMessageToServer(), only admin can see the message
    function reportToServer (msg) {
        var data = {};
        data.username = chatbox.username;
        data.msg = msg+'';//cast string
        chatbox.socket.emit('report', data);
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
        data.message = 'is typing';
        options={};
        options.typing = true;
        processChatMessage(data, options);
    }

    // Removes the visual chat typing message
    function removeChatTyping (data) {
        getTypingMessages(data).fadeOut(function() {
          $(this).remove();
        });
    }


    // Updates the typing event
    function updateTyping() {

        if (!typing) {
            typing = true;
            socket.emit('typing', {name:username});
         }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function() {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing', {name:username});
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);

    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
        return $('.socketchatbox-typing.socketchatbox-message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }


})();
