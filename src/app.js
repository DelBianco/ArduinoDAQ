// Arduino DAQ Application
window.$ = window.jQuery = require('jquery');
window.Tether = require('tether');
window.Bootstrap = require('bootstrap');

window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};


const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const parser = new Readline();
const Arduino = require('./arduino');
const Chart = require('chart.js');
const daq = new Arduino();

var chart = new Chart($("#myChart"), {
  type: 'line',
  data: daq.chart.data,
});


let com = null;
let ports = [];
let port = null;

SerialPort.list((err, ps) => {
  ports = ps;
  if (err) {
    $('#error').html(err.message);
  } else {
    $('#error').html('');
    ports.forEach((p, index) => {
      if (!(p.productId === undefined)) {
        let option = new Option(p.comName, index, true, true);
        $('#port').append($(option));
        com = p;
      }
    });
  }
});

$('#port').change(function() {
  com = ports[$(this).val()];
});

$('#connect').on('click', function() {
  if (!(com === null)) {
    daq.alert.msg = "Connected";
    daq.alert.level = "success";
    port = new SerialPort(com.comName);
    port.pipe(parser);
    parser.on('data', function(data) {
      daq.push(data);
    });

    setInterval(function() {
      daq.render();
      chart.data = daq.chart.data;
      chart.update();
    },daq.refreshRate);
  } else {
    $('#error').html('Selecione uma porta');
    daq.alert.msg = "Disconnected: Selecione uma porta";
    daq.alert.level = "danger";
  }
});

$("#disconnect").on('click',function() {
  daq.alert.msg = "Disconnected";
  daq.alert.level = "danger";
  daq.render();
  port.close();
  port = null;
  clearInterval();
});
