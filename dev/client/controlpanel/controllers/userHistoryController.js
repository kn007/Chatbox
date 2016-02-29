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

    ui.showHistory = false;

    ui.init.push(function() {

        ui.$actionHistoryDiv = $('.socketchatbox-userdetail-actions');

        $('.socketchatbox-actionhistory-header').click(function() {

            if (ui.showHistory) {
                ui.showHistory = false;
                $('.socketchatbox-actionhistory-header').text(' ↓ ');
            } else {
                ui.showHistory = true;
                $('.socketchatbox-actionhistory-header').text(' ↑ ');

            }

            toggleActionHistoryVisibility();

        });

        toggleActionHistoryVisibility();


    });

    function toggleActionHistoryVisibility() {

        if (ui.showHistory) 
            ui.$actionHistoryDiv.slideDown();
        else
            ui.$actionHistoryDiv.slideUp();
    }

    function loadUserActionHistory(user) {

        ui.$actionHistoryDiv.html('');
        $('.socketchatbox-actionhistory-count').text(user.actionList.length);
        for (var i = 0; i < user.actionList.length; i++) {
            var action = user.actionList[i];
            var $actionDiv = $('<div></div>');
            //new Date(Number(action.time)) // full time format
            var d = new Date(Number(action.time));
            var str = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            str += "<span class = 'socketchatbox-actionhistory-url'>" + utils.createNewWindowLink(action.url) + "</span>";
            str += "<br/>Action: " + action.type ;
            if (action.detail) {
                str += "<br/>Detail: " + action.detail;
            }

            $actionDiv.html(str);
            $actionDiv.addClass('socketchatbox-userdetail-actions-each');

            ui.$actionHistoryDiv.append($actionDiv);
        }
        
    }

    ui.loadUserActionHistory = loadUserActionHistory;


})();
