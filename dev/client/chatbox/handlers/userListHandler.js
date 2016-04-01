(function() {
    "use strict";
    var userListHandler = chatbox.userListHandler;
    var ui = chatbox.ui;

    var onlineUsers = {}; // simply saving username, consider saving user ID in future


	userListHandler.userJoin = function (username) {
		onlineUsers[username] = 1;
		ui.updateUserList(onlineUsers);
	};

	userListHandler.userLeft = function (username) {
		delete onlineUsers[username];
		ui.updateUserList(onlineUsers);

	};

	userListHandler.userChangeName = function (oldName, newName) {
		delete onlineUsers[oldName];
		onlineUsers[newName] = 1;
		ui.updateUserList(onlineUsers);

	};

	userListHandler.getOnlineUsers = function () {
		return onlineUsers;
	};


})();