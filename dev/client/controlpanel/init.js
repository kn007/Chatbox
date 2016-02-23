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


    chatboxAdmin.refreshIntervalID = -1;
    chatboxAdmin.refreshInterval = 5; //sec

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
        chatboxAdmin.refreshIntervalID = setTimeout(function() {
            getUserList();

        }, chatboxAdmin.refreshInterval*1000);
    }

    chatboxAdmin.getUserList = getUserList;


})();
