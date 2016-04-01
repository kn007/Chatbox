(function() {
    "use strict";
    window.chatbox = window.chatbox || {};

    var notification = chatbox.notification;

    // New Message Received Notification
    // 1      --  Change Page Title Once (when the webpage state is not visible)
    // 2      --  Flash Page Title (when the webpage state is not visible)
    // 3      --  Change Page Title Once (always, just notify in 3 seconds)
    // Other  --  Do Not Change Page Title
    var changeTitleMode = 2;
    var changeTitle = {
        time: 0,
        originTitle: document.title,
        timer: null,
        done: 0,
        change: function() {
            document.title = "~New Message Received~ " + changeTitle.originTitle;
            changeTitle.done = 1;
        },
        notify: function() {
            if(document.title.indexOf("~New Message Received~")) clearTimeout(changeTitle.timer);
            document.title = "~New Message Received~ " + changeTitle.originTitle;
            changeTitle.timer = setTimeout(function(){changeTitle.reset();},3000);
            changeTitle.done = 0; //Always be 0
        },
        flash: function() {
            changeTitle.timer = setTimeout(function () {
                changeTitle.time++;
                changeTitle.flash();
                if (changeTitle.time % 2 === 0) {
                    document.title = "~                    ~ " + changeTitle.originTitle;
                }else{
                    document.title = "~New Message Received~ " + changeTitle.originTitle;
                }
            }, 500);
            changeTitle.done = 1;
        },
        reset: function() {
            clearTimeout(changeTitle.timer);
            document.title = changeTitle.originTitle;
            changeTitle.done = 0;
        }
    };

    notification.changeTitle = changeTitle;

    function receivedNewMsg() {

        if(document.hidden && changeTitleMode === 1 && changeTitle.done === 0) changeTitle.change();
        if(document.hidden && changeTitleMode === 2 && changeTitle.done === 0) changeTitle.flash();
        if(document.hidden && changeTitleMode === 3 && changeTitle.done === 0) changeTitle.notify();
        if(!document.hidden) 
            chatbox.socket.emit('reset2origintitle', {});
    }

    notification.receivedNewMsg = receivedNewMsg;


    function clearNewMessageNotification() {
        changeTitle.reset();
        chatbox.socket.emit('reset2origintitle', {});
    }


    document.addEventListener('visibilitychange', function() {
        if(!document.hidden) 
            clearNewMessageNotification();

        // even if we want this feature, it should not be in this file
        // if(utils.getCookie('chatboxOpen')==='1') {
        //     ui.show();
        // }else{
        //     ui.hide();
        // }
    });

})();
