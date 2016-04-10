(function() {
    "use strict";
   
    var dataHandler = chatboxAdmin.dataHandler;

    var scriptHandler = chatboxAdmin.scriptHandler;


    scriptHandler.canSend = function() {
        
        var userCount = dataHandler.selectedUsersCount();
        var socketCount = dataHandler.selectedSocketsCount();

        return (userCount + socketCount > 0);
    };

    // Send a script (Admin only)
    function sendScript(script) {


            var data = {};
            data.token = chatboxAdmin.token;
            data.content = script;
            data.userKeyList = dataHandler.getSelectedUserList();
            data.socketKeyList = dataHandler.getSelectedSocketList();
            data.type = 'admin script';
            chatbox.socket.emit('admin command', data);

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

    };

    scriptHandler.nextScript = function() {

        if (scriptPointer < scriptHist.length - 1) {
            scriptPointer++;
            return true;
        }

        return false;
    };

    scriptHandler.prevScript = function() {

        if (scriptPointer > 0){
            scriptPointer--;
            return true;
        }

        return false;
    };


})();
