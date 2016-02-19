window.chatbox = window.chatbox || {};
"use strict";

(function() {


    // generate a unique guid for each browser, will pass in cookie
    chatbox.guid = function() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }


    chatbox.getCookie = function(cname) {

        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
        }

        return "";
    }

    chatbox.addCookie = function(cname, cvalue) {

        exdays = 365;
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; domain=" + getCookieDomain() + "; path=/";
    }


    function getCookieDomain() {

        var host = location.hostname;
        var ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        if (ip.test(host) === true || host === 'localhost') return host;
        var regex = /([^]*).*/;
        var match = host.match(regex);
        if (typeof match !== "undefined" && null !== match) {
            host = match[1];
        }
        if (typeof host !== "undefined" && null !== host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
            host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return '.' + host;
    }


})();   
