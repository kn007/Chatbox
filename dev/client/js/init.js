window.chatbox = window.chatbox || {};
"use strict";

(function() {
    // change this to the port you want to use on server if you are hosting
    chatbox.port = 4321;
    chatbox.hostname = location.hostname;
    // chatbox.hostname="lifeislikeaboat.com";
    chatbox.domain = location.protocol + "//" + hostname + ":" + port;

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user,
    // multiple connections from same browser are regarded as same user.
    chatbox.uuid = "uuid not set!";
    chatbox.name = 'Chatbox';


    var $window = $(window);
    var $username = $('#socketchatbox-username');
    var $usernameInput = $('.socketchatbox-usernameInput'); // Input for username
    var $messages = $('.socketchatbox-messages'); // Messages area
    var $inputMessage = $('.socketchatbox-inputMessage'); // Input message input box
    var $chatBox = $('.socketchatbox-page');
    var $topbar = $('#socketchatbox-top');
    var $chatBody = $('#socketchatbox-body');


    chatbox.init = function() {

        // Read old uuid from cookie if exist
        if(getCookie('chatuuid')!=='') {
            
            uuid = getCookie('chatuuid');

        }else {

            uuid = guid();
            addCookie('chatuuid', uuid);
        }

        // Read old username from cookie if exist
        if(getCookie('chatname')!=='') {

            username = getCookie('chatname');

        }else {

            addCookie('chatname', username);
        }

        chatbox.loadHistory();

        // Show/hide chatbox base on cookie value
        if(getCookie('chatboxOpen')==='1') {

            show();

        }else{

            hide();
        }

        // now make your connection with server!
        socket = io(domain);
    }


})();   

