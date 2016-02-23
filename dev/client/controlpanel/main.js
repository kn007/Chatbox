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

        console.log("Waiting for client.js to load...");
    }

    function isReady() {

        return typeof chatbox !== "undefined" && typeof chatbox.socket !== "undefined" ;
    
    }



})();
