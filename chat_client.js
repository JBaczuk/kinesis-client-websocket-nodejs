const WebSocket = require('ws');
const readline = require('readline');
const colors = require('colors');
var ws;
rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout
});

var userId;

welcome();

if (process.argv.length > 2) {
    userId = process.argv[2];
}
else {
    rl.question('Choose a username: ', (answer) => initConnection(answer));
}

function initConnection(id) {
    userId = id;
    // NOTE: Change this url to the server's ip address/domain
    ws = new WebSocket('ws://localhost:8000', {
        origin: id,
        perMessageDeflate: false,
    });
    ws.on('open', function open(ws, req) {
        console.log("= Connection to chatroom established!".blue);
        flush(prompt);
    });
    
    ws.on('message', function incoming(data) {
        console.log(data);
        flush(prompt);
    });
}

function welcome() {
    console.log(["= Welcome to Websocket Chatroom"
        , "= Please keep it civil - or don't who cares"
    ].join('\n').blue);
}

function prompt() {
    var arrow = '> '
        , length = arrow.length
        ;

    rl.setPrompt(arrow.green, length);
    rl.prompt();
}

var state = 1;

rl.on('line', function (msg) {
    //process.stdout.write("msg: ", msg);
    //console.log("msg: ", msg);
    ws.send(userId + ": " + msg);
    prompt();
}).on('close', function () {
    // only gets triggered by ^C or ^D
    util.puts('goodbye!'.green);
    process.exit(0);
});

process.on('uncaughtException', function (e) {
    console.log(e.stack.red);
    rl.prompt();
});

function flush(callback) {
    if (process.stdout.write('')) {
        callback();
    } else {
        process.stdout.once('drain', function () {
            callback();
        });
    }
};