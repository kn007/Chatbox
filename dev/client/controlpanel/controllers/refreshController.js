(function() {
    "use strict";
    var ui = chatboxAdmin.ui;



    //=================================================================================//
    //=================================================================================//
    //============================= Fresh Frequency Area ==============================//
    //=================================================================================//
    //=================================================================================//
    ui.init.push(function() {

        $('.socketchatbox-refresh-interval').change(function() {
            changeRefreshFrequency(this.value);
        });


    });

    function changeRefreshFrequency(newVal) {
        
        chatboxAdmin.refreshInterval = newVal;
        $('.socketchatbox-refresh-interval-val').text(newVal);

        // immediately start one
        restartGetUserList();
    }


    // if token not right, should stop this endless call
    function getUserList() {

        chatbox.socket.emit('getUserList', {token: chatboxAdmin.token});
        chatboxAdmin.refreshIntervalID = setTimeout(function() {
            getUserList();

        }, chatboxAdmin.refreshInterval*1000);
    }

    chatboxAdmin.getUserList = getUserList;


    function restartGetUserList(){

        clearTimeout(chatboxAdmin.refreshIntervalID);
        chatboxAdmin.getUserList();
    }

    chatboxAdmin.restartGetUserList = restartGetUserList;   


})();
