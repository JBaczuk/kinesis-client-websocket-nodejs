const WebSocket = require('ws');
const readline = require('readline');
const colors = require('colors');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
    ws.send('something');
});

ws.on('message', function incoming(data) {
    //console.log("Websocket server: ", data);
});

rl = readline.createInterface(process.stdin, process.stdout)
    , help = ['.help        ' + 'display this message.'.blue
        , '.error       ' + 'display an example error'.blue
        , '.q[uit]      ' + 'exit console.'.blue
    ].join('\n')
    ;

function welcome() {
    console.log(["= test-client "
        , "= Send any message you like"
    ].join('\n').blue);
    prompt();
}

function prompt() {
    var arrow = '> '
        , length = arrow.length
        ;

    rl.setPrompt(arrow.green, length);
    rl.prompt();
}

var state = 1;
function exec(command) {
    var num = parseInt(command, 10);
    if (1 <= num && num <= 5) {
        if (state === num) {
            state++;
            console.log('WIN'.green);
        } else {
            console.log(('Try entering a different number, like '
                + state + ' for example').red);
        }
        if (state === 6) {
            console.log('WOW YOU ROCKS A LOT!'.rainbow);
            process.exit(0);
        }

    } else if (command[0] === '.') {

        switch (command.slice(1)) {
            case 'help':
                util.puts(help.yellow);
                prompt();
                break;
            case 'error':
                console.log("Here's what an error might look like");
                JSON.parse('{ a: "bad JSON" }');
                break;
            case 'exit':
            case 'quit':
            case 'q':
                process.exit(0);
                break;
        }
    } else {
        // only print if they typed something
        if (command !== '') {
            console.log(('\'' + command
                + '\' is not a command dude, sorryz').yellow);
        }
    }
    prompt();
}

// 
// Set things up
//
rl.on('line', function (msg) {
    process.stdout.write("msg: ", msg);
}).on('close', function () {
    // only gets triggered by ^C or ^D
    util.puts('goodbye!'.green);
    process.exit(0);
});

process.on('uncaughtException', function (e) {
    console.log(e.stack.red);
    rl.prompt();
});

welcome();

// Helpful thing I didn't get around to using:
// Make sure the buffer is flushed before
// we display the prompt.
function flush(callback) {
    if (process.stdout.write('')) {
        callback();
    } else {
        process.stdout.once('drain', function () {
            callback();
        });
    }
};