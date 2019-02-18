window.$ = window.jQuery = require('jquery');
window.Tether = require('tether');
window.Bootstrap = require('bootstrap');

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const Chart = require('chart.js');
const parser = new Readline();

let com = null;
let ports = [];

let buffer = {
  data: [],
  size: 6,
};

buffer.data.push = function() {
  if (this.length > buffer.size) {
    this.shift();
  }
  return Array.prototype.push.apply(this, arguments);
};

let chart = new Chart($("#chart"), {
  type: 'line',
  data: {
    datasets: []
  }
});

let dataBuffer = {
  elem: $('#table-body'),
  data: [],
  size: 60,
  add: function(line) {
    this.data.push(line);
    let markup = "<tr>";
    line.forEach(function(cel,index) {
      if(chart.data.datasets[index] === undefined){
        chart.data.datasets.push(
            {data : []}
        );
      }
      chart.data.datasets[index].data.push(cel);
      markup += "<td>" + cel+ "</td>";
    });
    markup += "</tr>";
    this.elem.append(markup);
    if(this.elem.children().length > this.size){
      this.elem.children().first().remove();
      chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
      });
    }
    chart.update();
  }
};

dataBuffer.data.push = function() {
  if (this.length > dataBuffer.size) {
    this.shift();
  }
  return Array.prototype.push.apply(this, arguments);
};



let process = {
  input: function(data) {
    let val = data.toString().split(",");
    switch (val[0]) {
      case "MSG":
        $("#msg").html(val[1]);
        break;
      case "DATA":
        val.shift();
        dataBuffer.add(val);
    }
  }
};


let error = {
  set: function(data) {
    $('#error').html(data);
  }
};

SerialPort.list((err, ps) => {
  ports = ps;
  if (err) {
    $('#error').html(err.message);
  } else {
    $('#error').html('');
    ports.forEach( (p , index) => {
      if(! (p.productId === undefined)){
        let option = new Option(p.comName, index);
        $('#port').append($(option));
      }
    });
  }
});

$('#port').change(function() {
  com = ports[$( this ).val()];
});

$('#connect').on('click', function() {

  if (! (com === null)) {
    const port = new SerialPort(com.comName);
    port.pipe(parser);
    // The open event is always emitted
    port.on('open', function(port) {
      //console.log(port);
    });

    // The open event is always emitted
    parser.on('data', function(data) {
      buffer.data.push(data);
      process.input(data);
    });

  } else {
    error.set('Selecione uma porta');
  }
});

