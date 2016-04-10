"use strict";

var md5 = require('../utils/md5.js');

var DEFAULT_ROOM = 'Lobby';
var roomHandler = {};
var roomDict = {};


//TODO: add back md5.encode(inToken)
roomHandler.validToken = function (inToken) {

    var roomID = md5.encode(inToken);

    return roomID in roomDict;
};

roomHandler.addAdmin = function (inToken, userID) {
    
    var roomID = md5.encode(inToken);

    roomDict[roomID].adminUserDict[userID] = true;
    
};

roomHandler.getAdmins = function (roomID) {
    return roomDict[roomID].adminUserDict;
};

//TODO: add back md5.encode(inToken)
roomHandler.getUsersInRoom = function(inToken) {

    return roomDict[md5.encode(inToken)].userDict;
};


// Check if the socket's user already in a room
// otherwise, use the input roomID
// else go to lobby
roomHandler.socketJoin = function(socket, roomID) {

    var user = socket.user;
    var room;

    if (typeof(user.roomID) == 'undefined') {

        if (typeof(roomID) == 'undefined') {
            roomID = DEFAULT_ROOM;
        }


        if (roomID in roomDict)

            room = roomDict[roomID];

        else

            room = createRoom(roomID); 

        room.userDict[user.id] = user;
        room.userCount ++;
        room.totalUsers ++;
        user.roomID = roomID;

    }else
        room = roomDict[user.roomID]; 

    room.totalSockets++;     

    socket.join(user.roomID);

    return user.roomID;
    
};

roomHandler.leftRoom = function(user) {

    var room = roomDict[user.roomID];
    delete room.userDict[user.id];
    delete room.adminUserDict[user.id];

    room.userCount--;

    // May not want to delete the room, we'll lose the total user count and message count
    if (room.userCount === 0)
        delete roomDict[user.roomID];
};

roomHandler.newMsg = function (roomID) {
    roomDict[roomID].totalMsg++;
};

roomHandler.getRoomInfo = function(inToken) {

    var room = roomDict[md5.encode(inToken)];

    return {

        createTime: room.createTime,
        totalUsers: room.totalUsers,
        totalSockets: room.totalSockets,
        totalMsg: room.totalMsg

    };
};


function createRoom(roomID) {

    if (roomID in roomDict)
        return roomDict[roomID];

    var room = {};
    room.id = roomID;
    room.createTime = (new Date()).toString();
    room.userDict = {};
    room.userCount = 0;
    room.totalUsers = 0;
    room.totalSockets = 0;
    room.totalMsg = 0;
    room.adminUserDict = {};
    roomDict[roomID] = room;

    return room;
}


module.exports = roomHandler;