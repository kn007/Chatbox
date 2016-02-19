

(function() {
    "use strict";
    window.chatbox = window.chatbox || {};
    
    var util = chatbox.util;
    var ui = chatbox.ui; 
    var chatHistory = chatbox.chatHistory;

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
    var comment_author = '';
    var totalUser = 0;


    var $window = $(window);


    chatbox.init = function() {

        // Read old uuid from cookie if exist
        if(util.getCookie('chatuuid')!=='') {
            
            chatbox.uuid = util.getCookie('chatuuid');

        }else {

            uuid = util.guid();
            util.addCookie('chatuuid', uuid);
        }

        // Read old username from cookie if exist
        if(util.getCookie('chatname')!=='') {

            username = util.getCookie('chatname');

        }else {

            util.addCookie('chatname', username);
        }

        chatHistory.load();

        // Show/hide chatbox base on cookie value
        if(getCookie('chatboxOpen')==='1') {

            ui.show();

        }else{

            ui.hide();
        }

        // now make your connection with server!
        socket = io(domain);
    }


})();   

