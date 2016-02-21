(function() {
    "use strict";
    window.chatbox = {};
    chatbox.utils = {};
    chatbox.ui = {};
    chatbox.historyHandler = {};
    chatbox.fileHandler = {};
    chatbox.msgHandler = {};
    chatbox.notification = {};
    chatbox.socketEvent = {};

    var utils = chatbox.utils;
    var ui = chatbox.ui;
    var historyHandler = chatbox.historyHandler;
    var socketEvent = chatbox.socketEvent;

    // change this to the port you want to use on server if you are hosting
    // TODO: move to config file
    var port = 4321;
    var hostname = location.hostname;
    // hostname="lifeislikeaboat.com";
    var domain = location.protocol + "//" + hostname + ":" + port;

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user,
    // multiple connections from same browser are regarded as same user.
    chatbox.uuid = "uuid not set!";
    chatbox.NAME = 'Chatbox';

    var d = new Date();
    var username = 'visitor#'+ d.getMinutes()+ d.getSeconds();
    chatbox.username = username;
    var comment_author = '';
    var totalUser = 0;


    chatbox.init = function() {

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

        // now make your connection with server!
        chatbox.socket = io(domain);
        socketEvent.register();
    }


})();

