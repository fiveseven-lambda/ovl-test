import * as React from 'react';

import { Input, Results, WidthSwitch, PValue, Pkg } from './types';

import { UserInput } from './userInput';
import { Result } from './result';
import { parseUniFloat } from './parsefloat';

export const Main = ({ widthSwitch, pkg }: { widthSwitch: WidthSwitch, pkg: Pkg }) => {
  let [input, setInput] = React.useState<Input>({
    test: 'OVL-2',
    size: '3',
    label: ['', ''],
    data: [['', ''], ['', ''], ['', '']],
    decimalSeparator: '.',
  });
  let results = computeStatistic(input);
  let [pValue, setPValue] = React.useState<PValue>(null);
  return <div className={`flex ${widthSwitch}`}>
    <UserInput
      input={[input, (partial: Partial<Input>) => {
        setInput({...input, ...partial});
        setPValue(null);
      }]}
      widthSwitch={widthSwitch}
      duplicate={results.duplicate}
    />
    <Result
      input={input}
      results={results}
      pValue={[pValue, setPValue]}
      pkg={pkg}
      widthSwitch={widthSwitch}
    />
  </div>
}

function computeStatistic(input: Input): Results {
  const size = input.data.length;
  const duplicates = Array(size);
  for(let i = 0; i < size; ++i){
    duplicates[i] = [false, false];
  }
  let has_duplicate = false;

  const data: [number, number, number][] = new Array();
  let has_nan = false;
  for(let i = 0; i < size; ++i){
    for(let j = 0; j < 2; ++j){
      const value: number = parseUniFloat(input.data[i][j], input.decimalSeparator);
      if(Number.isNaN(value)){
        has_nan = true;
      }else{
        data.push([value, i, j]);
      }
    }
  }
  data.sort((x, y) => x[0] - y[0]);
  // console.log(data); // debug print
  for(let i = 1; i < data.length; ++i){
    const left = data[i - 1];
    const right = data[i];
    if(left[0] == right[0]){
      has_duplicate = true;
      duplicates[left[1]][left[2]] = true;
      duplicates[right[1]][right[2]] = true;
    }
  }
  let statistic: number | null;
  if(has_nan || has_duplicate){
    statistic = null;
  }else{
    let delta = 0;
    let delta_max = 0;
    let delta_min = 0;
    for(const g of data){
      delta += g[2] == 0 ? 1 : -1;
      if(delta_max < delta) delta_max = delta;
      if(delta_min > delta) delta_min = delta;
    }
    if(input.test == 'OVL-1'){
      statistic = size - Math.max(delta_max, -delta_min);
    }else if(input.test == 'OVL-2'){
      statistic = size - (delta_max - delta_min);
    }
  }
  return { duplicate: [has_duplicate, duplicates], statistic }
}