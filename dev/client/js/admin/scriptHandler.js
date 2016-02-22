(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var dataHandler = chatboxAdmin.dataHandler;

    var scriptHandler = chatboxAdmin.scriptHandler;


    scriptHandler.canSend = function() {
        
        var userCount = dataHandler.selectedUsersCount();
        var socketCount = dataHandler.selectedSocketsCount();

        return (userCount + socketCount > 0);
    }

    // Send a script (Admin only)
    function sendScript(script) {
            

            var userKeyList = [];
            var socketKeyList = [];
            for(var userKey in dataHandler.getSelectedUsers()){
                userKeyList.push(userKey);
            }
            for(var socketKey in dataHandler.getSelectedSockets()){
                socketKeyList.push(socketKey);
            }

            var data = {};
            data.token = chatboxAdmin.token;
            data.script = script;
            data.userKeyList = userKeyList;
            data.socketKeyList = socketKeyList;
            chatbox.socket.emit('script', data);

            // save script to history
            pushScript(script);

    }

    scriptHandler.sendScript = sendScript;


    //=================================================
    //=================================================
    //=================Script History==================
    //=================================================
    //=================================================

    var scriptHist = [];
    var scriptPointer = -1;

    function pushScript(script) {

        scriptHist.push(script);
        scriptPointer = scriptHist.length-1;
    }
   
    scriptHandler.pushScript = pushScript;


    scriptHandler.getScript = function() {

        if (scriptPointer >= 0 && scriptPointer < scriptHist.length)
            return scriptHist[scriptPointer];

        return '';

    }

    scriptHandler.nextScript = function() {

        if (scriptPointer < scriptHist.length - 1) {
            scriptPointer++;
            return true;
        }

        return false;
    }

    scriptHandler.prevScript = function() {

        if (scriptPointer > 0){
            scriptPointer--;
            return true;
        }

        return false;
    }


})();
