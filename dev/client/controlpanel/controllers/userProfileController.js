(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;

    

    //=================================================================================//
    //=================================================================================//
    //=============================== Users Profile Area ==============================//
    //=================================================================================//
    //=================================================================================//

    ui.init.push(function() {

        $('.socketchatbox-admin-lookupIP').click(function() {
            window.open("https://geoiptool.com/en/?ip=");
        });


        $(window).keydown(function (event) {

            // When the client hits ENTER on their keyboard
            if (event.which === 13) {

                if ($('.socketchatbox-userdetail-name-edit').is(":focus")) {
                    
                    var userID = $('.socketchatbox-admin-changeUserName').data('id');
                    updateUserName(userID);
                    return;
                }
            }

        });


    });


    // open the user profile div
    $(document).on('click', '.username-info-viewmore', function() {
        var $this = $(this);
        var userID = $this.data('id');
        var user = dataHandler.getUserDict()[userID];

        // already opened, close now
        if (dataHandler.getOpenedUserID() === userID) {

            $('.socketchatbox-admin-userdetail-pop').slideUp();
            $this.text(' ↓ ');
            $this.removeClass('yellow');
            dataHandler.setOpenedUserID('');

        }else{

            var preOpenedUserID = dataHandler.getOpenedUserID();
            if (preOpenedUserID in dataHandler.getUserDict()) {
                var preOpenedUser = dataHandler.getUserDict()[preOpenedUserID];
                preOpenedUser.arrowSpan.text(' ↓ ');
                preOpenedUser.arrowSpan.removeClass('yellow');

            }

            $this.text(' ↑ ');
            $this.addClass('yellow');

            dataHandler.setOpenedUserID(userID);
            user.arrowSpan = $this;
            // Populate data into user detail
            loadUserDetail(user);

            // show
            if (!$('.socketchatbox-admin-userdetail-pop').is(":visible"))
                $('.socketchatbox-admin-userdetail-pop').slideDown();

            ui.resetOpenUserSocketHighlight(userID);
        }

    });

    function updateUserName(userID) {

        var newName = $('.socketchatbox-userdetail-name-edit').val();
        var data = {};
        data.token = chatboxAdmin.token;
        data.userID = userID;
        data.newName = newName;
        chatbox.socket.emit('admin change username', data);
        chatboxAdmin.restartGetUserList();
    }

    // admin change user's name
    $(document).on('click', '.socketchatbox-admin-changeUserName', function() {
        
        var $this = $(this);
        var userID = $this.data('id');
        updateUserName(userID);

    });

    function loadUserDetail(user) {

        // user info
        loadUserProfile(user);
        // socket info
        ui.loadSocketDetail(user);
        // action history
        ui.loadUserActionHistory(user);
        
    }

    function loadUserProfile(user) {

        $('.socketchatbox-userdetail-name').text(user.username);

        // don't refresh the element if value is the same, we don't want to interrupt editing name
        if ($('.socketchatbox-userdetail-name-edit').data('name') !==user.username){

            $('.socketchatbox-userdetail-name-edit').val(user.username);
            $('.socketchatbox-userdetail-name-edit').data('name',user.username);
        }
        $('.socketchatbox-admin-changeUserName').data('id',user.id);

        if ($('.socketchatbox-userdetail-landingpage').html() !== utils.createNewWindowLink(user.url))
            $('.socketchatbox-userdetail-landingpage').html(utils.createNewWindowLink(user.url));

        if (user.referrer)
            $('.socketchatbox-userdetail-referrer').html(utils.createNewWindowLink(user.referrer));
        else {
            $('.socketchatbox-userdetail-referrer').text('N/A');

        }
        if ($('.socketchatbox-userdetail-ip').text() !== user.ip )
            $('.socketchatbox-userdetail-ip').text(user.ip);

        $('.socketchatbox-userdetail-jointime').text(utils.getTimeElapsed(user.joinTime));

        if ($('.socketchatbox-userdetail-totalmsg').text() !== user.msgCount)
            $('.socketchatbox-userdetail-totalmsg').text(user.msgCount);

        if(!user.lastMsg)
            user.lastMsg = 'N/A';


        if ($('.socketchatbox-userdetail-lastmsg').text() !== user.lastMsg)
            $('.socketchatbox-userdetail-lastmsg').text(user.lastMsg);


        if ($('.socketchatbox-userdetail-lastactive').text() !== utils.getTimeElapsed(user.lastActive))
            $('.socketchatbox-userdetail-lastactive').text(utils.getTimeElapsed(user.lastActive));

        if ($('.socketchatbox-userdetail-useragent').text() !== user.userAgent)
            $('.socketchatbox-userdetail-useragent').text(user.userAgent);

        if ($('.socketchatbox-userdetail-room').text() !== user.roomID)
            $('.socketchatbox-userdetail-room').text(user.roomID);


    }

    // only if there's a user that's opened
    function renderOpenedUserDetail() {
            
        var openedUserID = dataHandler.getOpenedUserID();
        if (openedUserID in dataHandler.getUserDict()) {

            loadUserDetail(dataHandler.getUserDict()[openedUserID]);
            ui.resetOpenUserSocketHighlight(openedUserID);

        }else {
            dataHandler.setOpenedUserID('');
        }

    }

    ui.renderOpenedUserDetail = renderOpenedUserDetail; 


})();
