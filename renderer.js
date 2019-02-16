// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.$ = window.jQuery = require('jquery');
window.Tether = require('tether');
window.Bootstrap = require('bootstrap');

const SerialPort = require('serialport');
let buffer = {
  data: [],
  size: 6,
};

buffer.data.push = function() {
  if(this.length > buffer.size){
    this.shift();
  }

  document.getElementById('debug').textContent = this.join();
  return Array.prototype.push.apply(this,arguments);
};


SerialPort.list((err, ports) => {
  if (err) {
    document.getElementById('error').textContent = err.message
    return
  } else {
    document.getElementById('error').textContent = ''
  }
});

const port = new SerialPort('/dev/ttyUSB0');

// The open event is always emitted
port.on('open', function(port) {
  console.log(port)
})

// The open event is always emitted
port.on('data', function(data) {
  buffer.data.push(data);
})


