(function() {
    "use strict";
   
    var utils = chatbox.utils;

    var ui = chatboxAdmin.ui;

    var $tokenStatus;

    //=================================================================================//
    //=================================================================================//
    //================================= Token Area ====================================//
    //=================================================================================//
    //=================================================================================//


    ui.init.push(function() {

        $tokenStatus = $('#socketchatbox-tokenStatus');

        $('#socketchatbox-updateToken').click(function() {
            
            updateToken($('#socketchatbox-token').val());
        
        });

        $(window).keydown(function (event) {

            // When the client hits ENTER on their keyboard
            if (event.which === 13) {

                if ($('#socketchatbox-token').is(":focus")) {
                    updateToken($('#socketchatbox-token').val());
                    return;
                }
            }

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

        $tokenStatus.html('Valid Token');
        $tokenStatus.removeClass('error');
        $tokenStatus.addClass('green');
    }

    ui.validToken = validToken;

    function updateToken(t) {

        chatboxAdmin.verified = false;
        chatboxAdmin.token = t;
        utils.addCookie('chatBoxAdminToken', t);
        chatboxAdmin.restartGetUserList();
    }



})();
