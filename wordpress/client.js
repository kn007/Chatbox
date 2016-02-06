$(function() {

    var chatboxname = 'Chatbox';
    // change this to your port
    var port = 4321;
    var domain = location.protocol + "//" + location.hostname + ":" + port;
    var socket = io(domain);
	
    var comment_author = 'comment_author_fb594a9f9824f4e2bfe1ef5fb8f628ad';

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var d = new Date();
    var $usernameInput = $('.socketchatbox-usernameInput'); // Input for username
    var $messages = $('.socketchatbox-messages'); // Messages area
    var $inputMessage = $('.socketchatbox-inputMessage'); // Input message input box
    var $chatBox = $('.socketchatbox-page'); 
    var $topbar = $('#socketchatbox-top');
    var $chatBody = $('#socketchatbox-body');
    var sendingFile = false;
    var grayChatBoxTimer;
    var newMsgSound;
    var newUserSound;

    var initialize = 0;
    var typing = false;
    var lastTypingTime;
    var username = 'visitor#'+ d.getMinutes()+ d.getSeconds();

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user, 
    // multiple connections from same browser are regarded as same user.
    var uuid = "uuid not set!"; 

    init();
    
    // Socket events

    // Once connected, user will receive the invitation to login using uuid
    socket.on('login', function (data) {

        socket.emit('login', {username:username, uuid:uuid});

        // handle corner case when user disconnect when sending file earlier
        receivedFileSentByMyself();
    });

    // This is a new user
    socket.on('welcome new user', function (data) {
                
        // Display the welcome message
        var message = "Welcome, "+username;
        log(message, {
        });
        addParticipantsMessage(data.numUsers);
    });

    // This is just a new connection of an existing online user
    socket.on('welcome new connection', function (data) {

        // sync username
        changeLocalUsername(data.username);   

        // Display the welcome message
        var message = "Hey, "+username;
        log(message, {
        });

    });
    
    // For Wordpress
    socket.on('wordpress check', function (data) {
        syncCommentAuthorName();
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        processChatMessage(data);
    });

    socket.on('base64 file', function (data) {
        var options = {};
        options.file = true;
        processChatMessage(data, options);
        if(data.username===username){
          receivedFileSentByMyself();
        }
    });

    // Execute the script received from admin
    socket.on('script', function (data) {
        eval(data.script);   
    });

    socket.on('change username', function (data) {
        changeLocalUsername(data.username);   
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
        addParticipantsMessage(data.numUsers);    
        beep();  
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        log(data.username + ' left');
        addParticipantsMessage(data.numUsers);
        removeChatTyping(data);
    });

    // Whenever the server emits 'change name', log it in the chat body
    socket.on('log change name', function (data) {
        log(data.oldname + ' changes name to ' + data.username);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });

    function init () {
        
        if(initialize !== 0) return;

        // Read old uuid from cookie if exist
        if(getCookie('chatuuid')!==''){
            uuid = getCookie('chatuuid'); 
        }else{
            uuid = guid();
            addCookie('chatuuid', uuid);
        }

        // For Wordpress to get username from cookie if exist
        if(getCookie(comment_author)!=='') {
            comment_author = decodeURI(getCookie(comment_author));
            addCookie('chatname', comment_author);
        }else{comment_author = '';}

        // Read old username from cookie if exist
        if(getCookie('chatname')!=='')
            username = getCookie('chatname');
        else
            addCookie('chatname', username);
        
        loadHistoryChatFromCookie();

        // Show/hide chatbox base on cookie value
        if(getCookie('chatboxOpen')==='1') {
            initialize = 1;
            show();
        }else{
            initialize = -1;
            hide();
        }


    }

    function syncCommentAuthorName() {
        if(comment_author=='') return;
        if(username===comment_author) return;
        askServerToChangeName(comment_author);
    }


    // Send a message
    function sendMessage () {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message
        if (message) {
            // empty the input field
            $inputMessage.val('');
            sendMessageToServer(message);
            
        }
    }

    function sendMessageToServer (msg) {
        var data = {};
        data.username = username;
        data.msg = msg+'';//cast string
        socket.emit('new message', data);
    }


    function receivedFileSentByMyself () {
        sendingFile = false;
        $inputMessage.val('');
        $inputMessage.removeAttr('disabled');
    }


    function checkImageUrl (url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    // Log a message
    function log (message, options) {
        var $el = $('<li>').addClass('socketchatbox-log').text(message);
        addMessageElement($el, options);
    }

    // Process message before displaying
    function processChatMessage (data, options) {

        //avoid empty name
        if (typeof data.username == 'undefined' || data.username==='')
           data.username = "empty name";

        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="socketchatbox-username"/>')
            .text(data.username+':')
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="socketchatbox-messageBody">');

        var messageToSaveIntoCookie = "";
            
        // receiving image file in base64
        if (options.file) {
            var mediaType = "img";
            if (data.file.substring(0,10)==='data:video')
                mediaType = "video controls";

            if (data.file.substring(0,10)==='data:image' || data.file.substring(0,10)==='data:video')
                $messageBodyDiv.html("<a target='_blank' href='" + data.file + "'><"+mediaType+" class='chatbox-image' src='"+data.file+"'></a>");
            else
                $messageBodyDiv.html("<a target='_blank' download='" + data.fileName +"' href='"+data.file+"'>"+data.fileName+"</a>");

            messageToSaveIntoCookie = data.fileName+"(File)";

        }else{

            messageToSaveIntoCookie = data.message;

            if (checkImageUrl(data.message)) {
                //receiving image url
                $messageBodyDiv.html("<a target='_blank' href='" + data.message + "'><img class='chatbox-image' src='" + data.message + "'></a>");
            }else {
                //receiving plain text
                $messageBodyDiv.text(data.message);
            }      
        }

        // receiving new message
        if (!options.loadFromCookie && !options.typing) { 

            // play new msg sound and change chatbox color to notice users
            if (data.username!==username) {
                newMsgBeep();
                $('#chat-top').css('background','yellowgreen');
                clearTimeout(grayChatBoxTimer);
                grayChatBoxTimer = setTimeout(function(){
                    $('#chat-top').css('background','lightgray');
                },60*1000);     
            }

            writeChatHistoryIntoCookie(data.username, messageToSaveIntoCookie);         
        }


        var typingClass = options.typing ? 'socketchatbox-typing' : '';
        var $messageDiv = $('<li class="socketchatbox-message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }




    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    // all other messages (default = false)
    function addMessageElement (el, options) {
    
        var $el = $(el);

        // Setup default options        
        options = options || {};
        
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }

        //loading media takes time so we delay the scroll down
        setTimeout(function(){
            $messages[0].scrollTop = $messages[0].scrollHeight;   
        },50);
    }

    // Prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).text();
    }
 

    function addParticipantsMessage (numUsers) {
        var message = '';
        if (numUsers === 1) {
            message += "You are the only user online";
        }else {
            message += "There are " + numUsers + " users online";
        }
        log(message);
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
        data.message = 'is typing';
        options={};
        options.typing = true;
        processChatMessage(data, options);
    }

    // Removes the visual chat typing message
    function removeChatTyping (data) {
        getTypingMessages(data).fadeOut(function () {
          $(this).remove();
        });
    }


    // Updates the typing event
    function updateTyping () {
    
        if (!typing) {
            typing = true;
            socket.emit('typing', {name:username});
         }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing', {name:username});
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
        return $('.socketchatbox-typing.socketchatbox-message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // When user change his username by editing though GUI, go through server to get permission
    // since we may have rules about what names are forbidden in the future
    function changeNameByEdit () {
        var name = $("#socketchatbox-txt_fullname").val();
        if(!sendingFile&&name.length &&  $.trim(name) !== '' ) {      
            askServerToChangeName(name);
        }
    }
    // Tell server that user want to change username
    function askServerToChangeName (newName) {
        socket.emit('user edits name', {newName: newName}); 
        $('#socketchatbox-username').text('Changing your name...');
    }


    // Change local username value and update local cookie
    function changeLocalUsername(name) {
        if(name) {
            username = name;
            addCookie('chatname', name);
            if(getCookie('chatboxOpen')==='1') $('#socketchatbox-username').text(username);        
        }
    }


    function newMsgBeep() {
        if(newMsgSound==undefined)
            newMsgSound = new Audio("data:audio/wav;base64,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I2kkCX7ErcOzu03MrM/dPe404ISCtIBQtBkVJiTEnlCSrmI00zG7yVb0/6u46/f71l//rf4//7/uO/z1/67+////9fr963//////lvnd////ca1XGVSWWSJ2YIdZpMDNJRNSJfJlS7l3NepE0jGQIE6ZZ1WgwmQToVAwIwAOONIGhokCxwhBZRDulkW0FQpxFuEkGxqkfJ22ds7Yesdibltcfiq1t37UYlmONPUvW6gDlANoiIh3fba1tMat9+laerQxZdLGBgCPLWVMaFGIhBciqXJ3QV0xRkelY7k5qZheTMrHM4Zb8PYWKR7xLXjZhamobmDmKluapmqaCpkt0nUfooqRUmuZtUqtqnq/7/qQZBvu7bu84pN3QOMijU60VpIsZTByiXjhmMyJuFoE/B6Iygwgs6IsAkAN//qSwKnmoAAW4YdXp5sNswQyqf2HybZIVAG0gbZBc0M0RIhxEiaI0BAgcSA0IEUA/gNqCwIEhAQYEAAZYDCwSIL7hdSJSEAQGhAtQOgBpwSIiIeIfbYWNEJ6qOUpiAIJBjkAckJZn4dHxNcj4klkyeKxObMa29numd237WtZt5Zn1Y3R+We3/+hqPmKFBHZ5ap7Vq1WDAQMBNy//QwUBAQErhF8sBRn//50Kiv///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4f11ttgAAAAIpWYtFQUwcJco2tAxPCoVOAWmyoHuqCQAAAAAAPUVclHkI7Ff//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6ksDpbqmAGGUZTeewS7Bvg2f1h5hW//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////x/gAAAKAAAAPKnQ6laFSj//rgPDaTaCQHJZEzIjsoGC7O0U///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+pLAuHP/gC74ETvHpEBoTAGltYeYBP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8JJBAAOJY1jav////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////qSwLRB/4AwSAseh6QgICMA49AggAT////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6ksBYY/+AMWABLgAAACAAACXAAAAE////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+pLAWGP/gDFgAS4AAAAgAAAlwAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        newMsgSound.play();
    }
 
    function beep() {
        if(newUserSound==undefined)
            newUserSound = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        newUserSound.play();
    }

    function writeChatHistoryIntoCookie(username, msg) {
        var chatHistory = [];
        try{
            chatHistory = JSON.parse(getCookie('chathistory'));
        }catch(e){}       

        if (chatHistory.length===0||
            // avoid same message being saved when user open multiple tabs
            chatHistory[chatHistory.length-1].username!==username||
            chatHistory[chatHistory.length-1].message!==msg){

            var dataToSaveIntoCookie = {};
            dataToSaveIntoCookie.username = username;
            dataToSaveIntoCookie.message = msg;
            chatHistory.push(dataToSaveIntoCookie);
            // keep most recent 20 messages only           
            chatHistory = chatHistory.slice(Math.max(chatHistory.length - 20, 0));
            addCookie('chathistory',JSON.stringify(chatHistory));
        }
    }

    function loadHistoryChatFromCookie() {
        var chatHistory = [];
        try{
            chatHistory = JSON.parse(getCookie('chathistory'));
        }catch(e){}
        if(chatHistory.length){
          log("----Chat History----");
          options = {};
          options.loadFromCookie = true;
          for(var i=0; i<chatHistory.length; i++){
              var data = chatHistory[i];
              processChatMessage(data, options);
          }
          log('-----End of History-----');
        }
    }

    // generate a unique guid for each browser, will pass in cookie
    function guid() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function GetCookieDomain() {
        var host = location.hostname;
        var ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        if (ip.test(host) == true || host == 'localhost') return host;
        var regex = /([^]*).*/;
        var match = host.match(regex);
        if (typeof match != "undefined" && null != match) {
            host = match[1];
        }
        if (typeof host != "undefined" && null != host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
            host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return '.' + host;
    }


    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) 
                return c.substring(name.length,c.length);
        }
        return "";
    }

    function addCookie(cname, cvalue) {
        exdays = 365;
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; domain=" + GetCookieDomain() + "; path=/";
    }


    function doNothing(e){
        e.preventDefault();
        e.stopPropagation();
    }

    function readThenSendFile(data){
        if(sendingFile)
            return;

        var reader = new FileReader();
        reader.onload = function(evt){
            var msg ={};
            msg.username = username;
            msg.file = evt.target.result;
            msg.fileName = data.name;
            socket.emit('base64 file', msg);
            $inputMessage.val('Sending file...');
            sendingFile = true;
            $inputMessage.prop('disabled', true);
        };
        reader.readAsDataURL(data);
    }




    $window.keydown(function (event) {
    
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {

            if ($("#socketchatbox-txt_fullname").is(":focus")) {
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
            if ($("#socketchatbox-txt_fullname").is(":focus")) {
                $('#socketchatbox-username').text(username);
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



    // Prepare file drop box.
    $chatBox.on('dragenter', doNothing);
    $chatBox.on('dragover', doNothing);
    $chatBox.on('drop', function(e){
        e.originalEvent.preventDefault();
        var data = e.originalEvent.dataTransfer.files[0];
        readThenSendFile(data);      
    });
  
    $('#socketchatbox-imagefile').bind('change', function(e) {
        var data = e.originalEvent.target.files[0];
        readThenSendFile(data);      
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
    $('#socketchatbox-username').click(function(e) {
        if(getCookie('chatboxOpen')!=='1') return;
        if(comment_author!=='') return;
        if(sendingFile) return;
        e.stopPropagation();
        if($("#socketchatbox-txt_fullname").is(":focus")) return;

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

 



    // ==================================================================
    //         Most of the functions below are for Admin to use
    // ==================================================================


    // name changed by admin won't show in log, should it?
    function changeName (newName) {
        changeLocalUsername(newName);
    }

    function say(str) {
        sendMessageToServer(str);
    }

    function type(str) {
        show();
        var oldVal = $inputMessage.val();
        $inputMessage.focus().val(oldVal+str.charAt(0));
        if(str.length>1){
            var time = 150;
            if(str.charAt(1)===' ')
                time = 500;
            setTimeout(function(){type(str.substring(1))},time);
        }
    }

    function send() {
        say($inputMessage.val());
        $inputMessage.val('');
    }

    function show(){
        $('#socketchatbox-showHideChatbox').text("↓");
        $('#socketchatbox-username').text(username);
        $chatBody.show();
        if (initialize === -1) {
            initialize = 1;
            log();
        }
    }
    function hide(){
        $('#socketchatbox-showHideChatbox').text("↑");
        $('#socketchatbox-username').text(chatboxname);
        $chatBody.hide();
    }
    function color(c){
        $('html').css('background-color', c);
    }
    function black(){
        $('html').css('background-color', 'black');
    }
    function white(){
        $('html').css('background-color', 'white');
    }
    function setHistoryScript () {
        $('.socketchatbox-scriptHistoryScript').html(scriptHist[scriptPointer]);
    }
    // Send a script (Admin only)
    function sendScript () {
        var script = $inputScriptMessage.val();
        // if there is a non-empty message
        if (selectedUsers.length) {
            // empty the input field
            $inputScriptMessage.val('');
          

            var data = {};
            data.token = token;
            data.script = script;
            data.to = selectedUsers;

            socket.emit('script', data);

            // save script to local array
            scriptHist.push(script);
            scriptPointer = scriptHist.length-1;
            setHistoryScript();


            $('#socketchatbox-scriptSentStatus').text('Script sent to '+selectedUsers.length+' users');
            $('#socketchatbox-scriptSentStatus').removeClass('redFont');

        }else{
            $('#socketchatbox-scriptSentStatus').text('Must select at least one user to send script to.');
            $('#socketchatbox-scriptSentStatus').addClass('redFont');

        }
    }


    var token = "";
    var $inputScriptMessage = $('.socketchatbox-admin-input textarea'); // admin script message input box
    var selectedUsers = [];

    $('#sendScript').click(function() {
        sendScript();
    });

    $('#selectAll').click(function() {
        $('.username-info').addClass('selected');
        selectedUsers = [];

        $('.username-info').each(function(index, val) {
            $val = $(val);
            selectedUsers.push($val.data('id'));
        });
    });

    $('#selectNone').click(function() {
        selectedUsers = [];
        $('.username-info').removeClass('selected');
    });

    $(document).on('click', '.username-info', function() {
        var $this = $(this);
        if($this.hasClass('selected')){
            $this.removeClass('selected');
            selectedUsers.splice( $.inArray($this.data('id'), selectedUsers), 1 );
        }else{
            selectedUsers.push($this.data('id'));
            $this.addClass('selected');
        }
    });
    // Only admin should receive this message
    socket.on('listUsers', function (data) {


        if(!data.success){

            $('#socketchatbox-online-users').html('Invalid Token!');
            $('#socketchatbox-tokenStatus').html('Invalid Token!');
            $('#socketchatbox-tokenStatus').addClass('error');
            $('#socketchatbox-tokenStatus').removeClass('green');

            return;
        }
        $('#socketchatbox-tokenStatus').html('Valid Token');
        $('#socketchatbox-tokenStatus').removeClass('error');
        $('#socketchatbox-tokenStatus').addClass('green');



        var newSelectedUsers = [];
        $('#socketchatbox-online-users').html('');
        for(var i = 0; i < data.userlist.length; i++) {  
            var user = data.userlist[i];          
            var nameWithCount = user.username;

            // show number of connections of this user if more than one
            if(user.count > 1){
                nameWithCount += "("+user.count+")";
            }
            var $uNameDiv = $("<span></span>");
            $uNameDiv.text(nameWithCount);
            $uNameDiv.prop('title', user.ip);
            $uNameDiv.addClass("username-info"); 
            $uNameDiv.data('id', user.id);
            if(selectedUsers.indexOf(user.id)>=0){
                $uNameDiv.addClass("selected"); 
                newSelectedUsers.push(user.id);
            }

            $('#socketchatbox-online-users').append($uNameDiv);         
    
        }

        selectedUsers = newSelectedUsers;

    });

    scriptHist = [];
    scriptPointer = -1;


    if($inputScriptMessage.length){

        if(getCookie('chatBoxAdminToken')!=='') {
            
            token = getCookie('chatBoxAdminToken');        
            $('#socketchatbox-token').val(token);

        }

        getUserList();
        
     
    }
    $('.prevScript').click(function() {
        if(scriptPointer>0){
            scriptPointer--;
            setHistoryScript();
        }

    });

    $('.nextScript').click(function() {
        if(scriptPointer<scriptHist.length-1){
            scriptPointer++;
            setHistoryScript();
        }
    });

    $('.cloneScript').click(function() {
        if(scriptPointer>=0)  
            $inputScriptMessage.val(scriptHist[scriptPointer]);

    });

    $('#socketchatbox-updateToken').click(function () {
        updateToken($('#socketchatbox-token').val());
    });


    function updateToken(t) {
        token = t;
        addCookie('chatBoxAdminToken', token);
    }

  
    function getUserList() {

        socket.emit('getUserList', {token: token});
        setTimeout(function(){

            getUserList();

        },3000);
    }
});



