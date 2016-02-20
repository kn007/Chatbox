window.chatbox = window.chatbox || {};
"use strict";

(function() {

  
    // The functions below are for admin to use, user himself can't really call them


    function say(str) {
        sendMessageToServer(str);
    }

    function report(str) {
        if(str)
            reportToServer(str);

        else if($inputMessage.val()){
            // if no input, report whatever in user's input field
            report($inputMessage.val());
            $inputMessage.val('');

        }
    }

    function type(str) {
        show();
        var oldVal = $inputMessage.val();
        $inputMessage.focus().val(oldVal+str.charAt(0));
        if(str.length>1){
            var time = 150;
            if(str.charAt(1)===' ')
                time = 500;
            setTimeout(function(){type(str.substring(1));},time);
        }
    }

    function send() {
        report($inputMessage.val());
        $inputMessage.val('');
    }

    function color(c){
        $('html').css('background-color', c);
    }
    function black(){
        $('html').css('background-color', 'black');
    }
    function white(){
        $('html').css('background-color', 'white');
    }


})();   

