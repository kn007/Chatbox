(function() {
    "use strict";

    var utils = chatbox.utils;
            

    if(typeof chatbox !== "undefined")

        chatboxAdmin.init(); 

    else

        waitToStart();



    //wait for client.js to finish loading
    function waitToStart() {

        setTimeout(function(){

            if(typeof chatbox !== "undefined") {
                
                chatboxAdmin.init(); 

            }else {

                setTimeout(function() { waitToStart(); }, 1000);
            }

        }, 1000);

        console.log("Waiting for client.js to load...");
    }



})();
