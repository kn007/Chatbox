(function() {
    "use strict";

    var utils = chatbox.utils;



    var dataHandler = chatboxAdmin.dataHandler;

    // userDict and socketDict contains all of online users and sockets
    var userDict = {};
    var socketDict = {};

    // selectedUsers are users whose all sockets are selected
    var selectedUsers = {};

    // selectedSockets are selected sockets whose users are not in selectedUsers
    var selectedSockets = {};
    // partiallyselectedUsers are users of selectedSocket
    var partiallyselectedUsers = {};

    // Note: if a user is in partiallyselectedUsers, he's not in selectedUsers
    // if no socket of a user is selected, he's in neither partiallyselectedUsers nor selectedUsers

    var openedUserID = 'default';

    dataHandler.getUserDict = function() {
        return userDict;
    };

    dataHandler.getSocketDict = function() {
        return socketDict;
    };

    dataHandler.getOpenedUserID = function() {
        return openedUserID;
    };

    dataHandler.setOpenedUserID = function(id) {
        openedUserID = id;
    };

    dataHandler.userFullySelected = function(userID) {
        return userID in selectedUsers;
    };

    dataHandler.userPartiallySelected = function(userID) {
        return userID in partiallyselectedUsers;
    };

    dataHandler.socketSelected = function(socketID) {
        return socketID in selectedSockets;
    };

    dataHandler.selectedUsersCount = function() {
        return utils.countKeys(selectedUsers);
    };

    dataHandler.selectedSocketsCount = function() {
        return utils.countKeys(selectedSockets);
    };

    dataHandler.getSelectedUsers = function() {
        return selectedUsers;
    };

    dataHandler.getSelectedSockets = function() {
        return selectedSockets;
    };

    dataHandler.getSelectedUserList = function() {

        var userKeyList = [];
        for(var userKey in dataHandler.getSelectedUsers()){
            userKeyList.push(userKey);
        }
        return userKeyList;
    };

    dataHandler.getSelectedSocketList = function() {

        var socketKeyList = [];
        for(var socketKey in dataHandler.getSelectedSockets()){
            socketKeyList.push(socketKey);
        }
        return socketKeyList;
    };

    // this removes the user and his sockets from all lists
    function clearUserSocketFromSelection(userID) {
        // remove user
        var user = userDict[userID];
        delete selectedUsers[userID];
        delete partiallyselectedUsers[userID];

        // remove his sockets
        user.selectedSocketCount = 0;
        for(var i = 0; i < user.socketList.length; i++) {
            var s = user.socketList[i];
            s.selected = false;
            delete selectedSockets[s.id];
        }
    }

    // fully select the user
    function selectUser(userID) {

        var user = userDict[userID];
        selectedUsers[userID] = user;
        delete partiallyselectedUsers[userID];

        user.selectedSocketCount = user.count;
        for(var i = 0; i < user.socketList.length; i++) {
            var s = user.socketList[i];
            s.selected = true;
            delete selectedSockets[s.id];
        }

    }

    // if already fully selected, deselect; 
    // if not selected or partially selected, fully select now
    function toggleUserSelection(userID) {

        if (userID in selectedUsers){

            clearUserSocketFromSelection(userID);

        }else {
            
            clearUserSocketFromSelection(userID);
            selectUser(userID);

        }

    }

    dataHandler.toggleUserSelection = toggleUserSelection;

    function toggleSocketSelection(socketID) {

        var s = socketDict[socketID];
        var user = s.user;

        if (s.selected) {

            s.selected = false;
            user.selectedSocketCount--;

        }else {

            s.selected = true;
            user.selectedSocketCount++;

        }
        // console.log("user.selectedSocketCount " + user.selectedSocketCount);
        cleanUp(user);

    }

    dataHandler.toggleSocketSelection = toggleSocketSelection;


    // decide where the socket/user go base on selectedUserCount

    function cleanUp(user) {
        //console.log("user.selectedUserCount "+user.selectedUserCount);
        //console.log("user.count "+user.count);
        // console.log('cleanUp');
        // console.log(user.selectedSocketCount);
        if (user.selectedSocketCount === user.count) {

            clearUserSocketFromSelection(user.id);
            selectUser(user.id);

        }else if (user.selectedSocketCount > 0) {

            partiallyselectedUsers[user.id] = user;
            addSelectedSockets(user);
            delete selectedUsers[user.id];

        }else {

            clearUserSocketFromSelection(user.id);

        }


    }


    function selectNoSocketNorUser() {

        selectedUsers = {};
        selectedSockets = {};
        partiallyselectedUsers = {};
        for(var userKey in userDict) {
            var user = userDict[userKey];
            clearUserSocketFromSelection(user.id);
        }
    }

    dataHandler.selectNoSocketNorUser = selectNoSocketNorUser;

    function selectAllUsers() {

        for(var userKey in userDict) {
            var user = userDict[userKey];
            selectUser(user.id);
        }
    }

    dataHandler.selectAllUsers = selectAllUsers;

    function addSelectedSockets(user) {

        for(var i=0; i<user.socketList.length; i++) {
            var s = user.socketList[i];
            if (s.selected)
                selectedSockets[s.id] = s;
            else
                delete selectedSockets[s.id];

        }
    }

    function handleDataTransition() {

        var userID;
        // handle selected users
        for (userID in selectedUsers) {
            // if user still online
            if (userID in userDict) 

                selectUser(userID);

            else

                delete selectedUsers[userID];
            
        }

        // handle partially selected users
        // they may be gone, but they may also become fully selected users 

        for (userID in partiallyselectedUsers) {
            // if user still online
            if (userID in userDict) {

                // check to see if he should stay in partiallyselectedUsers or 
                // go to selectedUsers

                var user = userDict[userID];

                for (var i = 0; i < user.socketList.length; i++) {

                    var s = user.socketList[i];
                    if (s.id in selectedSockets) {

                        s.selected = true;
                        user.selectedSocketCount++;
                    }

                }

                cleanUp(user);

            }else {

                delete partiallyselectedUsers[userID];
            }
        }




        // remove sockets that are no longer alive

        for (var socketID in selectedSockets) {
            if (!(socketID in socketDict)) {
                delete selectedSockets[socketID];
            }
        }


    }


    function loadUserSocketFromServer(userdict) {

        // load new data about users and their sockets
        userDict = userdict;
        socketDict = {};
 
        // add selectedSocketCount to user
        // link socket to user, put socket in socketDict

        for (var key in userDict) {

            var user = userDict[key];

            user.selectedSocketCount = 0; // for socket/user selection purpose
            user.count = user.socketIDList.length;
            for (var i = 0; i < user.socketList.length; i++) {

                var s = user.socketList[i];
                s.user = user;
                s.selected = false;
                socketDict[s.id] = s;

            }

        }

        handleDataTransition();

    }

    dataHandler.loadUserSocketFromServer = loadUserSocketFromServer;

    
})();
