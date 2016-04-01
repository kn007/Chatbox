(function() {
    "use strict";

    if(isReady())

        chatboxAdmin.init(); 

    else

        waitToStart();



    //wait for client.js to finish loading
    function waitToStart() {

        setTimeout(function(){

            if(isReady()) {
                
                chatboxAdmin.init(); 

            }else {

                setTimeout(function() { waitToStart(); }, 1000);
            }

        }, 1000);

        console.log("Waiting for Chatbox socket to login");
    }

    function isReady() {
        // wait until the socket joined - receive the welcome message from the server (user created on server side)

        return typeof chatbox !== "undefined" && typeof chatbox.socket !== "undefined" && chatbox.socket.joined;
    
    }



})();
