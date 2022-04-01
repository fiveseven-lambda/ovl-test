import * as React from 'react';
import { KaTeX } from './katex';

import {ResultProps} from './types';

export class Result extends React.Component<ResultProps> {
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
        <p className={this.props.statistic == null ? 'none' : '' }>
          statistics: <KaTeX text={statistic + '=' + this.props.statistic / this.props.size} />
        </p>
        <button
          className={this.props.statistic != null && this.props.pvalue == null ? '' : 'none' }
          onClick={this.props.compute_pvalue}
        >
          compute the <KaTeX text='p' />-value
        </button>
        <p className={this.props.pvalue == null ? 'none' : '' }>
          <KaTeX text='p' />-value: <KaTeX text={'p = ' + this.props.pvalue} />
        </p>
        <h2>History</h2>
      </div>
    )
  }
}