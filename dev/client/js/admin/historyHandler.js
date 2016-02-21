(function() {
    "use strict";
   
   var utils = chatbox.utils;


    var scriptHist = [];
    var scriptPointer = -1;

    chatboxAdmin.pushScript = function(script) {

        scriptHist.push(script);
        scriptPointer = scriptHist.length-1;
    }
   

    chatboxAdmin.getScript = function() {

        if (scriptPointer >= 0 && scriptPointer < scriptHist.length)
            return scriptHist[scriptPointer];

        return '';

    }

    chatboxAdmin.nextScript = function() {

        if (scriptPointer < scriptHist.length - 1) {
            scriptPointer++;
            return true;
        }

        return false;
    }

    chatboxAdmin.prevScript = function() {

        if (scriptPointer > 0){
            scriptPointer--;
            return true;
        }

        return false;
    }


})();
