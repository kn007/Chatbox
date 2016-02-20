(function() {
    "use strict";
    window.chatbox = window.chatbox || {};

    var msgHandler = {};
    chatbox.msgHandler = msgHandler;
    var utils = chatbox.utils;

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms

    var typing = false;
    var lastTypingTime;


    var $messages = $('.socketchatbox-messages'); // Messages area


    // Add it to chat area
    function addMessageElement($el) {

        $messages.append($el);

        //loading media takes time so we delay the scroll down
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }


    // Log a message
    function addLog(log) {
        var $el = $('<li>').addClass('socketchatbox-log').text(log);
        addMessageElement($el);
    }

    msgHandler.addLog = addLog;



    function addParticipantsMessage(numUsers) {
        var message = '';
        if (numUsers === 1) {
            message += "You are the only user online";
        }else if (totalUser === 0) {
            message += "There are " + numUsers + " users online";
        }
        addLog(message);

        totalUser = numUsers;
    }


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
                $messageBodyDiv.html("<a target='_blank' href='" + data.file + "'><"+mediaType+" class='chatbox-image' src='"+data.file+"'></a>");
            }else{
                $messageBodyDiv.html("<a target='_blank' download='" + data.fileName +"' href='"+data.file+"'>"+data.fileName+"</a>");
            }

            messageToSaveIntoCookie = data.fileName+"(File)";

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
            if (data.username !== username) {
                newMsgBeep();
                if(document.hidden && changeTitleMode === 1 && changeTitle.done === 0) changeTitle.change();
                if(document.hidden && changeTitleMode === 2 && changeTitle.done === 0) changeTitle.flash();
                if(document.hidden && changeTitleMode === 3 && changeTitle.done === 0) changeTitle.notify();
                if(!document.hidden) socket.emit('reset2origintitle', {});
            }

            writeChatHistoryIntoCookie(data.username, messageToSaveIntoCookie);
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

        addMessageElement($messageWrapper, options);
    }

    msgHandler.processChatMessage = processChatMessage;



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
