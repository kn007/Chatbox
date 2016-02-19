window.chatbox = window.chatbox || {};
"use strict";

(function() {


    chatbox.loadHistory = function() {

        var chatHistory = [];

        try {

            chatHistory = JSON.parse(getCookie('chathistory'));

        }catch(e) {

        }

        if(chatHistory.length) {

            log("----Chat History----");

            options = {};
            options.loadFromCookie = true;

            for(var i=0; i<chatHistory.length; i++) {

                var data = chatHistory[i];
                processChatMessage(data, options);
            }

            log('-----End of History-----');
        }
    }


    chatbox.saveHistory = function(username, msg) {

        var chatHistory = [];

        try{

            chatHistory = JSON.parse(getCookie('chathistory'));

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
            addCookie('chathistory',JSON.stringify(chatHistory));
        }
    }


})();   

