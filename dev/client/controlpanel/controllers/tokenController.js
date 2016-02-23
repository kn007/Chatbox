(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var scriptHandler = chatboxAdmin.scriptHandler;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;



    //=================================================================================//
    //=================================================================================//
    //================================= Token Area ====================================//
    //=================================================================================//
    //=================================================================================//
    ui.init.push(function() {

        ui.$tokenStatus = $('#socketchatbox-tokenStatus');

        $('#socketchatbox-updateToken').click(function() {
            
            updateToken($('#socketchatbox-token').val());
        
        });

    });


    function badToken() {

        console.log('bad token: '+ chatboxAdmin.token);
        $('#socketchatbox-online-users').html('Invalid Token!');
        $tokenStatus.html('Invalid Token!');
        $tokenStatus.addClass('error');
        $tokenStatus.removeClass('green');

    }

    ui.badToken = badToken;

    function validToken() {

        ui.$tokenStatus.html('Valid Token');
        ui.$tokenStatus.removeClass('error');
        ui.$tokenStatus.addClass('green');
    }

    ui.validToken = validToken;

    function updateToken(t) {

        chatboxAdmin.token = t;
        utils.addCookie('chatBoxAdminToken', t);
        chatboxAdmin.restartGetUserList();
    }



})();
