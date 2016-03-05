(function() {

    "use strict";

    var ui = chatbox.ui;
    var utils = chatbox.utils;

    ui.init.push(function() {

        ui.$onlineUserNum = $('#socketchatbox-online-usercount');
        ui.$onlineUserDropDown = $('.socketchatbox-onlineuser-dropdown');

        ui.$onlineUserNum.click(function(e) {
            ui.$onlineUserDropDown.toggle();
            e.stopPropagation();

        });

        $(document).on('click', function(event) {

            if (!$(event.target).closest(ui.$onlineUserDropDown).length) {
                // Hide the dropdown when click elsewhere.
                ui.$onlineUserDropDown.hide();
            }
        });

    });

    ui.updateUserList = function(userList) {

        ui.$onlineUserDropDown.html('');

        for (var username in userList) {
            console.log(username);
            var $list = $('<li></li>');
            $list.text(username);
            ui.$onlineUserDropDown.append($list);

        }

    }

})();
