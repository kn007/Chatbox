(function() {
    "use strict";

    var typingHandler = chatbox.typingHandler;
    var typingUserDict = {};

    var TYPING_STAY_TIME = 1000; // ms




    // Adds the visual chat typing message
    function updateTypingInfo() {        

        var msg = '';
        var typingUserCount = Object.keys(typingUserDict).length;
        if (typingUserCount > 0) {

            $('.socketchatbox-typing').show();

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
            
        }else
            $('.socketchatbox-typing').hide();


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

    typingHandler.removeAllTypingUser = function () {
        typingUserDict = {};
    };


})();
