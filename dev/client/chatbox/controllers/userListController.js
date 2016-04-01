(function() {

    "use strict";

    var ui = chatbox.ui;

    ui.init.push(function() {

        ui.$onlineUserNum = $('#socketchatbox-online-usercount');
        ui.$onlineUsers = $('.socketchatbox-onlineusers');

        ui.$onlineUserNum.click(function(e) {

            if (ui.$chatBody.is(":visible")){

                ui.$onlineUsers.slideToggle();
                e.stopPropagation();
            }

        });


    });

    ui.updateUserList = function(userList) {

        ui.$onlineUsers.html('');
        var counter = 0;
        for (var username in userList) {
            // console.log(username);
            counter++;
            var $onlineUser = $('<span></span>');
            $onlineUser.text(username);
            ui.$onlineUsers.append($onlineUser);

        }

        ui.$onlineUserNum.text(counter);

    };

})();
