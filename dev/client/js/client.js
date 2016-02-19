

function loadChatbox()
{
 
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        'black'
    ];

    // Initialize variables
    var d = new Date();
    var sendingFile = false;
    //var grayChatBoxTimer;
    var newMsgSound;
    var newUserSound;

     var typing = false;
    var lastTypingTime;
    var username = 'visitor#'+ d.getMinutes()+ d.getSeconds();
    var comment_author = '';
    var totalUser = 0;
     


    init();

 

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

    function receivedFileSentByMyself() {
        sendingFile = false;
        $inputMessage.val('');
        $inputMessage.removeAttr('disabled');
    }


    function checkImageUrl (url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    // Log a message
    function log (message, options) {
        var $el = $('<li>').addClass('socketchatbox-log').text(message);
        addMessageElement($el, options);
    }

    // Prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).text();
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

    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    function clearNewMessageNotification() {
        changeTitle.reset();
        socket.emit('reset2origintitle', {});
    }


    // Tell server that user want to change username
    function askServerToChangeName (newName) {
        socket.emit('user edits name', {newName: newName});
        if(getCookie('chatboxOpen')==='1')
            $username.text('Changing your name...');
    }


    // Change local username value and update local cookie
    function changeLocalUsername(name) {
        if(name) {
            username = name;
            addCookie('chatname', name);
            if(getCookie('chatboxOpen')==='1')
                $username.text(username);
        }
    }




}
