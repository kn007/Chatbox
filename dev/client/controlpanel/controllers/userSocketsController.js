(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var scriptHandler = chatboxAdmin.scriptHandler;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;



    //=================================================================================//
    //=================================================================================//
    //=============================== Socket Detail Area ==============================//
    //=================================================================================//
    //=================================================================================//


    // admin click on socket info to select/deselect
    $(document).on('click', '.socketchatbox-socketdetail-each', function() {

        var $this = $(this);

        var socketID = $this.data('id');
        var s = dataHandler.getSocketDict()[socketID];

        var user = s.user;

        dataHandler.toggleSocketSelection(socketID);

        ui.resetAllUsersHighlight();
        ui.resetOpenUserSocketHighlight(user.id);


    });

    function loadSocketDetail(user) {

        $('.socketchatbox-userdetail-sockets').html('');

        for (var i = 0; i< user.socketList.length; i++) {
            var s = user.socketList[i];
            var $socketInfo = $("<div></div");
            var socketInfoHTML = "<center>[" + i + "]</center></p>";
            socketInfoHTML += "<p>ID: " + s.id + "</p>";
            socketInfoHTML += "<p>URL: " + s.url + "</p>";
            if (s.referrer)
                socketInfoHTML += "<p>Referrer: " + s.referrer + "</p>";
            socketInfoHTML += "<p>IP: " + s.ip + "</p>";
            socketInfoHTML += "<p>Total Messages: " + s.msgCount + "</p>";

            if (s.lastMsg)
                socketInfoHTML += "<p>Last Message: \"" + s.lastMsg + "\"</p>";

            socketInfoHTML += "<p>Idle Time: " + utils.getTimeElapsed(s.lastActive) + "</p>";
            socketInfoHTML += "<p>Connection Time: " + utils.getTimeElapsed(s.joinTime) + "</p>";

            $socketInfo.html(socketInfoHTML);
            $socketInfo.addClass('socketchatbox-socketdetail-each');

            $socketInfo.data('id', s.id);
            // link jquery object with socket object
            s.jqueryObj = $socketInfo;
            $('.socketchatbox-userdetail-sockets').append($socketInfo);
        }

    }

    ui.loadSocketDetail = loadSocketDetail;

   // only need to call this when the user is opened
    function resetOpenUserSocketHighlight(userID) {
        
        // console.log("resetOpenUserSocketHighlight "+userID);

        var user = dataHandler.getUserDict()[userID];

        for (var i = 0; i < user.socketList.length; i++) {

            var s = user.socketList[i];

            if(dataHandler.userFullySelected(user.id) || dataHandler.socketSelected(s.id)) {

                s.jqueryObj.addClass('selectedSocket');

            }else {
                s.jqueryObj.removeClass('selectedSocket');
            }
        }

    }

    ui.resetOpenUserSocketHighlight = resetOpenUserSocketHighlight;

})();
