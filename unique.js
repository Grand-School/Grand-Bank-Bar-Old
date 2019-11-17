const SerialPort = require('serialport');
const serialPort = new SerialPort('COM4');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();

let messages = 0;
let cards = [];

serialPort.pipe(parser);
parser.on('data', data => {
    if (++messages <= 2) { // ignore start messages
        return;
    }

    let card = data.substr(20);
    if (card === cards[cards.length - 1]) {
        return;
    }

    console.log('Read card: ' + card);
    console.log(cards.includes(card) ? `NOT UNIQUE!` : 'UNIQUE');
    cards.push(card);
});