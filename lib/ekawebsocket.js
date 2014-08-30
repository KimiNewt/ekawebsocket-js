var roomRegister = '_room_register';
var roomUnregister = '_room_unregister';

function EkaWebSocket(url, protocols) {
    this.rooms = [];
    this.subscriptions = [];
    this.topicCallbacks = {};

    if (!protocols) {
        this.websocket = new WebSocket(url);
    } else {
        this.websocket = new WebSocket(url, protocols);
    }
    this.websocket.onmessage = this.onmessage;
    this.websocket.eka = this;
}

EkaWebSocket.prototype.sendMessage = function(messageData, messageType) {
    if (!messageType) {
        messageType = '';
    }
    this.websocket.send(JSON.stringify({type: messageType, data: messageData}));
}

EkaWebSocket.prototype.connectToRoom = function(roomName) {
    this.rooms.push(roomName);
    this.sendMessage({room: roomName}, roomRegister);
}

EkaWebSocket.prototype.disconnectFromRoom = function(roomName) {
    this.rooms.remove(roomName);
    this.sendMessage({room: roomName}, roomUnregister);
}

EkaWebSocket.prototype.on = function(topicName, callback) {
    this.topicCallbacks[topicName] = callback;
}

EkaWebSocket.prototype.onmessage = function(data) {
    var message = JSON.parse(data.data);
    if (this.eka.topicCallbacks[message.type]) {
        this.eka.topicCallbacks[message.type](message.data, message.room, data);
    }
}