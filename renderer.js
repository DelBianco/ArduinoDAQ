window.$ = window.jQuery = require('jquery');
window.Tether = require('tether');
window.Bootstrap = require('bootstrap');

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const parser = new Readline();

let arduinoDAQ = {
  series: [],
  labels: [],
  data: [],
  msg: null,
  datasize: 100,
  refreshRate: 1000,
  render: function() {
    $('#msg').html(this.msg);
  },
};

arduinoDAQ.data.push = function() {
  if (this.length > arduinoDAQ.datasize) {
    this.shift();
  }
  return Array.prototype.push.apply(this, arguments);
};

let com = null;
let ports = [];

let buffer = {
  data: [],
  size: 20,
};

buffer.data.push = function() {
  if (this.length > buffer.size) {
    this.shift();
  }
  return Array.prototype.push.apply(this, arguments);
};

let process = {
  input: function(data) {
    let val = data.toString().split(',');
    switch (val[0]) {
      case 'MSG':
        arduinoDAQ.msg = val[1];
        break;
      case 'DATA':
        val.shift();
        arduinoDAQ.data.push(val);
        arduinoDAQ.labels.push(val[0]);
        val.shift();
        arduinoDAQ.series.push(val);
    }
  },
};

let error = {
  set: function(data) {
    $('#error').html(data);
  },
};

SerialPort.list((err, ps) => {
  ports = ps;
  if (err) {
    $('#error').html(err.message);
  } else {
    $('#error').html('');
    ports.forEach((p, index) => {
      if (!(p.productId === undefined)) {
        let option = new Option(p.comName, index);
        $('#port').append($(option));
      }
    });
  }
});

$('#port').change(function() {
  com = ports[$(this).val()];
});

$('#connect').on('click', function() {
  if (!(com === null)) {
    const port = new SerialPort(com.comName);
    port.pipe(parser);
    // The open event is always emitted
    parser.on('data', function(data) {
      buffer.data.push(data);
      process.input(data);
    });

    setInterval(function() {
      arduinoDAQ.render();
    },arduinoDAQ.refreshRate);

  } else {
    error.set('Selecione uma porta');
  }


});