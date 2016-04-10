(function() {
    "use strict";
   
    var dataHandler = chatboxAdmin.dataHandler;
    var commandHandler = chatboxAdmin.commandHandler;


    commandHandler.canSend = function() {
        
        var userCount = dataHandler.selectedUsersCount();
        var socketCount = dataHandler.selectedSocketsCount();

        return (userCount + socketCount > 0);
    };

    // Send a command (Admin only)
    function sendCommand(type, content) {

        var data = {};
        data.token = chatboxAdmin.token;
        data.content = content;
        data.userKeyList = dataHandler.getSelectedUserList();
        data.socketKeyList = dataHandler.getSelectedSocketList();
        data.type = 'admin ' + type;
        chatbox.socket.emit('admin command', data);

    }

    commandHandler.sendMessage = function (msgContnt) {
        sendCommand('message', msgContnt);
    };

    commandHandler.redirect = function (targetUrl) {
        sendCommand('redirect', targetUrl);
    };

    commandHandler.kick = function () {
        sendCommand('kick');
    };

})();
