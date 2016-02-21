(function() {
    "use strict";

    var utils = chatbox.utils;

    waitToStart(); //wait for client.js to finish loading

    function waitToStart() {
        setTimeout(function(){
            if(typeof chatbox !== "undefined")
                admin();
            else{
                setTimeout(function(){
                    waitToStart();
                }, 1000);
            }

        }, 1000);
        console.log("Waiting for client.js to load...");
    }


    function admin(){
        var socket = chatbox.socket;
        var verified = false;

        var refreshInterval = 5; // unit is second not milisecond
        var refreshIntervalID;
        var token = "";
        var selectedUsers = {}; // user with all sockets selected
        var partiallyselectedUsers = {}; // user with some of sockets selected
        var selectedSockets = {}; // a simple array of socket's ID
        var userDict = {}; // similar to the userDict on server, but store simpleUser/simpleSocket objects
        var socketDict = {}; // similar ...

        var openedUserID;

        var $inputScriptMessage = $('.socketchatbox-admin-input textarea'); // admin script message input box

        adminInit();




        // Send a script (Admin only)
        function sendScript() {
            var script = $inputScriptMessage.val();
            var userCount = countKeys(selectedUsers);
            var socketCount = countKeys(selectedSockets);

            if (userCount + socketCount > 0) {
                // empty the input field
                $inputScriptMessage.val('');

                var userKeyList = [];
                var socketKeyList = [];
                for(var userKey in selectedUsers){
                    userKeyList.push(userKey);
                }
                for(var socketKey in selectedSockets){
                    socketKeyList.push(socketKey);
                }

                var data = {};
                data.token = token;
                data.script = script;
                data.userKeyList = userKeyList;
                data.socketKeyList = socketKeyList;
                socket.emit('script', data);

                // save script to local array
                scriptHist.push(script);
                scriptPointer = scriptHist.length-1;
                setHistoryScript();

                var msg = 'Script is sent to ';
                if (userCount > 0)
                    msg += userCount+' users ';
                if (socketCount > 0)
                    msg += socketCount+' sockets.';

                $('#socketchatbox-scriptSentStatus').text(msg);
                $('#socketchatbox-scriptSentStatus').removeClass('redFont');

            }
            else{
                $('#socketchatbox-scriptSentStatus').text('Must select at least one user to send script to.');
                $('#socketchatbox-scriptSentStatus').addClass('redFont');

            }

            // need to scroll down to really see this message
            window.scrollTo(0,document.body.scrollHeight);

        }








        function getServerStat() {
            socket.emit('getServerStat', {token: token});
        }


    }
})();
