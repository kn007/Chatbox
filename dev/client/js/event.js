window.chatbox = window.chatbox || {};
"use strict";

(function() {

   
    function newMsgBeep() {
        if (typeof newMsgSound === 'undefined')
            newMsgSound = new Audio("data:audio/wav;base64,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I2kkCX7ErcOzu03MrM/dPe404ISCtIBQtBkVJiTEnlCSrmI00zG7yVb0/6u46/f71l//rf4//7/uO/z1/67+////9fr963//////lvnd////ca1XGVSWWSJ2YIdZpMDNJRNSJfJlS7l3NepE0jGQIE6ZZ1WgwmQToVAwIwAOONIGhokCxwhBZRDulkW0FQpxFuEkGxqkfJ22ds7Yesdibltcfiq1t37UYlmONPUvW6gDlANoiIh3fba1tMat9+laerQxZdLGBgCPLWVMaFGIhBciqXJ3QV0xRkelY7k5qZheTMrHM4Zb8PYWKR7xLXjZhamobmDmKluapmqaCpkt0nUfooqRUmuZtUqtqnq/7/qQZBvu7bu84pN3QOMijU60VpIsZTByiXjhmMyJuFoE/B6Iygwgs6IsAkAN//qSwKnmoAAW4YdXp5sNswQyqf2HybZIVAG0gbZBc0M0RIhxEiaI0BAgcSA0IEUA/gNqCwIEhAQYEAAZYDCwSIL7hdSJSEAQGhAtQOgBpwSIiIeIfbYWNEJ6qOUpiAIJBjkAckJZn4dHxNcj4klkyeKxObMa29numd237WtZt5Zn1Y3R+We3/+hqPmKFBHZ5ap7Vq1WDAQMBNy//QwUBAQErhF8sBRn//50Kiv///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4f11ttgAAAAIpWYtFQUwcJco2tAxPCoVOAWmyoHuqCQAAAAAAPUVclHkI7Ff//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6ksDpbqmAGGUZTeewS7Bvg2f1h5hW//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////x/gAAAKAAAAPKnQ6laFSj//rgPDaTaCQHJZEzIjsoGC7O0U///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+pLAuHP/gC74ETvHpEBoTAGltYeYBP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8JJBAAOJY1jav////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////qSwLRB/4AwSAseh6QgICMA49AggAT////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6ksBYY/+AMWABLgAAACAAACXAAAAE////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+pLAWGP/gDFgAS4AAAAgAAAlwAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        newMsgSound.play();
    }

    function beep() {
        if (typeof newUserSound === 'undefined')
            newUserSound = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        newUserSound.play();
    }



    // When user change his username by editing though GUI, go through server to get permission
    // since we may have rules about what names are forbidden in the future
    function changeNameByEdit() {
        var name = $('#socketchatbox-txt_fullname').val();
        name = $.trim(name);
        if (name === username || name === "")  {
            $username.text(username);
        } else if (!sendingFile) {
            askServerToChangeName(name);
        }
    }


    $window.keydown(function (event) {

        // When the client hits ENTER on their keyboard
        if (event.which === 13) {

            if ($('#socketchatbox-txt_fullname').is(":focus")) {
                changeNameByEdit();
                $inputMessage.focus();
                return;
            }

            if (username && $inputMessage.is(":focus")) {
                sendMessage();
                socket.emit('stop typing', {name:username});
                typing = false;
            }
        }

        // When the client hits ESC on their keyboard
        if (event.which === 27) {
            if ($('#socketchatbox-txt_fullname').is(":focus")) {
                $username.text(username);
                $inputMessage.focus();
                return;
            }
        }

    });

    $inputMessage.on('input', function() {
        updateTyping();
    });


    // Focus input when clicking on the message input's border
    $inputMessage.click(function() {
        $inputMessage.focus();
    });

    $('#socketchatbox-closeChatbox').click(function() {
        $chatBox.hide();
    });


    $topbar.click(function() {

        if($chatBody.is(":visible")){

            hide();
            addCookie('chatboxOpen',0);
        }else {
            show();
            addCookie('chatboxOpen',1);
        }
    });

    // user edit username
    $username.click(function(e) {
        e.stopPropagation(); //don't propagate event to topbar

        if(getCookie('chatboxOpen')!=='1') {
            return;
        }
        if(sendingFile) return;
        if($('#socketchatbox-txt_fullname').length > 0) return;
        //if($('#socketchatbox-txt_fullname').is(":focus")) return;

        var name = $(this).text();
        $(this).html('');
        $('<input></input>')
            .attr({
                'type': 'text',
                'name': 'fname',
                'id': 'socketchatbox-txt_fullname',
                'size': '10',
                'value': name
            })
            .appendTo('#socketchatbox-username');
        $('#socketchatbox-txt_fullname').focus();
    });






    //resize

    var prev_x = -1;
    var prev_y = -1;
    var dir = null;
    $(".socketchatbox-resize").mousedown(function(e){
        prev_x = e.clientX;
        prev_y = e.clientY;
        dir = $(this).attr('id');
        e.preventDefault();
        e.stopPropagation();
    });

    $(document).mousemove(function(e){

        if (prev_x == -1)
            return;

        var boxW = $(".socketchatbox-chatArea").outerWidth();
        var boxH = $(".socketchatbox-chatArea").outerHeight();
        var dx = e.clientX - prev_x;
        var dy = e.clientY - prev_y;

        //Check directions
        if (dir.indexOf('n') > -1) //north
        {
            boxH -= dy;
        }

        if (dir.indexOf('w') > -1) //west
        {
            boxW -= dx;
        }
        if (dir.indexOf('e') > -1) //east
        {
            boxW += dx;
        }

        //console.log('boxW '+boxW);
        //console.log('boxH '+boxH);
        if(boxW<210) boxW = 210;
        if(boxH<30) boxH = 30;

        $(".socketchatbox-chatArea").css({
            "width":(boxW)+"px",
            "height":(boxH)+"px",
        });

        prev_x = e.clientX;
        prev_y = e.clientY;
    });

    $(document).mouseup(function(){
        prev_x = -1;
        prev_y = -1;
    });





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



    document.addEventListener('visibilitychange', function() {
        if(!document.hidden) clearNewMessageNotification();
        if(getCookie('chatboxOpen')==='1') {
            show();
        }else{
            hide();
        }
    });



})();   

