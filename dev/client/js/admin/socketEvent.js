(function() {
    "use strict";
   
   var utils = chatbox.utils;
   var ui = chatboxAdmin.ui;
   var dataHandler = chatboxAdmin.dataHandler;

   var socketEvent = chatboxAdmin.socketEvent;

    socketEvent.register = function() {

        var socket = chatbox.socket;


        socket.on('server stat', function (data) {

            var $serverStatMsg = $('<p></p>');
            $serverStatMsg.html("<p>Welcome, Admin! </p><p>The Chatbox was started on "+data.chatboxUpTime +
                ".</p><p>There have been "+data.totalUsers +
                " users, " + data.totalSockets+" sockets and " + data.totalMsg + " messages.</p>");
            $serverStatMsg.addClass('server-log-message');

            $('.socketchatbox-admin-server').append($serverStatMsg);

        });

        socket.on('server log', function (data) {
            var $serverLogMsg = $('<p></p>');
            var d = new Date();
            var $timeStr = $('<span></span');
            $timeStr.addClass('log-time');
            var timeStr = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);

            $timeStr.text(timeStr);

            $serverLogMsg.append($timeStr);
            $serverLogMsg.append(data.log);
            $serverLogMsg.addClass('server-log-message');
            $('.socketchatbox-admin-server').append($serverLogMsg);
            $('.socketchatbox-admin-server')[0].scrollTop = $('.socketchatbox-admin-server')[0].scrollHeight;

        });

        // Only admin should receive this message
        socket.on('listUsers', function (data) {


            // clear online user display
            $('#socketchatbox-online-users').html('');


            if (!data.success) {
                
                $('#socketchatbox-online-users').html('Invalid Token!');
                ui.badToken();

            }else {

                ui.validToken();


                //if (!verified){
                //    verified = true;
                    //getServerStat();
                //}

                dataHandler.loadUserSocketFromServer(data.userdict);

                for (var key in userDict) {

                    var user = userDict[key];

 
                    // display online user

                    var nameWithCount = user.username;

                    // show number of connections of this user if more than one
                    if(user.count > 1){
                        nameWithCount += "("+user.count+")";
                    }

                    var $usernameSpan = $("<span></span>");
                    $usernameSpan.text(nameWithCount);
                    $usernameSpan.prop('title', 'Join Time: '+ getTimeElapsed(user.joinTime)); // better info to show?
                    $usernameSpan.addClass("username-info");
                    $usernameSpan.data('id', user.id);

                    // add [ ↓ ]  after the user's name
                    var $downArrowSpan = $("<span></span>");
                    if (user.id === openedUserID){
                        $downArrowSpan.text('[ ↑ ]');
                        $downArrowSpan.prop('title', 'Close User Detail');

                        $downArrowSpan.addClass('blue');
                        user.arrowSpan = $downArrowSpan;

                    } else {
                        $downArrowSpan.text('[ ↓ ]');
                        $downArrowSpan.prop('title', 'Open User Detail');

                    }

                    $downArrowSpan.addClass("username-info-viewmore");
                    $downArrowSpan.data('id', user.id);


                    // also link user with his jquery object
                    user.jqueryObj = $usernameSpan;

                    $('#socketchatbox-online-users').append($usernameSpan);
                    $('#socketchatbox-online-users').append($downArrowSpan);

                    // reload user detail if this is the user selected
                    if(user.id === openedUserID) {
                        loadUserDetail(user);
                        newOpenedUserID = user.id;
                    }
                }

                // data transfer done, update local stored data
                openedUserID = newOpenedUserID;
                selectedUsers = newSelectedUsers;
                selectedSockets = newSelectedSockets;

                // update view
                ui.syncHightlightGUI();
            }

        });

    }


})();
