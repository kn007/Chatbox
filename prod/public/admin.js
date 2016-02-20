$.getScript('/client.js', function() {

    waitToStart(); //wait for client.js to finish loading

    function waitToStart() {
        setTimeout(function(){
            if(typeof chatboxClient !== "undefined")
                admin();
            else{
                setTimeout(function(){
                    waitToStart();
                }, 1000);
            }

        }, 1000);
        console.log("Waiting for client.js to load...");
    }
    function admin(){
        var socket = chatboxClient.socket;
        var verified = false;

        var scriptHist = [];
        var scriptPointer = -1;
        var refreshInterval = 5; // unit is second not milisecond
        var refreshIntervalID;
        var token = "";
        var selectedUsers = {}; // user with all sockets selected
        var partiallyselectedUsers = {}; // user with some of sockets selected
        var selectedSockets = {}; // a simple array of socket's ID
        var userDict = {}; // similar to the userDict on server, but store simpleUser/simpleSocket objects
        var socketDict = {}; // similar ...

        var openedUserID;

        var $inputScriptMessage = $('.socketchatbox-admin-input textarea'); // admin script message input box

        adminInit();


        function countKeys(myObj) {
            var count = 0;
            for (var k in myObj) {
                if (myObj.hasOwnProperty(k)) {
                   ++count;
                }
            }
            return count;
        }

        // Send a script (Admin only)
        function sendScript() {
            var script = $inputScriptMessage.val();
            var userCount = countKeys(selectedUsers);
            var socketCount = countKeys(selectedSockets);

            if (userCount + socketCount > 0) {
                // empty the input field
                $inputScriptMessage.val('');

                var userKeyList = [];
                var socketKeyList = [];
                for(var userKey in selectedUsers){
                    userKeyList.push(userKey);
                }
                for(var socketKey in selectedSockets){
                    socketKeyList.push(socketKey);
                }

                var data = {};
                data.token = token;
                data.script = script;
                data.userKeyList = userKeyList;
                data.socketKeyList = socketKeyList;
                socket.emit('script', data);

                // save script to local array
                scriptHist.push(script);
                scriptPointer = scriptHist.length-1;
                setHistoryScript();

                var msg = 'Script is sent to ';
                if (userCount > 0)
                    msg += userCount+' users ';
                if (socketCount > 0)
                    msg += socketCount+' sockets.';

                $('#socketchatbox-scriptSentStatus').text(msg);
                $('#socketchatbox-scriptSentStatus').removeClass('redFont');

            }
            else{
                $('#socketchatbox-scriptSentStatus').text('Must select at least one user to send script to.');
                $('#socketchatbox-scriptSentStatus').addClass('redFont');

            }

            // need to scroll down to really see this message
            window.scrollTo(0,document.body.scrollHeight);

        }


        $('.socketchatbox-admin-blockIP').click(function() {
            console.log("not available in this version, please wait and update.");
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

        // doesn't update GUI
        function selectNoSocketNorUser() {
            selectedUsers = [];
            selectedSockets = [];
            partiallyselectedUsers = {};
            for(var userKey in userDict) {
                var user = userDict[userKey];
                user.selectedSocketCount = 0;
            }
        }

        function removeUserSocketsFromSelectedSockets(user) {
            for(var i=0; i<user.socketList.length; i++) {
                var s = user.socketList[i];
                delete selectedSockets[s.id];
            }
        }


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
            var user = userDict[userID];
            // console.log(user.username+": "+user.selectedSocketCount);

            delete partiallyselectedUsers[userID];
            removeUserSocketsFromSelectedSockets(user);

            if(userID in selectedUsers){

                // console.log('userID: '+userID);
                delete selectedUsers[user.id];
                user.selectedSocketCount = 0;


            }else{

                console.log('userID: '+userID);
                console.log('user.id: '+user.id);
                selectedUsers[userID] = user;
                user.selectedSocketCount = user.count;

            }
            // console.log(user.username+": "+user.selectedSocketCount);
            // console.log(userID in selectedUsers);

            syncHightlightGUI();
        });
        $('.socketchatbox-refresh-interval').change(function() {
            changeRefreshFrequency(this.value);
        });

        // admin click on socket info to select/deselect
        $(document).on('click', '.socketchatbox-socketdetail-each', function() {

            var $this = $(this);

            var socketID = $this.data('id');

            var s = socketDict[socketID];
            var user = s.user;

            //console.log('click a socket, sid: '+s.id);

            if (user.id in selectedUsers) {
                //console.log('the user was already selected.');
                delete selectedUsers[user.id];

                user.selectedSocketCount--;
                if (user.selectedSocketCount > 0) {
                    //console.log('add to partiallyselectedUsers');

                    partiallyselectedUsers[user.id] = user;
                    for(var i = 0; i < user.socketList.length; i++) {
                        var ss = user.socketList[i];
                        if(ss.id!=s.id) {
                            selectedSockets[ss.id] = ss;
                            //console.log('add socket to selectedSockets, sid: '+ ss.id);

                        }
                    }
                }
            }else{
                //console.log('the user was not selected.');


                if (socketID in selectedSockets) { // user must be in the partiallySelectedUserList
                    // socket previously selected, now deselect
                    delete selectedSockets[socketID];
                    user.selectedSocketCount--;
                    if(user.selectedSocketCount<0) {
                        console.log(user.selectedSocketCount<0);
                    }
                    if(user.selectedSocketCount===0)
                        delete partiallyselectedUsers[user.id];


                }else{ // user not in partially selected user list nor in the selected user list
                    // socket previously not selected, now select it unless this user is getting into selected user list
                    user.selectedSocketCount++; // should equal to 1
                    if(user.selectedSocketCount!=1)
                        console.log("user.selectedSocketCount should be one, but it's "+user.selectedSocketCount);
                    if(user.selectedSocketCount == user.count){
                        selectedUsers[user.id] = user;
                        for(var i = 0; i < user.socketList.length; i++) {
                            var ss = user.socketList[i];
                            delete selectedSockets[ss.id];

                        }


                    }else{

                        // ensure in partiallyselecteduserlist, maybe already in
                        partiallyselectedUsers[user.id] = user;
                        selectedSockets[socketID] = s;
                    }
                }
            }


            //console.log(user.selectedSocketCount);
            syncHightlightGUI();


        });

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


        function getTimeElapsed(startTime, fromTime) {

            // time difference in ms
            var timeDiff = startTime - fromTime;
            if (fromTime!==0)
                timeDiff = (new Date()).getTime() - startTime;
            // strip the ms
            timeDiff /= 1000;
            var seconds = Math.round(timeDiff % 60);
            timeDiff = Math.floor(timeDiff / 60);
            var minutes = Math.round(timeDiff % 60);
            timeDiff = Math.floor(timeDiff / 60);
            var hours = Math.round(timeDiff % 24);
            timeDiff = Math.floor(timeDiff / 24);
            var days = timeDiff ;
            var timeStr = "";
            if(days)
                timeStr += days + " d ";
            if(hours)
                timeStr += hours + " hr ";
            if(minutes)
                timeStr += minutes + " min ";

            timeStr += seconds + " sec";
            return timeStr;
        }




        $.fn.slideFadeToggle = function(easing, callback) {
          return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
        };


        var $tokenStatus = $('#socketchatbox-tokenStatus');
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
                var newSelectedUsers = [];
                var newSelectedSockets = [];
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
                selectedSocket = newSelectedSockets;

                // update view
                syncHightlightGUI();
            }

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


        function updateToken(t) {
            token = t;
            chatboxClient.addCookie('chatBoxAdminToken', token);
            restartGetUserList();
        }

        function getServerStat() {
            socket.emit('getServerStat', {token: token});
        }

        function getUserList() {

            socket.emit('getUserList', {token: token});
            refreshIntervalID = setTimeout(function(){
                getUserList();

            }, refreshInterval*1000);
        }

        function setHistoryScript() {
            $('.socketchatbox-scriptHistoryScript').html(scriptHist[scriptPointer]);
        }

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

        function adminInit(){

            if(chatboxClient.getCookie('chatBoxAdminToken')!=='') {

                token = chatboxClient.getCookie('chatBoxAdminToken');
                $('#socketchatbox-token').val(token);

            }

            getUserList();
        }

        $('.prevScript').click(function() {
            if(scriptPointer>0){
                scriptPointer--;
                setHistoryScript();
            }

        });

        $('.nextScript').click(function() {
            if(scriptPointer<scriptHist.length-1){
                scriptPointer++;
                setHistoryScript();
            }
        });

        $('.cloneScript').click(function() {
            if(scriptPointer>=0)
                $inputScriptMessage.val(scriptHist[scriptPointer]);

        });

        $('#socketchatbox-updateToken').click(function() {
            updateToken($('#socketchatbox-token').val());
        });
    }
});
