const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();
var users = [];

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    // TODO: don't allow users with the same id
    console.log("User " + req.headers.origin + " joined!");
    users.push(req.headers.origin);
    wss.broadcast("room: User " + req.headers.origin + " joined!");

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        wss.broadcast(message);
    });

    ws.on('close', function close(ws, req) {
        console.log('Connection closed...');
    });
});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});
