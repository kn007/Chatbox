Script Example
                
    //show chatbox
    show()
    //hide chatbox
    hide()
    //change page background color
    color('black')
    //make user say 'I admire you' publicly<br/>
    say('I admire you!')
    //make user type 'I love you' in his input bar(won't send)<br/>
    type('I love you')
    //make user send whatever is in his input bar publicly<br/>
    send()
    //play user join sound<br/>
    beep()
    //play new message sound<br/>
    newMsgBeep()
    //Redirect user to "www.example.com"
    window.location = "http://www.example.com"

    $.getScript("https://cdn.jsdelivr.net/jquery.jrumble/1.3/jquery.jrumble.min.js", function(data, textStatus, jqxhr) {

        $topbar.jrumble();
        $topbar.trigger('startRumble');

    })

    //Make user load a 3rd party library then use it

    //Any JavaScript code can be ran on user's end, don't be evil.
