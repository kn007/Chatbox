(function() {

    "use strict";

    var ui = chatbox.ui;
    var utils = chatbox.utils;
    var fileHandler = chatbox.fileHandler;
    var msgHandler = chatbox.msgHandler;

    var $username;
    var $usernameInput;// Input for username
    var $inputMessage; // Input message input box
    var $chatBox;
    var $topbar;
    var $chatBody;
    var $showHideChatbox;
    var $chatboxResize;
    var $messages; // Messages area
    var $cross;
    var $chatArea;

    ui.init = function() {

        $username = $('#socketchatbox-username');
        $usernameInput = $('.socketchatbox-usernameInput'); 
        $inputMessage = $('.socketchatbox-inputMessage'); 
        $chatBox = $('.socketchatbox-page');
        $topbar = $('#socketchatbox-top');
        $chatBody = $('#socketchatbox-body');
        $showHideChatbox =  $('#socketchatbox-showHideChatbox');
        $chatboxResize = $('.socketchatbox-resize');
        $messages = $('.socketchatbox-messages');
        $cross = $('#socketchatbox-closeChatbox');
        $chatArea = $(".socketchatbox-chatArea");

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

        $cross.click(function() {
            $chatBox.hide();
        });


        // Prepare file drop box.
        $chatBox.on('dragenter', utils.doNothing);
        $chatBox.on('dragover', utils.doNothing);
        $chatBox.on('drop', function(e){
            e.originalEvent.preventDefault();
            var file = e.originalEvent.dataTransfer.files[0];
            sendFile(file);

        });

        $('#socketchatbox-imagefile').bind('change', function(e) {
            var file = e.originalEvent.target.files[0];
            sendFile(file);
        });


        //resize chatbox
        var prev_x = -1;
        var prev_y = -1;
        var dir = null;

        $chatboxResize.mousedown(function(e){
            prev_x = e.clientX;
            prev_y = e.clientY;
            dir = $(this).attr('id');
            e.preventDefault();
            e.stopPropagation();
        });

        $(document).mousemove(function(e){

            if (prev_x == -1) return;

            var boxW = $chatArea.outerWidth();
            var boxH = $chatArea.outerHeight();
            var dx = e.clientX - prev_x;
            var dy = e.clientY - prev_y;

            //Check directions
            if (dir.indexOf('n') > -1)  boxH -= dy;
            if (dir.indexOf('w') > -1)  boxW -= dx;
            if (dir.indexOf('e') > -1)  boxW += dx;

            if(boxW<240)    boxW = 240;
            if(boxH<70)     boxH = 70;

            $chatArea.css({ "width":(boxW)+"px", "height":(boxH)+"px"});

            prev_x = e.clientX;
            prev_y = e.clientY;
        });

        $(document).mouseup(function(){
            prev_x = -1;
            prev_y = -1;
        });

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



    }






    function show() {
        $showHideChatbox.text("↓");
        $username.text(chatbox.username);
        $chatBody.show();
        //show resize cursor
        $chatboxResize.css('z-index', 99999);
        $messages[0].scrollTop = $messages[0].scrollHeight;

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


    // Add it to chat area
    function addMessageElement($el) {

        $messages.append($el);

        //loading media takes time so we delay the scroll down
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    ui.addMessageElement = addMessageElement;

        // Log a message
    function addLog(log) {
        var $el = $('<li>').addClass('socketchatbox-log').text(log);
        addMessageElement($el);
    }

    ui.addLog = addLog;


    function addParticipantsMessage(numUsers) {
        var message = '';
        if (numUsers === 1) {

            message += "You are the only user online";

        }else {

            message += "There are " + numUsers + " users online";
        }

        addLog(message);

    }

    ui.addParticipantsMessage = addParticipantsMessage;


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
            msgHandler.sendMessage(message);
        }
    }
 








    // Tell server that user want to change username
    function askServerToChangeName (newName) {
        chatbox.socket.emit('user edits name', {newName: newName});
        if(utils.getCookie('chatboxOpen')==='1')
            $username.text('Changing your name...');
    }

    function receivedFileSentByMyself() {        
        $inputMessage.val('');
        $inputMessage.removeAttr('disabled');
        fileHandler.receivedFileSentByMyself();
    }

    ui.receivedFileSentByMyself = receivedFileSentByMyself;

    function sendFile(file) {

        $inputMessage.val('Sending file...');
        $inputMessage.prop('disabled', true);
        fileHandler.readThenSendFile(file);

    }








})();
