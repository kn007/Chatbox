(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var scriptHandler = chatboxAdmin.scriptHandler;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;

    

    //=================================================================================//
    //=================================================================================//
    //=============================== Users Profile Area ==============================//
    //=================================================================================//
    //=================================================================================//


    $('.socketchatbox-admin-lookupIP').click(function() {
        window.open("https://geoiptool.com/en/?ip=");
    });

    // open the user profile div
    $(document).on('click', '.username-info-viewmore', function() {
        var $this = $(this);
        var userID = $this.data('id');
        var user = dataHandler.getUserDict()[userID];

        // already opened, close now
        if (dataHandler.getOpenedUserID() === userID) {

            $('.socketchatbox-admin-userdetail-pop').hide();
            $this.text('[ ↓ ]');
            $this.removeClass('blue');
            dataHandler.setOpenedUserID('');

        }else{

            var preOpenedUserID = dataHandler.getOpenedUserID();
            if (preOpenedUserID in dataHandler.getUserDict()) {
                var preOpenedUser = dataHandler.getUserDict()[preOpenedUserID];
                preOpenedUser.arrowSpan.text('[ ↓ ]');
                preOpenedUser.arrowSpan.removeClass('blue');

            }

            $this.text('[ ↑ ]');
            $this.addClass('blue');

            dataHandler.setOpenedUserID(userID);
            user.arrowSpan = $this;
            // Populate data into user detail
            loadUserDetail(user);

            // show
            if (!$('.socketchatbox-admin-userdetail-pop').is(":visible"))
                $('.socketchatbox-admin-userdetail-pop').show();

            resetOpenUserSocketHighlight(userID);
        }

    });


    // admin change user's name
    $(document).on('click', '.socketchatbox-admin-changeUserName', function() {
        var $this = $(this);
        var userID = $this.data('id');
        var newName = $('.socketchatbox-userdetail-name-edit').val();
        var data = {};
        data.token = chatboxAdmin.token;
        data.userID = userID;
        data.newName = newName;
        chatbox.socket.emit('admin change username', data);
        restartGetUserList();

    });

    function loadUserDetail(user) {

        // user info
        loadUserProfile(user);
        // socket info
        loadSocketDetail(user);
        // action history
        loadUserActionHistory(user);
        
    }

    function loadUserProfile(user) {

        $('.socketchatbox-userdetail-name').text(user.username);

        // don't refresh the element if value is the same, we don't want to interrupt editing name
        if ($('.socketchatbox-userdetail-name-edit').data('name') !==user.username){

            $('.socketchatbox-userdetail-name-edit').val(user.username);
            $('.socketchatbox-userdetail-name-edit').data('name',user.username);
        }
        $('.socketchatbox-admin-changeUserName').data('id',user.id);
        $('.socketchatbox-userdetail-landingpage').text(user.url);
        $('.socketchatbox-userdetail-referrer').text(user.referrer);
        $('.socketchatbox-userdetail-ip').text(user.ip);
        $('.socketchatbox-userdetail-jointime').text(utils.getTimeElapsed(user.joinTime));
        $('.socketchatbox-userdetail-totalmsg').text(user.msgCount);
        if(!user.lastMsg)
            user.lastMsg = "";
        $('.socketchatbox-userdetail-lastmsg').text("\""+user.lastMsg+"\"");
        $('.socketchatbox-userdetail-lastactive').text(utils.getTimeElapsed(user.lastActive));
        $('.socketchatbox-userdetail-useragent').text(user.userAgent);

    }

    // only if there's a user that's opened
    function renderOpenedUserDetail() {
            
        var openedUserID = dataHandler.getOpenedUserID();
        if (openedUserID in dataHandler.getUserDict()) {

            loadUserDetail(dataHandler.getUserDict()[openedUserID]);
            resetOpenUserSocketHighlight(openedUserID);

        }else {
            dataHandler.setOpenedUserID('');
        }

    }

    ui.renderOpenedUserDetail = renderOpenedUserDetail;


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


})();
