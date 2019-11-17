const express = require('express');
const app = express();
const port = 3000;
const SerialPort = require('serialport');
const serialPort = new SerialPort('COM4');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
const http = require('http').createServer(app);
const socket = require('socket.io')(http);
let user;

app.use(express.static('public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/noty/lib'));
app.use(express.static(__dirname + '/node_modules/jquery/dist'));
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));
app.use(express.static(__dirname + '/node_modules/popper.js/dist'));

http.listen(port, () => console.log(`App listening on port ${port}!\nYou may connect by adress - http://localhost:3000/`));

socket.on('connection', socket => {
    console.log('User connected');
    user = socket;
});

serialPort.pipe(parser);
parser.on('data', data => {
    if (user !== undefined && user !== null) {
        user.emit('card', data)
    }
    console.log(data);
});