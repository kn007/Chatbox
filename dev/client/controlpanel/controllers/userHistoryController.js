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


        ui.$actionHistoryDiv.on( "click", ".socketchatbox-actionhistory-basic", function() {
            var detailClass = $(this).data('targetDetail');
            $('.'+detailClass).slideToggle();
        });


        $('.socketchatbox-actionhistory-header').click(function () {

            if (ui.showHistory) {

                ui.showHistory = false;

            } else {

                ui.showHistory = true;
                

            }

            toggleActionHistoryVisibility();

        });

        toggleActionHistoryVisibility();



        $('.socketchatbox-actionhistory-expandAll').click(function() {
            $('.socketchatbox-actionhistory-actiondetail .collapse').slideDown();
        });

        $('.socketchatbox-actionhistory-collapseAll').click(function() {
            $('.socketchatbox-actionhistory-actiondetail .collapse').slideUp();
        });


    });

    function toggleActionHistoryVisibility() {

        if (ui.showHistory) {
            $('.socketchatbox-actionhistory-togglecollapse').fadeIn().css("display","inline-block");;
            ui.$actionHistoryDiv.slideDown(function(){
                $('.socketchatbox-actionhistory-arrow').text(' ↑ ');
            });
        }
        else{
            
            ui.$actionHistoryDiv.slideUp(function(){
                $('.socketchatbox-actionhistory-arrow').text(' ↓ ');
                $('.socketchatbox-actionhistory-togglecollapse').fadeOut();
            });
        }
    }

    function loadUserActionHistory(user) {

        var historyIndex = 0;

        if (user.id !== uid){

            ui.$actionHistoryDiv.html('');
            ui.showHistory = false;
            toggleActionHistoryVisibility();

        } else {

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
            var historyID = uid + historyIndex;
            var $actionBasicDiv = $("<div></div>");
            var actionBasicHTML = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            actionBasicHTML += "<span class = 'socketchatbox-actionhistory-actiontype breakable'>" + action.type + "</span>";
            $actionBasicDiv.html(actionBasicHTML);
            $actionBasicDiv.addClass('socketchatbox-actionhistory-basic');
            $actionBasicDiv.data('targetDetail', historyID);
            $actionDiv.append($actionBasicDiv);

            //https://github.com/twbs/bootstrap/issues/12093
            var $wrapperDiv = $("<div></div>");
            $wrapperDiv.addClass('socketchatbox-actionhistory-actiondetail');

            var $actionDetailDiv = $("<div></div>");
            $actionDetailDiv.addClass(historyID);
            $actionDetailDiv.addClass('collapse');
            $actionDetailDiv.html('At: '+utils.createNewWindowLink(action.url)+'<br/>'+action.detail);
            $wrapperDiv.append($actionDetailDiv);
            // $actionDetailDiv.addClass('socketchatbox-actionhistory-actiondetail');

            $actionDiv.append($wrapperDiv);

           

            $actionDiv.addClass('socketchatbox-userdetail-actions-each');
            ui.$actionHistoryDiv.append($actionDiv);



        }

        
    }

    ui.loadUserActionHistory = loadUserActionHistory;


})();
