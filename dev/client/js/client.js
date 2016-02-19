

function loadChatbox()
{

    var COLORS = [
        'black'
    ];

    // Initialize variables
    var d = new Date();
    //var grayChatBoxTimer;
    var newMsgSound;
    var newUserSound;



    init();





    // Change local username value and update local cookie
    function changeLocalUsername(name) {
        if(name) {
            username = name;
            addCookie('chatname', name);
            if(getCookie('chatboxOpen')==='1')
                $username.text(username);
        }
    }




}
