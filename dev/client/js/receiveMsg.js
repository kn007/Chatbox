window.chatbox = window.chatbox || {};
"use strict";

(function() {


    // Process message before displaying
    function processChatMessage (data, options) {

        //avoid empty name
        if (typeof data.username === 'undefined' || data.username==='')
           data.username = "empty name";

        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var d = new Date();
        var posttime = '';
        if (!options.loadFromCookie) {
            posttime += "<span class='socketchatbox-messagetime'>";
            posttime += ' ('+('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2)+')';
            posttime += "</span>";
        }

        var $usernameDiv = $('<div></div>')
            .html($("<div>").text(data.username).html()+posttime)
            .css('color', getUsernameColor(data.username));
        $usernameDiv.addClass('socketchatbox-username');
        var $messageBodyDiv = $('<span class="socketchatbox-messageBody">');
        if (data.username === username) {
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

            if (checkImageUrl(data.message)) {
                //receiving image url
                $messageBodyDiv.html("<a target='_blank' href='" + data.message + "'><img class='chatbox-image' src='" + data.message + "'></a>");
            }else {
                //receiving plain text
                $messageBodyDiv.text(data.message);
            }
        }

        // receiving new message
        if (!options.loadFromCookie && !options.typing) {

            // play new msg sound and change chatbox color to notify users
            if (data.username !== username) {
                newMsgBeep();
                if(document.hidden && changeTitleMode === 1 && changeTitle.done === 0) changeTitle.change();
                if(document.hidden && changeTitleMode === 2 && changeTitle.done === 0) changeTitle.flash();
                if(document.hidden && changeTitleMode === 3 && changeTitle.done === 0) changeTitle.notify();
                if(!document.hidden) socket.emit('reset2origintitle', {});

                // do we want to change chatbox top color or make it shake to notify user of new message?
                // $('#chat-top').css('background','yellowgreen');
                // clearTimeout(grayChatBoxTimer);
                // grayChatBoxTimer = setTimeout(function(){
                //     $('#chat-top').css('background','lightgray');
                // },60*1000);
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
        if (data.username === username) {
            $messageDiv.addClass('socketchatbox-message-me');
        } else {
            $messageDiv.addClass('socketchatbox-message-others');
        }

        addMessageElement($messageWrapper, options);
    }




    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    // all other messages (default = false)
    function addMessageElement (el, options) {

        var $el = $(el);

        // Setup default options
        options = options || {};

        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }

        //loading media takes time so we delay the scroll down
        setTimeout(function(){
            $messages[0].scrollTop = $messages[0].scrollHeight;
        },50);
    }


})();

