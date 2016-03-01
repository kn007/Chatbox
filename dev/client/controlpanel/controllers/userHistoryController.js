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
                $('.socketchatbox-actionhistory-arrow').text(' ↓ ');

            } else {

                ui.showHistory = true;
                $('.socketchatbox-actionhistory-arrow').text(' ↑ ');

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
            var $actionBasicDiv = $('<div></div>');
            var actionBasicHTML = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            actionBasicHTML += "<span class = 'socketchatbox-actionhistory-actiontype breakable'>" + action.type + "</span>";
            $actionBasicDiv.html(actionBasicHTML);
            $actionDiv.append($actionBasicDiv);


            var htmlStr = "<span>url: " + utils.createNewWindowLink(action.url) + "</span><br />";
            htmlStr += action.detail;

            $actionDiv.prop('title', htmlStr);
            $actionDiv.prop('data-toggle', 'tooltip');



            // var $actionDetailDiv = $('<div></div>');
            // $actionDetailDiv.addClass('socketchatbox-actionhistory-actiondetail');
            // $actionDetailDiv.addClass('breakable');

            // var str = "";
            // str += "<span>url: " + utils.createNewWindowLink(action.url) + "</span><br />";
            // str += action.detail;
            // $actionDetailDiv.html(str);
            // $actionDiv.append($actionDetailDiv);
            // $actionBasicDiv.click(function(){$actionDetailDiv.show();});


            $actionDiv.addClass('socketchatbox-userdetail-actions-each');

            ui.$actionHistoryDiv.append($actionDiv);

        }
$('body').tooltip({
    selector: '[rel=tooltip]'
});
        $('[data-toggle="tooltip"]').tooltip(); 

        
    }

    ui.loadUserActionHistory = loadUserActionHistory;


})();
