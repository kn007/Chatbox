(function() {
    "use strict";

    // admin share utils functions with common user, but add more functions
    var utils = chatbox.utils;

    utils.createNewWindowLink = function (link) {
        return "<a target = '_blank' href = '" + link + "''>" + link + "</a>";
    }

    function getTimeElapsed(startTime, fromTime) {

        // time difference in ms
        var timeDiff = startTime - fromTime;
        if (fromTime!==0)
            timeDiff = (new Date()).getTime() - startTime;
        // strip the ms
        timeDiff /= 1000;
        var seconds = Math.round(timeDiff % 60);
        timeDiff = Math.floor(timeDiff / 60);
        var minutes = Math.round(timeDiff % 60);
        timeDiff = Math.floor(timeDiff / 60);
        var hours = Math.round(timeDiff % 24);
        timeDiff = Math.floor(timeDiff / 24);
        var days = timeDiff ;
        var timeStr = "";
        if(days)
            timeStr += days + " d ";
        if(hours)
            timeStr += hours + " hr ";
        if(minutes)
            timeStr += minutes + " min ";

        timeStr += seconds + " sec";
        return timeStr;
    }

    utils.getTimeElapsed = getTimeElapsed;


    utils.countKeys = function (myObj) {
        var count = 0;

        for (var k in myObj) {
            
            if (myObj.hasOwnProperty(k)) {
               ++count;
            }
        }

        return count;
    }


})();
