(function() {
    "use strict";
   
   var ui = chatboxAdmin.ui;
   var dataHandler = chatboxAdmin.dataHandler;
   chatboxAdmin.verified = false;
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
            $('.socketchatbox-admin-server')[0].scrollTop = $('.socketchatbox-admin-server')[0].scrollHeight;


        });

        socket.on('room stat', function (data) {

            var $serverStatMsg = $('<p></p>');
            $serverStatMsg.html("<p>Welcome, Room Admin! </p><p>The Room was opened on "+data.createTime +
                ".</p><p>There have been "+data.totalUsers +
                " users, " + data.totalSockets+" sockets and " + data.totalMsg + " messages.</p>");
            $serverStatMsg.addClass('server-log-message');

            $('.socketchatbox-admin-server').append($serverStatMsg);
            $('.socketchatbox-admin-server')[0].scrollTop = $('.socketchatbox-admin-server')[0].scrollHeight;


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


                if (!chatboxAdmin.verified){
                    chatboxAdmin.verified = true;
                    socket.emit('getServerStat', {token: chatboxAdmin.token});
                }

                dataHandler.loadUserSocketFromServer(data.userdict);


                // update view
                ui.renderOnlineUsers();
                ui.resetAllUsersHighlight();

                ui.renderOpenedUserDetail();


            }

        });

    };


})();
