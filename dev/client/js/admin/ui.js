(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var scriptHandler = chatboxAdmin.scriptHandler;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;
    var $tokenStatus = $('#socketchatbox-tokenStatus');
    var $inputScriptMessage = $('.socketchatbox-admin-input textarea'); // admin script message input box


    //=================================================================================//
    //=================================================================================//
    //===================================Script UI=====================================//
    //=================================================================================//
    //=================================================================================//


    $('.prevScript').click(function() {

        if(historyHandler.prevScript()){
            $('.socketchatbox-scriptHistoryScript').html(historyHandler.getScritp());
        }

    });

    $('.nextScript').click(function() {

        if(historyHandler.nextScript()){
            $('.socketchatbox-scriptHistoryScript').html(historyHandler.getScritp());
        }

    });

    $('.cloneScript').click(function() {

        $inputScriptMessage.val(historyHandler.getScritp());

    });


    $('#socketchatbox-updateToken').click(function() {
        updateToken($('#socketchatbox-token').val());
    });



    $('.socketchatbox-admin-lookupIP').click(function() {
        window.open("https://geoiptool.com/en/?ip=");
    });


    $('#sendScript').click(function() {

        var script = $inputScriptMessage.val();

        if (scriptHandler.canSend()) {
            // empty the input field
            $inputScriptMessage.val('');

            scriptHandler.sendScript(script);
            $('.socketchatbox-scriptHistoryScript').html(scriptHandler.getScript());

            var msg = 'Script is sent.';
            // if (userCount > 0)
            //     msg += userCount+' users ';
            // if (socketCount > 0)
            //     msg += socketCount+' sockets.';

            $('#socketchatbox-scriptSentStatus').text(msg);
            $('#socketchatbox-scriptSentStatus').removeClass('redFont');

        }else {
            $('#socketchatbox-scriptSentStatus').text('Must select at least one user to send script to.');
            $('#socketchatbox-scriptSentStatus').addClass('redFont');
        }

        // need to scroll down to really see this message
        window.scrollTo(0,document.body.scrollHeight);
    });



    //=================================================================================//
    //=================================================================================//
    //===============================End of Script UI==================================//
    //=================================================================================//
    //=================================================================================//



    $('#selectAll').click(function() {

        dataHandler.selectAllUsers();
        resetAllUsersHighlight();
        if (dataHandler.getOpenedUserID() !== '')
            resetSocketHighlight(dataHandler.getOpenedUserID());

    });

    $('#selectNone').click(function() {

        dataHandler.selectNoSocketNorUser();
        resetAllUsersHighlight();
        if (dataHandler.getOpenedUserID() !== '')
            resetSocketHighlight(dataHandler.getOpenedUserID());
    });

    $('.socketchatbox-refresh-interval').change(function() {
        changeRefreshFrequency(this.value);
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

    // admin click on username to select/deselect
    $(document).on('click', '.username-info', function() {
        var $this = $(this);
        var userID = $this.data('id');
        dataHandler.toggleUserSelection(userID);
        resetAllUsersHighlight();

        // only need to resetSocketHighlight() if admin is clicking opened user 

        if (dataHandler.getOpenedUserID() === userID)
            resetOpenUserSocketHighlight(userID); 
    });


    // admin click on socket info to select/deselect
    $(document).on('click', '.socketchatbox-socketdetail-each', function() {

        var $this = $(this);

        var socketID = $this.data('id');
        var s = dataHandler.getSocketDict()[socketID];

        var user = s.user;

        dataHandler.toggleSocketSelection(socketID);

        resetAllUsersHighlight();
        resetOpenUserSocketHighlight(user.id);


    });

    function badToken() {

        console.log('bad token: '+ chatboxAdmin.token);
        $('#socketchatbox-online-users').html('Invalid Token!');
        $tokenStatus.html('Invalid Token!');
        $tokenStatus.addClass('error');
        $tokenStatus.removeClass('green');

    }

    ui.badToken = badToken;

    function validToken() {

        $tokenStatus.html('Valid Token');
        $tokenStatus.removeClass('error');
        $tokenStatus.addClass('green');
    }

    ui.validToken = validToken;

    function loadUserDetail(user) {

        // user info

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


        // socket info

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

        // action history
        var $actionHistoryDiv = $('.socketchatbox-userdetail-actions');
        $actionHistoryDiv.html('');

        for (var i = 0; i < user.actionList.length; i++) {
            var action = user.actionList[i];
            var $actionDiv = $('<div></div>');
            //new Date(Number(action.time)) // full time format
            var d = new Date(Number(action.time));
            var str = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            str += "<span class = 'socketchatbox-actionhistory-url'>" + action.url + "</span>";
            str += "<br/>Action: " + action.type ;
            if (action.detail) {
                str += "<br/>Detail: " + action.detail;
            }

            $actionDiv.html(str);
            $actionDiv.addClass('socketchatbox-userdetail-actions-each');

            $actionHistoryDiv.append($actionDiv);
        }
    }

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

    // this function doesn't take care highlighting 
    function renderOnlineUsers() {

        for (var key in dataHandler.getUserDict()) {
            var user = dataHandler.getUserDict()[key];


            // display online user

            var nameWithCount = user.username;

            // show number of connections of this user if more than one
            if(user.count > 1){
                nameWithCount += "("+user.count+")";
            }

            var $usernameSpan = $("<span></span>");
            $usernameSpan.text(nameWithCount);
            $usernameSpan.prop('title', 'Join Time: '+ utils.getTimeElapsed(user.joinTime)); // better info to show?
            $usernameSpan.addClass("username-info");
            $usernameSpan.data('id', user.id);

            // add [ ↓ ]  after the user's name
            var $downArrowSpan = $("<span></span>");
            if (user.id === dataHandler.getOpenedUserID()){
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
            //if(user.id === openedUserID) {
            //    loadUserDetail(user);
            //    newOpenedUserID = user.id;
            //}
        }
    }

    ui.renderOnlineUsers = renderOnlineUsers;



    function changeRefreshFrequency(newVal) {
        chatboxAdmin.refreshInterval = newVal;
        $('.socketchatbox-refresh-interval-val').text(newVal);

        // immediately start one
        restartGetUserList();
    }

    function restartGetUserList(){
        clearTimeout(chatboxAdmin.refreshIntervalID);
        chatboxAdmin.getUserList();
    }



    function updateToken(t) {
        chatboxAdmin.token = t;
        utils.addCookie('chatBoxAdminToken', t);
        restartGetUserList();
    }

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

  



})();
