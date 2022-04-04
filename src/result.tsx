import * as React from 'react';
import { KaTeX } from './katex';

import { ResultProps, ResultState } from './types';
import { format } from 'date-fns';

function num2tex(value: number | null): string {
  if(value == null) return '';
  let s = value.toString();
  s = s.replace('NaN', '\\mathrm{NaN}');
  s = s.replace('Infinity', '\\infty');
  s = s.replace(/e\+([0-9]*)/, '\\times 10^{$1}');
  s = s.replace(/e(-[0-9]*)/, '\\times 10^{$1}');
  return s;
}

export class Result extends React.Component<ResultProps, ResultState> {
  constructor(props: ResultProps) {
    super(props);
    this.state = {
      showPrecise: false
    };
  }
  render() {
    let statistic: string;
    if(this.props.test == 'OVL-1'){
      statistic = '\\rho_{1,n,n}';
    }else if(this.props.test == 'OVL-2'){
      statistic = '\\rho_{2,n,n}';
    }
    return (
      <div className='part result'>
        <h2>Latest Result</h2>
        <p>
        <button
          disabled={this.props.statistic == null}
          onClick={this.props.compute_pvalue}
        >
          compute the <KaTeX text='p' />-value
        </button> <span id='progress'></span>
        </p>
        <p>
          <input
            type='checkbox'
            onChange={ event => this.setState({
              showPrecise: event.target.checked
            }) }
          /><label>show precise</label>
        </p>
        <p className={this.props.statistic == null ? 'none' : '' }>
          statistics: <KaTeX text={statistic} /> = {(this.state.showPrecise ? `${this.props.statistic}/${this.props.size} =` : '')} <KaTeX text={num2tex(this.props.statistic / this.props.size)}/>
        </p>
        <p className={this.props.pvalue == null ? 'none' : '' }>
          <KaTeX text='p' />-value: {(this.props.pvalue != null && this.state.showPrecise ? `${this.props.pvalue['numer']} / ${this.props.pvalue['denom']} =` : '')} <KaTeX text={this.props.pvalue == null ? '' : num2tex(this.props.pvalue['pvalue'])}/>
        </p>
        <h2>History</h2>
        <p className={this.props.history.length > 0 ? '' : 'none'}>These will be lost if you reload the page.</p>
        <table className='history'>
          <thead>
            <tr>
              <th>Date</th>
              <th colSpan={2}>Data Label</th>
              <th>Test</th>
              <th>Size</th>
              <th>Statistic</th>
              <th><KaTeX text='p'/>-value</th>
            </tr>
          </thead>
          <tbody>
            { this.props.history.map((item, i) => (
              <tr key={i}>
                <td> { format(item.date, 'Ppp') } </td>
                <td> { item.label[0] } </td>
                <td> { item.label[1] } </td>
                <td> { item.test } </td>
                <td> { item.size } </td>
                <td> { item.statistic / item.size } </td>
                <td> { item.pvalue['pvalue'] } </td>
              </tr>
            )) }
          </tbody>
        </table>
      </div>
    )
  }
}