const initial_sample_size = 3;
let sample_size = 0;
let statistics;

import { parse } from 'csv-parse/sync';

import('../pkg').then(wasm => {
  document.getElementById('compute-pvalue').onclick = function() {
    document.getElementById('pvalue').innerHTML = wasm.p_value(sample_size, statistics).toString();
  }
});

function clear_result(){
  const cells = document.getElementsByClassName('result');
  for(let i = 0; i < cells.length; ++i){
    cells[i].innerHTML = '';
  }
  (document.getElementById('compute-pvalue') as HTMLInputElement).disabled = true;
}

function compute_statistics(){
  const data = new Array();
  const rows = document.getElementById('data').children;
  let has_nan = false;
  for(let i = 0; i < sample_size; ++i){
    const cells = rows[i].children;
    for(let j = 0; j < 2; ++j){
      const value = Number.parseFloat(cells[j + 1].innerHTML);
      if(Number.isNaN(value)){
        has_nan = true;
      }else{
        data.push([value, i, j]);
      }
    }
  }
  data.sort((x, y) => x[0] - y[0]);
  const duplicate = Array(sample_size);
  for(let i = 0; i < sample_size; ++i){
    duplicate[i] = [false, false];
  }
  let has_duplicate = false;
  for(let i = 1; i < data.length; ++i){
    const left = data[i - 1];
    const right = data[i];
    if(left[0] == right[0]){
        duplicate[left[1]][left[2]] = true;
        duplicate[right[1]][right[2]] = true;
        has_duplicate = true;
    }
  }
  for(let i = 0; i < sample_size; ++i){
    const cells = rows[i].children;
    for(let j = 0; j < 2; ++j){
      (cells[j + 1] as HTMLElement).style.backgroundColor =
        duplicate[i][j] ? 'red' : 'transparent';
    }
  }
  if(has_nan || has_duplicate){
    clear_result();
  }else{
    let delta = 0;
    let delta_max = 0;
    let delta_min = 0;
    for(const g of data){
      delta += g[2] == 0 ? 1 : -1;
      if(delta_max < delta) delta_max = delta;
      if(delta_min > delta) delta_min = delta;
    }
    statistics = sample_size - (delta_max - delta_min);
    document.getElementById('statistics-precise').innerHTML = statistics + '/' + sample_size;
    document.getElementById('statistics-float').innerHTML = (statistics / sample_size).toString();
    (document.getElementById('compute-pvalue') as HTMLInputElement).disabled = false;
    document.getElementById('pvalue').innerHTML = '';
  }
}

function set_sample_size(size: number) {
  const data = document.getElementById('data');
  for(; sample_size < size; ++sample_size){
    const row = document.createElement('tr');
    const index = document.createElement('td');
    index.innerHTML = (sample_size + 1).toString();
    row.appendChild(index);
    for(let i = 0; i < 2; ++i){
      const cell = document.createElement('td');
      cell.className = 'cell';
      cell.contentEditable = 'true';
      cell.oninput = compute_statistics;
      row.appendChild(cell);
    }
    data.appendChild(row);
  }
  for(; sample_size > size; --sample_size){
    data.lastChild.remove();
  }
  (document.getElementById('sample-size') as HTMLInputElement).value = sample_size.toString();
  compute_statistics();
}

document.getElementById('clear').onclick = function(){
  const cells = document.getElementsByClassName('cell');
  for(let i = 0; i < sample_size * 2; ++i){
    cells[i].innerHTML = '';
  }
  clear_result();
}

document.getElementById('sample-size').onchange = function(event){
  const num = Number((event.target as HTMLInputElement).value);
  if(Number.isSafeInteger(num) && num > 0){
    set_sample_size(num);
  }else{
    console.log('invalid sample size:', num);
  }
}

document.getElementById('csv-input').onchange = function(event){
  const file = (event.target as HTMLInputElement).files[0];
  const reader = new FileReader();
  reader.onload = event => {
    if(typeof event.target.result === 'string'){
      const data = parse(event.target.result);
      set_sample_size(data.length - 1);
      const labels = document.getElementById('data-label').children;
      labels[1].innerHTML = data[0][0];
      labels[2].innerHTML = data[0][1];
      const rows = document.getElementById('data').children;
      for(let i = 0; i < sample_size; ++i){
        const cells = rows[i].children;
        for(let j = 0; j < 2; ++j){
          cells[j + 1].innerHTML = data[i + 1][j];
        }
      }
      compute_statistics();
    }
  };
  reader.readAsText(file);
}

set_sample_size(initial_sample_size);
