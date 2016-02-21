(function() {
    "use strict";

    // Check if Chatbox HTML is loaded, if not, call Ajax to load the html template
    if($('.socketchatbox-page').length>0) {
        console.log("Found Chatbox HTML on this page, load Chatbox now.");
        chatbox.init();

    }else{

        console.log("Making Ajax call to load Chatbox HTML");
        $('body').append($('<div>').load(chatbox.domain+"/chatbox.html", function() {
            console.log("Chatbox HTML loaded with Ajax, load Chatbox now.");
            chatbox.init();
        }));
    }

})();

