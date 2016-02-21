(function() {
    "use strict";

    var utils = chatbox.utils;

    // userDict and socketDict contains all of online users and sockets
    var userDict = {};
    var socketDict = {};

    // selectedUsers are users whose all sockets are selected
    var selectedUsers = {};

    // selectedSockets are selected sockets whose users are not in selectedUsers
    var selectedSockets = {};
    // partiallyselectedUsers are users of selectedSocket
    var partiallyselectedUsers = {};

    // if a user is in partiallyselectedUsers, he's not in selectedUsers
    // if no socket of a user is selected, he's in neither partiallyselectedUsers nor selectedUsers



    function toggleUserSelection(userID) {

        var user = userDict[userID];
        // console.log(user.username+": "+user.selectedSocketCount);

        delete partiallyselectedUsers[userID];
        removeUserSocketsFromSelectedSockets(user);

        if (userID in selectedUsers){

            // console.log('userID: '+userID);
            delete selectedUsers[user.id];
            user.selectedSocketCount = 0;
            


        }else {

            selectedUsers[userID] = user;
            user.selectedSocketCount = user.count;

        }

        // console.log(user.username+": "+user.selectedSocketCount);
        // console.log(userID in selectedUsers);
    }




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

        // clear this user
        delete selectedUsers[user.id];
        delete partiallyselectedUsers[user.id];
        removeUserSocketsFromSelectedSockets(user);


        // decide where the socket/user go base on selectedUserCount
        if (user.selectedUserCount === user.count) {

            selectedUsers[user.id] = user;

        }else if (user.selectedSocketCount > 0) {

            partiallyselectedUsers[user.id] = user;
            addSelectedSockets(user);
        }

    }


    function selectNoSocketNorUser() {
        selectedUsers = {};
        selectedSockets = {};
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

    function addSelectedSockets(user) {
        for(var i=0; i<user.socketList.length; i++) {
            var s = user.socketList[i];
            if (s.selected)
                selectedSockets[s.id] = s;
        }
    }



    
})();
