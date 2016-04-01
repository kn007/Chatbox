(function() {
    "use strict";
   
    var scriptHandler = chatboxAdmin.scriptHandler;

    var ui = chatboxAdmin.ui;

    //=================================================================================//
    //=================================================================================//
    //================================ Send Script Area ===============================//
    //=================================================================================//
    //=================================================================================//

    ui.init.push(function() {

        var $inputScriptMessage = $('.socketchatbox-admin-input textarea'); // admin script message input box

            $('.prevScript').click(function() {

                if(scriptHandler.prevScript()){
                    $('.socketchatbox-scriptHistoryScript').html(scriptHandler.getScript());
                }

            });

            $('.nextScript').click(function() {

                if(scriptHandler.nextScript()){
                    $('.socketchatbox-scriptHistoryScript').html(scriptHandler.getScript());
                }

            });

            $('.cloneScript').click(function() {

                $inputScriptMessage.val(scriptHandler.getScript());

            });


            $('#sendScript').click(function() {

                var script = $inputScriptMessage.val();

                if (scriptHandler.canSend()) {
                    // empty the input field
                    $inputScriptMessage.val('');

                    scriptHandler.sendScript(script);
                    $('.socketchatbox-scriptHistoryScript').html(scriptHandler.getScript());

                    var msg = 'Script is sent.';
                    // if (userCount > 0)
                    //     msg += userCount+' users ';
                    // if (socketCount > 0)
                    //     msg += socketCount+' sockets.';

                    $('#socketchatbox-scriptSentStatus').text(msg);
                    $('#socketchatbox-scriptSentStatus').removeClass('redFont');

                }else {
                    $('#socketchatbox-scriptSentStatus').text('Must select at least one user to send script to.');
                    $('#socketchatbox-scriptSentStatus').addClass('redFont');
                }

                // need to scroll down to really see this message
                // window.scrollTo(0,document.body.scrollHeight);
            });      

    });

    




})();
