import * as React from 'react';
import { format } from 'date-fns';

import { KaTeX } from './katex';
import { Test, ResultProps, PValue } from './types';

type HistoryItem = {
  date: Date;
  label: string[];
  test: Test;
  size: number;
  statistic: number;
  pvalue: number;
};

export const Result = ({input, results, pValue: [pValue, setPValue], pkg, widthSwitch}: ResultProps) => {
  let [history, setHistory] = React.useState<HistoryItem[]>([]);
  let [showPrecise, setShowPrecise] = React.useState(false);
  return <div id='result' className={`part ${widthSwitch}`}>
    <h2>Latest Result</h2>
    { results.statistic !== null && <div>
      <div>
        <button
        onClick={
          _ => {
            let item: HistoryItem = {
                date: new Date(),
                label: [input.label[0], input.label[1]],
                test: input.test,
                size: input.data.length,
                statistic: results.statistic,
                pvalue: null,
            };
            pkg.fn[input.test](input.data.length, results.statistic).then(pvalue_str => {
              $('#progress').text('');
              const pvalue = JSON.parse(pvalue_str) as PValue;
              setPValue(pvalue);
              item.pvalue = pvalue.approx;
              setHistory([...history, item]);
            })
          }
        }>compute <KaTeX text='p'/>-value</button> <span id='progress'/>
      </div>
      <p>
        <input
          type='checkbox'
          onChange={ event => setShowPrecise(event.target.checked) }
        /><label>show precise</label>
      </p>
      <p>statistic: <KaTeX text={getStatisticName(input.test)}/> = {(showPrecise ? `${results.statistic} / ${input.data.length} =` : '')} <KaTeX text={num2tex(results.statistic / input.data.length)}/></p>
    </div> }
    { pValue !== null && <p><KaTeX text='p'/>-value: {(showPrecise ? `${pValue.precise[0]} / ${pValue.precise[1]} =` : '')} <KaTeX text={num2tex(pValue.approx)}/></p> }
    <h2>History</h2>
    { history.length > 0 && <div>
      <p>These will be lost if you reload the page.</p>
      <table className='history'>
        <thead>
          <tr>
            <th>Time</th>
            <th colSpan={2}>Data Label</th>
            <th>Test</th>
            <th>Size</th>
            <th>Statistic</th>
            <th><KaTeX text='p'/>-value</th>
          </tr>
        </thead>
        <tbody>
          { history.map((item, i) => (
            <tr key={i}>
              <td> { format(item.date, 'pp') } </td>
              <td> { item.label[0] } </td>
              <td> { item.label[1] } </td>
              <td> { item.test } </td>
              <td> { item.size } </td>
              <td> { item.statistic / item.size } </td>
              <td> { item.pvalue } </td>
            </tr>
          )) }
        </tbody>
      </table>
    </div> }
  </div>;
}

const num2tex = (value: number) => value.toString()
  .replace('NaN', '\\mathrm{NaN}')
  .replace('Infinity', '\\infty')
  .replace(/e\+([0-9]*)/, '\\times 10^{$1}')
  .replace(/e(-[0-9]*)/, '\\times 10^{$1}');

function getStatisticName(test: Test): string {
  switch(test){
    case 'OVL-1':
      return '\\rho_{1,n,n}';
    case 'OVL-2':
      return '\\rho_{2,n,n}';
  }
}