class Arduino {

  constructor() {
    this.data = [];
    this.labels = [];
    this.buffer = [];
    this.alert = {
      error: '',
      msg: 'Arduino DAQ',
      level: 'primary',
    };
    this.indexBy = 'first';
    this.dataSize = 100;
    this.bufferSize = 5;
    this.refreshRate = 100;
    this.chart = function() {
      let data = {
        labels: this.labels,
      };
      let cols = this.data[0].length;
      for(let i =0 ; i<cols; i++)
      {
        this.data.push(
            {
              borderColor: window.chartColors.red,
              data: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
              label: 'D0',
            }
        );
        borderColor: window.chartColors.red,
            data: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
          label: 'D0',
      }
      return data;
    }
  }

  render() {
    $('#msg').
        attr('class', 'alert alert-' + this.alert.level).
        html(this.alert.msg);
    $('#debug').html(this.buffer.join(''));
    $('#error').html(this.alert.error);
    $('#table-head').
        html('<tr><th>' + this.labels.join('</th><th>') + '</th></tr>');

    let indexBy = this.indexBy;
    this.data.forEach(function(line, index) {
      let i = index;
      if (indexBy === 'first') {
        i = line[0];
      }
      let tr = line.join('</td><td>');
      if ($('#table-body').find('#line-' + i).length) {
        $('#table-body').find('#line-' + i).html('<td>' + tr + '</td>');
      } else {
        $('#table-body').
            append('<tr id="line-' + i + '"><td>' + tr + '</td></tr>');
      }
    });
  }

  push(data) {
    if (this.buffer.length === 0) {
      data = data.split('');
      data.shift();
      data = data.join('');
    }
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
    this.buffer.push(data);
    this.process(data);
  }

  process(data) {
    let com = this.validateLine(data);
    switch (com.command) {
      case 'MSG':
        this.alert.msg = com.data;
        break;
      case 'DATA':
        if (this.data.length > this.dataSize) {
          this.data.shift();
        }
        this.data.push(com.data);
        break;
      case 'LABEL':
        this.labels = com.data;
        break;
      case 'DATASIZE':
        this.dataSize = com.data;
        break;
      default:
        this.alert.error = 'Comando nao encontrado! ' + data.toString();
        this.alert.msg = 'Comando nao encontrado! ' + data.toString();
        this.alert.level = 'warning';
    }
    this.autoLabel();
  }

  validateLine(string) {
    // change to REGEX
    let val = string.toString().split(',');
    let command = val[0];
    val.shift();
    return {
      command: command,
      data: val,
    };
  }

  autoLabel() {
    if (this.data.length) {
      if (this.labels.length !== this.data[0].length) {
        this.alert.error = 'Numero de argumentos do LABEL diferente da quantidade de Dados informado (' +
            this.labels.join() + ' : ' + this.data[0].join() + ')';
      }
    }
  }
}

module.exports = Arduino;