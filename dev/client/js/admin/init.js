(function() {

    "use strict";
    //load history scripts
    //put in token
    window.chatboxAdmin = {};


    chatboxAdmin.scriptHandler = {};
    chatboxAdmin.dataHandler = {};
    chatboxAdmin.ui = {};
    chatboxAdmin.socketEvent = {};

    var utils = chatbox.utils; //share admin utils and common user utills
    var socketEvent = chatboxAdmin.socketEvent;


    var refreshIntervalID = -1;
    var refreshInterval = 5;

    chatboxAdmin.token = '123';

    chatboxAdmin.init = function() {

        console.log("Admin init");

        if(utils.getCookie('chatBoxAdminToken')!=='') {

            chatboxAdmin.token = utils.getCookie('chatBoxAdminToken');
            $('#socketchatbox-token').val(chatboxAdmin.token);

        }

        socketEvent.register();

        getUserList();

    }


    // if token not right, should stop this endless call
    function getUserList() {

        chatbox.socket.emit('getUserList', {token: chatboxAdmin.token});
        refreshIntervalID = setTimeout(function() {
            getUserList();

        }, refreshInterval*1000);
    }


})();
