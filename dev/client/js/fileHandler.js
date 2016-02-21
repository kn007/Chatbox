(function() {

    "use strict";

    var fileHandler = chatbox.fileHandler;

    var sendingFile = false;

    fileHandler.sending = function() {
        return sendingFile;
    }

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
            msg.username = chatbox.username;
            msg.file = evt.target.result;
            msg.fileName = data.name;
            chatbox.socket.emit('base64 file', msg);
            fileHandler.sendingFile = true;
        };
        reader.readAsDataURL(data);
    }

    fileHandler.readThenSendFile = readThenSendFile;


    fileHandler.receivedFileSentByMyself = function() {
        sendingFile = false;
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






})();

