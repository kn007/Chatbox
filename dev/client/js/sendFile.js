window.chatbox = window.chatbox || {};
"use strict";

(function() {
    var sendingFile = false;

    function readThenSendFile(data){

        if(sendingFile){
            alert('Still sending last file!');
            return;
        }

        if(fileTooBig(data))
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


    function receivedFileSentByMyself() {
        sendingFile = false;
        $inputMessage.val('');
        $inputMessage.removeAttr('disabled');
    }

    
    function doNothing(e){
        e.preventDefault();
        e.stopPropagation();
    }

    function fileTooBig(data){

        var fileSize = data.size/1024/1024; //MB
        var File_Size_Limit = 5;
        if (fileSize > File_Size_Limit){

            alert("Don't upload file larger than "+File_Size_Limit+" MB!");
            return true;
        }

        return false;

    }



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



})();   

