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
    var uid = '-1';
    var historyCount = 0;

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

        var historyIndex = 0;

        if (user.id !== uid)

            ui.$actionHistoryDiv.html('');

        else {

            
            // if it's the same user's action history and the total history number is the same, no need to update DOM
            if (user.actionList.length === historyCount)
                return;
            
            else {

                historyIndex = historyCount;
            }
        }

        uid = user.id;
        historyCount = user.actionList.length;


        $('.socketchatbox-actionhistory-count').text(historyCount);

        for (; historyIndex < historyCount; historyIndex++) {
            var action = user.actionList[historyIndex];
            var $actionDiv = $('<div></div>');
            //new Date(Number(action.time)) // full time format
            var d = new Date(Number(action.time));
            var $actionBasicDiv = $('<div></div>');
            var actionBasicHTML = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            actionBasicHTML += "<span class = 'socketchatbox-actionhistory-actiontype breakable'>" + action.type + "</span>";
            $actionBasicDiv.html(actionBasicHTML);
            $actionBasicDiv.addClass('socketchatbox-userdetail-actions-each');

            $actionDiv.append($actionBasicDiv);


            // var htmlStr = "<span>url: " + utils.createNewWindowLink(action.url) + "</span><br />";
            // htmlStr += action.detail;

            $actionDiv.popover({

                placement : 'left',
                html : true,
                title : utils.createNewWindowLink(action.url),
                content : action.detail      
            });

            // title="Header" data-toggle="popover" data-placement="left" data-content="Content"


            // var $actionDetailDiv = $('<div></div>');
            // $actionDetailDiv.addClass('socketchatbox-actionhistory-actiondetail');
            // $actionDetailDiv.addClass('breakable');

            // var str = "";
            // str += "<span>url: " + utils.createNewWindowLink(action.url) + "</span><br />";
            // str += action.detail;
            // $actionDetailDiv.html(str);
            // $actionDiv.append($actionDetailDiv);
            // $actionBasicDiv.click(function(){$actionDetailDiv.show();});



            ui.$actionHistoryDiv.append($actionDiv);

        }

        
    }

    ui.loadUserActionHistory = loadUserActionHistory;


})();
