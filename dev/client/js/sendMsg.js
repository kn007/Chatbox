window.chatbox = window.chatbox || {};
"use strict";

(function() {



    // Send a message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message
        if (message) {
            // empty the input field
            $inputMessage.val('');
            sendMessageToServer(message);
        }
    }

    function sendMessageToServer (msg) {
        var data = {};
        data.username = username;
        data.msg = msg+'';//cast string
        socket.emit('new message', data);
    }

    // Different from sendMessageToServer(), only admin can see the message
    function reportToServer (msg) {
        var data = {};
        data.username = username;
        data.msg = msg+'';//cast string
        socket.emit('report', data);
    }



})();
