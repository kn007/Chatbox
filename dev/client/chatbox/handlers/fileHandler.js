(function() {

    "use strict";

    var fileHandler = chatbox.fileHandler;

    fileHandler.sendingFile = false;

    function readThenSendFile(data){

        if(fileHandler.sendingFile){
            window.alert('Still sending last file!');
            return;
        }


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

 

    function fileTooBig(data){

        var fileSize = data.size/1024/1024; //MB
        var File_Size_Limit = 5;
        if (fileSize > File_Size_Limit){

            window.alert("Don't upload file larger than "+File_Size_Limit+" MB!");
            return true;
        }

        return false;

    }

    fileHandler.fileTooBig = fileTooBig;

})();

