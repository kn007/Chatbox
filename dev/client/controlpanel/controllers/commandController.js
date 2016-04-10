(function() {
    "use strict";
   

    var ui = chatboxAdmin.ui;
    var commandHandler = chatboxAdmin.commandHandler;

    //=================================================================================//
    //=================================================================================//
    //================================ Bulk Action Area ===============================//
    //=================================================================================//
    //=================================================================================//

    ui.init.push(function() {

        $('.socketchatbox-command-message').click(function(e){
            e.preventDefault();
            messagePrompt();
        });

        $('.socketchatbox-command-redirect').click(function(e){
            e.preventDefault();
            redirectPrompt();
        });


        $('.socketchatbox-command-kick').click(function(e){
            e.preventDefault();
            kickConfirm();
        });

    });


    function messagePrompt() {

        bootbox.prompt("Send Message To Selected User/Sockets", function(msg) {                
            if (msg === null) {                                             
                                         
            } else {
                 commandHandler.sendMessage(msg);                  
            }
        });  
    }

    function redirectPrompt() {
    
        bootbox.prompt("Redirect Users/Sockets To", function(url) {                
            if (url === null) {                                             
                                         
            } else {
                
                commandHandler.redirect(url);                  
                
            }
        });  
    }

    function kickConfirm() {

        bootbox.confirm({
            size: 'small',
            message: "Are you sure?", 
            callback: function(confirmed) {
                if (confirmed)
                    commandHandler.kick();
            }
        }); 
    }


    




})();
