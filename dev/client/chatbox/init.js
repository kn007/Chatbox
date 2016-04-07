(function() {
    "use strict";
    window.chatbox = {};
    chatbox.utils = {};
    chatbox.ui = {};
    chatbox.ui.init = []; //init is an array of functions
    chatbox.historyHandler = {};
    chatbox.userListHandler = {};
    chatbox.fileHandler = {};
    chatbox.msgHandler = {};
    chatbox.typingHandler = {};
    chatbox.notification = {};
    chatbox.socketEvent = {};

    var utils = chatbox.utils;
    var ui = chatbox.ui;
    var historyHandler = chatbox.historyHandler;
    var socketEvent = chatbox.socketEvent;

    // change this to the port you want to use on server if you are hosting
    // TODO: move to config file
    var port = chatboxOpt.port;
    var hostname = location.hostname;
    // hostname="lifeislikeaboat.com";
    chatbox.domain = location.protocol + "//" + hostname + ":" + port;
    console.log('chatbox.domain: ' + chatbox.domain);

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user,
    // multiple connections from same browser are regarded as same user.
    chatbox.uuid = "uuid not set!";
    chatbox.NAME = 'Chatbox';

    var d = new Date();
    var username = 'visitor#'+ d.getMinutes()+ d.getSeconds();
    chatbox.username = username;


    chatbox.init = function() {

        // load jquery objects and register events
        for (var i = 0; i < ui.init.length; i++) {
            ui.init[i]();
        }

        // Read old uuid from cookie if exist
        if(utils.getCookie('chatuuid')!=='') {

            chatbox.uuid = utils.getCookie('chatuuid');

        }else {

            chatbox.uuid = utils.guid();
            utils.addCookie('chatuuid', chatbox.uuid);
        }

        // Read old username from cookie if exist
        if(utils.getCookie('chatname')!=='') {

            chatbox.username = utils.getCookie('chatname');

        }else {

            utils.addCookie('chatname', chatbox.username);
        }

        historyHandler.load();

        // Show/hide chatbox base on cookie value
        if(utils.getCookie('chatboxOpen')==='1') {

            ui.show();

        }else{

            ui.hide();
        }


        if (typeof(chatbox.roomID) == 'undefined') 
            chatbox.roomID = '01cfcd4f6b8770febfb40cb906715822';
        

        // now make your connection with server!
        chatbox.socket = io(chatbox.domain);
        chatbox.socket.joined = false;
        socketEvent.register();
    };


})();

