var utils = require('../utils/utils.js');
// var socketHandler = require('./socketHandler.js');
var md5 = require('../utils/md5.js');

var DEFAULT_ROOM = 'Lobby';
var roomHandler = {};
var roomDict = {};



roomHandler.validToken = function (inToken) {return inToken in roomDict;} //TODO: add back md5.encode(inToken)

roomHandler.getUsersInRoom = function(inToken) {return roomDict[inToken].userDict;} //TODO: add back md5.encode(inToken)


// check if the socket's user already in a room
// otherwise, use the input roomID
// else go to lobby
roomHandler.socketJoin = function(socket, roomID) {


    var user = socket.user;

    if (typeof(user.roomID) == 'undefined') {

        if (typeof(roomID) == 'undefined') {
            roomID = DEFAULT_ROOM;
        }

        var room;

        if (roomID in roomDict)

            room = roomDict[roomID];

        else

            room = createRoom(roomID); 

        room.userDict[user.id] = user;
        room.userCount ++;
        user.roomID = roomID;

    }      

    socket.join(user.roomID);

    return user.roomID;
    
}

roomHandler.leftRoom = function(user) {

    var room = roomDict[user.roomID];
    delete room.userDict[user.id];
    room.userCount--;
    if (room.userCount === 0)
        delete roomDict[user.roomID];
}


function createRoom(roomID) {

    if (roomID in roomDict)
        return roomDict[roomID];

    var room = {};
    room.id = roomID;
    room.userDict = {};
    room.usrCount = 0;
    roomDict[roomID] = room;

    return room;
}


module.exports = roomHandler;