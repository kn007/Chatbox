(function() {
    "use strict";
   
   var utils = chatbox.utils;
   var socket = chatbox.socket;
    
    socket.on('listUsers', function (data) {



    });


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
            console.log('bad token: '+ token);
            $('#socketchatbox-online-users').html('Invalid Token!');
            $tokenStatus.html('Invalid Token!');
            $tokenStatus.addClass('error');
            $tokenStatus.removeClass('green');
            //$('.socketchatbox-admin-server').hide();

        } else {

            //$('.socketchatbox-admin-server').show();
            $tokenStatus.html('Valid Token');
            $tokenStatus.removeClass('error');
            $tokenStatus.addClass('green');

            if (!verified){
                verified = true;
                getServerStat();
            }

            // load new data about users and their sockets
            userDict = data.userdict;
            var newSelectedUsers = {};
            var newSelectedSockets = {};
            var newOpenedUserID;
            socketDict = {};
            partiallyselectedUsers = {};

            // add selectedSocketCount to user
            // link socket to user, put socket in socketDict
            // link user with its jqueryObj
            // link socket with its jqueryObj
            // display online user
            // update user detail window if opened
            for (var key in userDict) {

                var user = userDict[key];

                var isSelectedUser = false;
                var isPartiallySelectedUser = false;


                user.selectedSocketCount = 0; // for socket/user selection purpose

                if(user.id in selectedUsers) {
                    isSelectedUser = true;
                    newSelectedUsers[user.id] = user;
                    user.selectedSocketCount = user.count; // all sockets selected
                }


                for (var i = 0; i < user.socketList.length; i++) {

                    var s = user.socketList[i];
                    s.user = user;
                    socketDict[s.id] = s;

                    if(!isSelectedUser && s.id in selectedSockets) {

                        user.selectedSocketCount++;
                        if(user.selectedSocketCount === user.count) {

                            isSelectedUser = true;
                            newSelectedUsers[user.id] = user;


                        }else{

                            isPartiallySelectedUser = true;
                            partiallyselectedUsers[s.id] = s;

                        }
                    }

                }

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



})();
