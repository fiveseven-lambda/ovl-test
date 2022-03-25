const initial_data_num = 3;
let data_num = 0;
let statistics;

import('../pkg/index.js').catch(console.error);
import { parse } from 'csv-parse/lib/sync.js';

function compute_statistics() {
    const rows = $('#table').children();
    const data = Array(data_num * 2);
    for(let i = 0; i < data_num; ++i){
        const cells = rows.eq(i + 1).children();
        for(let j = 0; j < 2; ++j){
            data[i * 2 + j] = [parseFloat(cells.eq(j + 1).text()), j];
        }
    }
    data.sort((x, y) => x[0] - y[0]);
    let delta = 0;
    let delta_max = 0;
    let delta_min = 0;
    for(const g of data){
        delta += g[1] == 0 ? 1 : -1;
        if(delta_max < delta) delta_max = delta;
        if(delta_min > delta) delta_min = delta;
    }
    statistics = data_num - (delta_max - delta_min);
    $('#statistics_precise').text(statistics + '/' + data_num);
    $('#statistics_float').text(statistics / data_num);
}

function set_data_num(num) {
    const table = $('#table');
    if(data_num > num){
        // 多いので減らす
        table.children().slice(num + 1).remove();
    }else{
        // 少ないので増やす
        for(let i = data_num; i < num; ++i){
            const row = $('<tr><td>' + (i + 1) + '</td></tr>');
            for(let j = 0; j < 2; ++j){
                $('<td />', { contenteditable: true })
                    .on('input', compute_statistics)
                    .appendTo(row);
            }
            table.append(row);
        }
    }
    table.find('td').off('keydown');
    table
        .children(':last')
        .children(':last')
        .keydown(event => {
            if(!(event.shiftKey || event.altKey || event.ctrlKey) && event.which == 9){
                set_data_num(data_num + 1);
            }
        });
    data_num = num;
    $('#sample_size').val(num);
}

$('#clear').click(function(){
    $('#table').find('[contenteditable="true"]').text('');
    $('.result').text('');
});
$('#sample_size').change(function(){
    set_data_num(parseInt($(this).val()));
});
$('#csv_file').change(function(){
    const file = $(this).prop('files')[0];
    const reader = new FileReader();
    reader.onload = event => {
        const data = parse(event.target.result);
        const rows = $('#table').children();
        set_data_num(data.length - 1);
        for(let i = 0; i < data.length; ++i){
            let cells = rows.eq(i).children();
            for(let j = 0; j < 2; ++j){
                cells.eq(j + 1).text(data[i][j]);
            }
        }
    };
    reader.readAsText(file);
});

set_data_num(initial_data_num);