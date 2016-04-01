(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;



    //=================================================================================//
    //=================================================================================//
    //=============================== Socket Detail Area ==============================//
    //=================================================================================//
    //=================================================================================//
    var uid = '-1';
    ui.showAliveSocket = false;

    ui.init.push(function() {

        $('.socketchatbox-livesockets-header').click(function() {

            if (ui.showAliveSocket)

                ui.showAliveSocket = false;
            else 
                ui.showAliveSocket = true;
            

            toggleSocketDetailVisibility();

        });
        toggleSocketDetailVisibility();

    });



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


    function toggleSocketDetailVisibility() {

        if (ui.showAliveSocket) 
            $('.socketchatbox-userdetail-sockets').slideDown(function(){
                $('.socketchatbox-livesockets-arrow').text(' ↑ ');
            });
        else
            $('.socketchatbox-userdetail-sockets').slideUp(function(){
                $('.socketchatbox-livesockets-arrow').text(' ↓ ');

            });
    }

    function loadSocketDetail(user) {

        if (user.id != uid) {
            uid = user.id;
            if (ui.showAliveSocket) {
                ui.showAliveSocket = false;
                toggleSocketDetailVisibility();
            }
        }

        $('.socketchatbox-userdetail-sockets').html('');
        $('.socketchatbox-livesockets-count').text(user.socketList.length);
        for (var i = 0; i< user.socketList.length; i++) {
            var s = user.socketList[i];
            var $socketInfoHeaderDiv = $("<div></div>");
            var socketInfoIndex = "<center>[" + i + "]</center>";
            $socketInfoHeaderDiv.html(socketInfoIndex);

            var $socketInfoTable = $("<div></div>");
            // var socketInfoHTML = "<center>[" + i + "]</center><br/>";
            var socketInfoHTML = "<table class='table table-bordered'><tbody>";
            socketInfoHTML += "<tr><td>ID</td><td class='breakable'>" + s.id + "</td></tr>";
            socketInfoHTML += "<tr><td>URL</td><td class='breakable'>" + utils.createNewWindowLink(s.url) + "</td></tr>";
            if (s.referrer)
                socketInfoHTML += "<tr><td>Referrer</td><td class='breakable'>" + utils.createNewWindowLink(s.referrer) + "</td></tr>";
            socketInfoHTML += "<tr><td>IP</td><td>" + s.ip + "</td></tr>";
            socketInfoHTML += "<tr><td>Total Messages</td><td>" + s.msgCount + "</td></tr>";

            if (s.lastMsg)
                socketInfoHTML += "<tr><td>Last Message</td><td class='breakable'>\"" + s.lastMsg + "\"</td></tr>";

            socketInfoHTML += "<tr><td>Idle Time</td><td>" + utils.getTimeElapsed(s.lastActive) + "</td></tr>";
            socketInfoHTML += "<tr><td>Connection Time</td><td>" + utils.getTimeElapsed(s.joinTime) + "</td></tr>";


            socketInfoHTML += "</tbody></table>";

            $socketInfoTable.html(socketInfoHTML);
            $socketInfoHeaderDiv.addClass('socketchatbox-socketdetail-each');
            // $socketInfoHeaderDiv.addClass('table-wrapper');

            $socketInfoHeaderDiv.data('id', s.id);
            // link jquery object with socket object
            s.jqueryObj = $socketInfoHeaderDiv;
            $('.socketchatbox-userdetail-sockets').append($socketInfoHeaderDiv);
            $('.socketchatbox-userdetail-sockets').append($socketInfoTable);
        }

    }

    ui.loadSocketDetail = loadSocketDetail;

   // only need to call this when the user is opened
    function resetOpenUserSocketHighlight(userID) {
        
        // console.log("resetOpenUserSocketHighlight "+userID);

        var user = dataHandler.getUserDict()[userID];

        for (var i = 0; i < user.socketList.length; i++) {

            var s = user.socketList[i];

            if(dataHandler.userFullySelected(user.id) || dataHandler.socketSelected(s.id)) 
                s.jqueryObj.addClass('selectedSocket');
            else 
                s.jqueryObj.removeClass('selectedSocket');
            
        }

    }

    ui.resetOpenUserSocketHighlight = resetOpenUserSocketHighlight;

})();
