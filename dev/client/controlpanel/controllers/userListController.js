(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;

   

    //=================================================================================//
    //=================================================================================//
    //============================== Online Users Area ================================//
    //=================================================================================//
    //=================================================================================//
    

    ui.init.push(function() {


        $('#selectAll').click(function() {

            dataHandler.selectAllUsers();
            ui.resetAllUsersHighlight();
            if (dataHandler.getOpenedUserID() !== '')
                ui.resetOpenUserSocketHighlight(dataHandler.getOpenedUserID());

        });

        $('#selectNone').click(function() {

            dataHandler.selectNoSocketNorUser();
            resetAllUsersHighlight();
            if (dataHandler.getOpenedUserID() !== '')
                ui.resetOpenUserSocketHighlight(dataHandler.getOpenedUserID());
        });        

    });
    

    // admin click on username to select/deselect
    $(document).on('click', '.username-info', function() {
        var $this = $(this);
        var userID = $this.data('id');
        dataHandler.toggleUserSelection(userID);
        resetAllUsersHighlight();

        // only need to resetSocketHighlight() if admin is clicking opened user 

        if (dataHandler.getOpenedUserID() === userID)
            ui.resetOpenUserSocketHighlight(userID); 
    });


    // this function doesn't take care highlighting 
    function renderOnlineUsers() {

        for (var key in dataHandler.getUserDict()) {
            var user = dataHandler.getUserDict()[key];


            // display online user

            var nameWithCount = user.username;

            // show number of connections of this user if more than one
            if(user.count > 1){
                nameWithCount += " <span class='badge'>"+user.count+"<span>";
            }

            var $usernameSpan = $("<button></button>");
            $usernameSpan.html(nameWithCount);
            $usernameSpan.prop('title', 'Join Time: '+ utils.getTimeElapsed(user.joinTime)); // better info to show?
            $usernameSpan.addClass("username-info");
            $usernameSpan.addClass("btn");
            $usernameSpan.addClass("btn-default");


            $usernameSpan.data('id', user.id);

            // add  ↓   after the user's name
            var $downArrowSpan = $("<button></button>");
            if (user.id === dataHandler.getOpenedUserID()){
                $downArrowSpan.text(' ↑ ');
                $downArrowSpan.prop('title', 'Close User Detail');

                $downArrowSpan.addClass('yellow');
                user.arrowSpan = $downArrowSpan;

            } else {
                $downArrowSpan.text(' ↓ ');
                $downArrowSpan.prop('title', 'Open User Detail');

            }

            $downArrowSpan.addClass("username-info-viewmore");
            $downArrowSpan.addClass('btn');
            $downArrowSpan.addClass("btn-default");

            $downArrowSpan.data('id', user.id);


            // also link user with his jquery object
            user.jqueryObj = $usernameSpan;

            // group username with down arrow
            var $usernameDiv = $('<div></div>');
            $usernameDiv.addClass('btn-group');
            $usernameDiv.addClass('socketchatbox-onlineuserlist-user');
            $usernameDiv.append($usernameSpan);
            $usernameDiv.append($downArrowSpan);



            $('#socketchatbox-online-users').append($usernameDiv);
            // $('#socketchatbox-online-users').append($downArrowSpan);

            // reload user detail if this is the user selected
            //if(user.id === openedUserID) {
            //    loadUserDetail(user);
            //    newOpenedUserID = user.id;
            //}
        }
    }

    ui.renderOnlineUsers = renderOnlineUsers;

    function resetAllUsersHighlight() {
        // sync user highlight
        for(var key in dataHandler.getUserDict()) {
            var user = dataHandler.getUserDict()[key];
            // check to see what status username selection should be in

            
            if (dataHandler.userFullySelected(key)) {

                user.jqueryObj.removeClass('partially-selected');
                user.jqueryObj.addClass('selected');

            }else if (dataHandler.userPartiallySelected(key)) {

                user.jqueryObj.removeClass('selected');
                user.jqueryObj.addClass('partially-selected');

            }else {

                user.jqueryObj.removeClass('selected');
                user.jqueryObj.removeClass('partially-selected');
            }

        }

    }

    ui.resetAllUsersHighlight = resetAllUsersHighlight;

})();
