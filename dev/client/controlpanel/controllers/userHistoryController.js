(function() {
    "use strict";
   
    var utils = chatbox.utils;
    var scriptHandler = chatboxAdmin.scriptHandler;
    var dataHandler = chatboxAdmin.dataHandler;

    var ui = chatboxAdmin.ui;

     
     
    //=================================================================================//
    //=================================================================================//
    //============================= User Action History Area ==========================//
    //=================================================================================//
    //=================================================================================//

    function loadUserActionHistory(user) {

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



})();
