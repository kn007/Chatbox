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




        





        function getServerStat() {
            socket.emit('getServerStat', {token: token});
        }


    }
})();
