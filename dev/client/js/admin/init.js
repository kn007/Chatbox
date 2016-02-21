(function() {
    "use strict";
    //load history scripts
    //put in token
    window.chatboxAdmin = {};
    chatboxAdmin.userDict = {};
    chatboxAdmin.socketDict = {};


    var utils = chatbox.utils;

    
    chatboxAdmin.init = function() {


        if(utils.getCookie('chatBoxAdminToken')!=='') {

            chatboxAdmin.token = utils.getCookie('chatBoxAdminToken');
            $('#socketchatbox-token').val(chatboxAdmin.token);

        }

        getUserList();

    }


    // if token not right, should stop this endless call
    function getUserList() {

        chatbox.socket.emit('getUserList', {token: chatboxAdmin.token});
        refreshIntervalID = setTimeout(function(){
            getUserList();

        }, refreshInterval*1000);
    }


})();
