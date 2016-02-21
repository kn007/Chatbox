(function() {
    "use strict";
   
    var utils = chatbox.utils;


    var scriptHandler = chatboxAdmin.scriptHandler;

    scriptHandler.canSend = function() {
        
        var userCount = utils.countKeys(selectedUsers);
        var socketCount = utils.countKeys(selectedSockets);

        return (userCount + socketCount > 0);
    }

    // Send a script (Admin only)
    function sendScript(script) {
            

            var userKeyList = [];
            var socketKeyList = [];
            for(var userKey in dataHandler.selectedUsers){
                userKeyList.push(userKey);
            }
            for(var socketKey in dataHandler.selectedSockets){
                socketKeyList.push(socketKey);
            }

            var data = {};
            data.token = token;
            data.script = script;
            data.userKeyList = userKeyList;
            data.socketKeyList = socketKeyList;
            chatbox.socket.emit('script', data);

            // save script to history
            pushScript(script);

    }




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
