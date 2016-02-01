Script Example
                
    show()
    //show chatbox
    hide()
    //hide chatbox
    color('black')
    //change page background color
    say('I admire you!')
    //make user say 'I admire you' publicly<br/>
    type('I love you')
    //make user type 'I love you' in his input bar(won't send)<br/>
    send()
    //make user send whatever is in his input bar publicly<br/>
    beep()
    //play user join sound<br/>
    newMsgBeep()
    //play new message sound<br/>
    window.location = "http://www.example.com"
    //Redirect user to "www.example.com"

    $.getScript("https://cdn.jsdelivr.net/jquery.jrumble/1.3/jquery.jrumble.min.js", function(data, textStatus, jqxhr) {

        $topbar.jrumble();
        $topbar.trigger('startRumble');

    })

    //Make user load a 3rd party library then use it

    //Any JavaScript code can be ran on user's end, don't be evil.