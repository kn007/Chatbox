window.chatbox = window.chatbox || {};
"use strict";

(function() {

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms

    var typing = false;
    var lastTypingTime;




        // Log a message
    function log (message, options) {
        var $el = $('<li>').addClass('socketchatbox-log').text(message);
        addMessageElement($el, options);
    }




    function addParticipantsMessage (numUsers) {
        var message = '';
        if (numUsers === 1) {
            message += "You are the only user online";
        }else if (totalUser === 0) {
            message += "There are " + numUsers + " users online";
        }
        log(message);

        totalUser = numUsers;
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
