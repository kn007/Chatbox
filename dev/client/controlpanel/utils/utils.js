(function() {
    "use strict";

    // admin share utils functions with common user, but add more functions
    var utils = chatbox.utils;

    utils.createNewWindowLink = function (link) {
        return "<a target = '_blank' href = '" + link + "''>" + link + "</a>";
    };

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
    };


})();


(function($) {
    "use strict";

    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);
        var $el;
        if(opt.handle === "") {
            $el = this;
        } else {
            $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            var $drag;
            if(opt.handle === "") {
                 $drag = $(this).addClass('draggable');
            } else {
                 $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    };
})(jQuery);