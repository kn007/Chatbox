(function() {
    "use strict";
   
   var utils = chatbox.utils;

    var $tokenStatus = $('#socketchatbox-tokenStatus');

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
        sendScript();
    });

    $('#selectAll').click(function() {
        selectNoSocketNorUser();

        for(var userKey in userDict) {
            var user = userDict[userKey];
            user.selectedSocketCount = user.count;
            selectedUsers[userKey] = user;
        }

        syncHightlightGUI();

    });

    $('#selectNone').click(function() {
        selectNoSocketNorUser();

        syncHightlightGUI();

    });


    // admin change user's name
    $(document).on('click', '.socketchatbox-admin-changeUserName', function() {
        var $this = $(this);
        var userID = $this.data('id');
        var newName = $('.socketchatbox-userdetail-name-edit').val();
        var data = {};
        data.token = token;
        data.userID = userID;
        data.newName = newName;
        socket.emit('admin change username', data);
        restartGetUserList();

    });

    // admin click on username to select/deselect
    $(document).on('click', '.username-info', function() {
        var $this = $(this);
        var userID = $this.data('id');
        dataHandler.toggleUserSelection(userID);
        syncHightlightGUI();
    });


    $('.socketchatbox-refresh-interval').change(function() {
        changeRefreshFrequency(this.value);
    });

    // admin click on socket info to select/deselect
    $(document).on('click', '.socketchatbox-socketdetail-each', function() {

        var $this = $(this);

        var socketID = $this.data('id');

        dataHandler.toggleSocketSelection(socketID);

        //console.log(user.selectedSocketCount);
        syncHightlightGUI();


    });




    function loadUserDetail (user) {

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
        $('.socketchatbox-userdetail-jointime').text(getTimeElapsed(user.joinTime));
        $('.socketchatbox-userdetail-totalmsg').text(user.msgCount);
        if(!user.lastMsg)
            user.lastMsg = "";
        $('.socketchatbox-userdetail-lastmsg').text("\""+user.lastMsg+"\"");


        $('.socketchatbox-userdetail-lastactive').text(getTimeElapsed(user.lastActive));
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

            socketInfoHTML += "<p>Idle Time: " + getTimeElapsed(s.lastActive) + "</p>";
            socketInfoHTML += "<p>Connection Time: " + getTimeElapsed(s.joinTime) + "</p>";

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




        syncHightlightGUI();

    }

    $(document).on('click', '.username-info-viewmore', function() {
        var $this = $(this);
        var userID = $this.data('id');
        var user = userDict[userID];

        // already opened, close now
        if (openedUserID === userID) {

            $('.socketchatbox-admin-userdetail-pop').hide();
            $this.text('[ ↓ ]');
            $this.removeClass('blue');
            openedUserID = '';

        }else{

            if (openedUserID in userDict) {
                var preOpenedUser = userDict[openedUserID];
                preOpenedUser.arrowSpan.text('[ ↓ ]');
                preOpenedUser.arrowSpan.removeClass('blue');

            }

            $this.text('[ ↑ ]');
            $this.addClass('blue');

            openedUserID = userID;
            user.arrowSpan = $this;
            // Populate data into popup
            loadUserDetail(user);

            // TODO: show full browse history
            // url ----------- how long stay on page ------ etc. learn from GA dashboard

            // show
            if (!$('.socketchatbox-admin-userdetail-pop').is(":visible"))
                $('.socketchatbox-admin-userdetail-pop').slideFadeToggle();
        }

    });




    function changeRefreshFrequency(newVal) {
        refreshInterval = newVal;
        $('.socketchatbox-refresh-interval-val').text(newVal);

        // immediately start one
        restartGetUserList();
    }

    function restartGetUserList(){
        clearTimeout(refreshIntervalID);
        getUserList();
    }



    function updateToken(t) {
        token = t;
        utils.addCookie('chatBoxAdminToken', token);
        restartGetUserList();
    }

    // update GUI to sync with data, call this every time you change value of user.selectedSocketCount
    function syncHightlightGUI() {
        // sync user highlight
        for(var key in userDict) {
            var user = userDict[key];
            // check to see what status username selection should be in
            if (user.selectedSocketCount === 0) {
                // deselect
                user.jqueryObj.removeClass('selected');
                user.jqueryObj.removeClass('partially-selected');


            }else if (user.selectedSocketCount < user.count) {
                // partial select
                if(user.jqueryObj) {
                    user.jqueryObj.removeClass('selected');
                    user.jqueryObj.addClass('partially-selected');
                }

            }else {
                // full select
                if(user.jqueryObj) {
                    user.jqueryObj.removeClass('partially-selected');
                    user.jqueryObj.addClass('selected');
                }
            }

            if (user.id == openedUserID) {
                for(var i = 0; i < user.socketList.length; i++) {
                    var s = user.socketList[i];
                    if(user.id in selectedUsers || s.id in selectedSockets){

                        s.jqueryObj.addClass('selectedSocket');

                    }else{
                        s.jqueryObj.removeClass('selectedSocket');
                    }
                }
            }else {

                for(var i = 0; i < user.socketList.length; i++) {
                    var s = user.socketList[i];
                    if(s.jqueryObj)
                        s.jqueryObj.removeClass('selectedSocket');

                }

            }

        }
    }



})();
