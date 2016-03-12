(function() {

    "use strict";
    var utils = chatbox.utils;
    var ui = chatbox.ui;

    ui.init.push(function() {

        // user edit username
        ui.$username.click(function(e) {
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


        $(window).keydown(function (event) {

            // When the client hits ENTER on their keyboard
            if (event.which === 13) {

                if ($('#socketchatbox-txt_fullname').is(":focus")) {
                    changeNameByEdit();
                    ui.$inputMessage.focus();
                    return;
                }

            }

            // When the client hits ESC on their keyboard
            if (event.which === 27) {
                if ($('#socketchatbox-txt_fullname').is(":focus")) {
                    ui.$username.text(chatbox.username);
                    ui.$inputMessage.focus();
                    return;
                }
            }

        });

    });



    // When user change his username by editing though GUI, go through server to get permission
    // since we may have rules about what names are forbidden in the future
    function changeNameByEdit() {
        var name = $('#socketchatbox-txt_fullname').val();
        name = utils.cleanInput(name);
        name = $.trim(name);
        if (name === chatbox.username || name === "")  {
            ui.$username.text(chatbox.username);
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
                ui.$username.text(chatbox.username);
        }
    }

    ui.changeLocalUsername = changeLocalUsername;


    // Tell server that user want to change username
    function askServerToChangeName (newName) {
        chatbox.socket.emit('user edits name', {newName: newName});
        if(utils.getCookie('chatboxOpen')==='1')
            ui.$username.text('Changing your name...');
    }





})();
