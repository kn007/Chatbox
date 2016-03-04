(function() {

    "use strict";

    var ui = chatbox.ui;
    var fileHandler = chatbox.fileHandler;
    var utils = chatbox.utils;



    ui.init.push(function() {
        

        // Prepare file drop box.
        ui.$chatBox.on('dragenter', utils.doNothing);
        ui.$chatBox.on('dragover', utils.doNothing);
        ui.$chatBox.on('drop', function(e){

            e.originalEvent.preventDefault();
            var file = e.originalEvent.dataTransfer.files[0];
            sendFile(file);
        });

        $('#socketchatbox-sendMedia').bind('change', function(e) {

            var file = e.originalEvent.target.files[0];
            sendFile(file);
            $('#socketchatbox-sendMedia').val(''); // for sending same file, need to trigger 'change'

        });

    });


    function receivedFileSentByMyself() {

        ui.$inputMessage.val('');
        ui.$inputMessage.removeAttr('disabled');
        fileHandler.sendingFile = false;
    }

    ui.receivedFileSentByMyself = receivedFileSentByMyself;

    function sendFile(file) {



        if(!file || fileHandler.fileTooBig(file))
            return;

        ui.$inputMessage.val('Sending file...');
        ui.$inputMessage.prop('disabled', true);
        fileHandler.readThenSendFile(file);

    }




})();
