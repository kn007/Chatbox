(function() {

    "use strict";
    //load history scripts
    //put in token
    window.chatboxAdmin = {};


    chatboxAdmin.scriptHandler = {};
    chatboxAdmin.dataHandler = {};
    chatboxAdmin.ui = {};   
    chatboxAdmin.ui.init = []; //init is an array of functions
    chatboxAdmin.socketEvent = {};

    var utils = chatbox.utils; //share admin utils and common user utills
    var socketEvent = chatboxAdmin.socketEvent;
    var ui = chatboxAdmin.ui;

    chatboxAdmin.refreshIntervalID = -1;
    chatboxAdmin.refreshInterval = 3; //sec

    chatboxAdmin.token = '123';

    chatboxAdmin.init = function() {

        console.log("Admin init");

        // load jquery objects and register events
        for (var i = 0; i < ui.init.length; i++) {
            ui.init[i]();
        }

        if(utils.getCookie('chatBoxAdminToken')!=='') {

            chatboxAdmin.token = utils.getCookie('chatBoxAdminToken');
            $('#socketchatbox-token').val(chatboxAdmin.token);

        }

        socketEvent.register();

        chatboxAdmin.getUserList();

    }


})();
