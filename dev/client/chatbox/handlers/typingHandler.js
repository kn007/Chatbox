(function() {
    "use strict";


    var utils = chatbox.utils;
    var ui = chatbox.ui;



    var typingHandler = chatbox.typingHandler;
    var typingUserDict = {};

    var TYPING_STAY_TIME = 1000; // ms




    // Adds the visual chat typing message
    function updateTypingInfo() {        

        var msg = '';
        var typingUserCount = Object.keys(typingUserDict).length;
        if (typingUserCount > 0) {

            if (typingUserCount === 1){
                 
                 msg = Object.keys(typingUserDict)[0] + ' is typing';
            
            } else if (typingUserCount === 2) {
                
                msg = Object.keys(typingUserDict)[0] + ' and ' + Object.keys(typingUserDict)[1] + ' are typing';
            
            } else if (typingUserCount ===3) {
                
                msg = Object.keys(typingUserDict)[0] + ', ' + Object.keys(typingUserDict)[1] + 
                ' and ' + Object.keys(typingUserDict)[2] + ' are typing';

            } else {

                msg = Object.keys(typingUserDict)[0] + ', ' + Object.keys(typingUserDict)[1] + 
                ', ' + Object.keys(typingUserDict)[2] + ' and ' + (typingUserCount-3) + ' other users are typing';

            }
            
        }

        $('.socketchatbox-typing').text(msg);
    }

    typingHandler.updateTypingInfo = updateTypingInfo;

    // Removes typing user
    function removeTypingUser(username) {

        if (username in typingUserDict) {
            clearTimeout(typingUserDict[username]);
        } 

        delete typingUserDict[username];

        updateTypingInfo();
    }

    typingHandler.removeTypingUser = removeTypingUser;

    // Add typing user, auto remove after centain amount of time
    function addTypingUser(username) {

        if (username === chatbox.username) return;

        if (username in typingUserDict) {
            clearTimeout(typingUserDict[username]);
        } 
            
        typingUserDict[username] = setTimeout(function() {
            removeTypingUser(username);
        }, TYPING_STAY_TIME);

        updateTypingInfo();
    }

    typingHandler.addTypingUser = addTypingUser;

/*
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
    function getTypingMessages(data) {
        return $('.socketchatbox-typing.socketchatbox-message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }
*/

})();
