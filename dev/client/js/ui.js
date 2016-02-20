(function() {

    "use strict";

    var ui = chatbox.ui;
    var utils = chatbox.utils;


    var $username = $('#socketchatbox-username');
    var $usernameInput = $('.socketchatbox-usernameInput'); // Input for username
    var $inputMessage = $('.socketchatbox-inputMessage'); // Input message input box
    var $chatBox = $('.socketchatbox-page');
    var $topbar = $('#socketchatbox-top');
    var $chatBody = $('#socketchatbox-body');
    var $showHideChatbox =  $('#socketchatbox-showHideChatbox');
    var $chatboxResize = $('.socketchatbox-resize');

    function show() {
        $showHideChatbox.text("↓");
        $username.text(chatbox.username);
        $chatBody.show();
        //show resize cursor
        $chatboxResize.css('z-index', 99999);

    }

    ui.show = show;

    function hide() {
        $showHideChatbox.text("↑");
        $username.html("<a href='http://arch1tect.github.io/Chatbox/' target='_blank'>" + chatbox.NAME + '</a>');
        $chatBody.hide();
        //hide resize cursor
        $chatboxResize.css('z-index', -999);
    }

    ui.hide = hide;

    // When user change his username by editing though GUI, go through server to get permission
    // since we may have rules about what names are forbidden in the future
    function changeNameByEdit() {
        var name = $('#socketchatbox-txt_fullname').val();
        name = $.trim(name);
        if (name === chatbox.username || name === "")  {
            $username.text(chatbox.username);
            return;
        }

        //if (!sendingFile) {
            askServerToChangeName(name);
        //}
    }
    ui.changeNameByEdit = changeNameByEdit;

        // Change local username value and update local cookie
    function changeLocalUsername(name) {
        if(name) {
            chatbox.username = name;
            utils.addCookie('chatname', name);
            if(utils.getCookie('chatboxOpen')==='1')
                $username.text(chatbox.username);
        }
    }

    ui.changeLocalUsername = changeLocalUsername;

    // Send a message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = utils.cleanInput(message);
        // if there is a non-empty message
        if (message) {
            // empty the input field
            $inputMessage.val('');
            sendMessageToServer(message);
        }
    }
 
    function sendMessageToServer (msg) {
        var data = {};
        data.username = chatbox.username;
        data.msg = msg+'';//cast string
        chatbox.socket.emit('new message', data);
    }

    // Different from sendMessageToServer(), only admin can see the message
    function reportToServer (msg) {
        var data = {};
        data.username = username;
        data.msg = msg+'';//cast string
        chatbox.socket.emit('report', data);
    }




    $(window).keydown(function (event) {

        // When the client hits ENTER on their keyboard
        if (event.which === 13) {

            if ($('#socketchatbox-txt_fullname').is(":focus")) {
                changeNameByEdit();
                $inputMessage.focus();
                return;
            }

            if (chatbox.username && $inputMessage.is(":focus")) {
                sendMessage();
                chatbox.socket.emit('stop typing', {name: chatbox.username});
                //typing = false;
            }
        }

        // When the client hits ESC on their keyboard
        if (event.which === 27) {
            if ($('#socketchatbox-txt_fullname').is(":focus")) {
                $username.text(username);
                $inputMessage.focus();
                return;
            }
        }

    });





    $topbar.click(function() {

        if($chatBody.is(":visible")){

            hide();
            utils.addCookie('chatboxOpen',0);
        }else {
            show();
            utils.addCookie('chatboxOpen',1);
        }
    });

    // user edit username
    $username.click(function(e) {
        e.stopPropagation(); //don't propagate event to topbar

        if(utils.getCookie('chatboxOpen')!=='1') {
            return;
        }
        //if(sendingFile) return; //add it back later

        if($('#socketchatbox-txt_fullname').length > 0) return;
        //if($('#socketchatbox-txt_fullname').is(":focus")) return;

        var name = $(this).text();
        $(this).html('');
        $('<input></input>')
            .attr({
                'type': 'text',
                'name': 'fname',
                'id': 'socketchatbox-txt_fullname',
                'size': '10',
                'value': name
            })
            .appendTo('#socketchatbox-username');
        $('#socketchatbox-txt_fullname').focus();
    });



    // Tell server that user want to change username
    function askServerToChangeName (newName) {
        chatbox.socket.emit('user edits name', {newName: newName});
        if(utils.getCookie('chatboxOpen')==='1')
            $username.text('Changing your name...');
    }



    //resize

    var prev_x = -1;
    var prev_y = -1;
    var dir = null;
    $(".socketchatbox-resize").mousedown(function(e){
        prev_x = e.clientX;
        prev_y = e.clientY;
        dir = $(this).attr('id');
        e.preventDefault();
        e.stopPropagation();
    });

    $(document).mousemove(function(e){

        if (prev_x == -1)
            return;

        var boxW = $(".socketchatbox-chatArea").outerWidth();
        var boxH = $(".socketchatbox-chatArea").outerHeight();
        var dx = e.clientX - prev_x;
        var dy = e.clientY - prev_y;

        //Check directions
        if (dir.indexOf('n') > -1) //north
        {
            boxH -= dy;
        }

        if (dir.indexOf('w') > -1) //west
        {
            boxW -= dx;
        }
        if (dir.indexOf('e') > -1) //east
        {
            boxW += dx;
        }

        //console.log('boxW '+boxW);
        //console.log('boxH '+boxH);
        if(boxW<210) boxW = 210;
        if(boxH<30) boxH = 30;

        $(".socketchatbox-chatArea").css({
            "width":(boxW)+"px",
            "height":(boxH)+"px",
        });

        prev_x = e.clientX;
        prev_y = e.clientY;
    });

    $(document).mouseup(function(){
        prev_x = -1;
        prev_y = -1;
    });



})();
