const initial_data_num = 3;
let data_num = 0;
let statistics;

import('../pkg/index.js').catch(console.error);

function compute_statistics() {
    let table = $('#table');
    data = Array(data_num * 2);
    for(let i = 0; i < data_num; ++i){
        let row = table.children().eq(i + 1);
        for(let j = 0; j < 2; ++j){
            let cell = row.children().eq(j + 1);
            data[i * 2 + j] = [cell.text(), j];
        }
    }
    data.sort();
    let delta = 0;
    let delta_max = 0;
    let delta_min = 0;
    for(let g of data){
        delta += g[1] == 0 ? 1 : -1;
        if(delta_max < delta) delta_max = delta;
        if(delta_min > delta) delta_min = delta;
        console.log(g[0], delta, delta_max, delta_min);
    }
    statistics = data_num - (delta_max - delta_min);
    $('#statistics').text(statistics / data_num);
}

function set_data_num(num) {
    let table = $('#table');
    if(data_num > num){
        // 多いので減らす
        table.children().slice(num + 1).remove();
    }else{
        // 少ないので増やす
        for(let i = data_num; i < num; ++i){
            let row = $('<tr><td>' + (i + 1) + '</td></tr>');
            for(let j = 0; j < 2; ++j){
                $('<td />', { contenteditable: true })
                    .on('input', compute_statistics)
                    .appendTo(row);
            }
            table.append(row);
        }
    }
    data_num = num;
}

set_data_num(initial_data_num);