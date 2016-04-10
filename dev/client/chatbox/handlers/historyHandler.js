(function() {
    "use strict";


    var utils = chatbox.utils;
    var msgHandler = chatbox.msgHandler;
    var historyHandler = chatbox.historyHandler;
    var ui = chatbox.ui;

    
    historyHandler.load = function() {
        console.log("Load chat history");

        var chatHistory = [];

        try {

            chatHistory = JSON.parse(utils.getCookie('chathistory'));

        }catch(e) {

        }

        if(chatHistory.length) {

            ui.addLog("----Chat History----");

            var options = {};
            options.history = true;

            for(var i=0; i<chatHistory.length; i++) {

                var data = chatHistory[i];
                msgHandler.processChatMessage(data, options);
            }

            ui.addLog('-----End of History-----');
        }
    };


    historyHandler.save = function(username, msg) {

        var chatHistory = [];

        try{

            chatHistory = JSON.parse(utils.getCookie('chathistory'));

        }catch(e) {

        }

        if (chatHistory.length===0||
            // avoid same message being saved when user open multiple tabs
            chatHistory[chatHistory.length-1].username!==username||
            chatHistory[chatHistory.length-1].message!==msg){

            var dataToSaveIntoCookie = {};
            dataToSaveIntoCookie.username = username;
            dataToSaveIntoCookie.message = msg;
            chatHistory.push(dataToSaveIntoCookie);
            // keep most recent 20 messages only
            chatHistory = chatHistory.slice(Math.max(chatHistory.length - 20, 0));
            utils.addCookie('chathistory',JSON.stringify(chatHistory));
        }
    };


})();

