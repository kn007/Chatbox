var utils = {

    getTime: function() {

        return (new Date()).getTime().toString();

    }

    // set username, avoid empty name
    setUsername: function(name) {

        if (typeof name != 'undefined' && name!=='')
            return name;

        return "no name";

    }

}


module.exports = utils;