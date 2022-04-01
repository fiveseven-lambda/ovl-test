import * as React from 'react';
import { KaTeX } from './katex';

const Description = () => (
  <div className='part description'>
    <h2>About</h2>
    <p>
      This page implements
      the OVL-<KaTeX text='q' /> (<KaTeX text='q = 1, 2' />),
      a statistical framework for two-sample testing.
      Here you can test whether two samples come from the same distribution.
    </p>
    <p>
      The OVL-1 is equivalent to the Smirnov (or the two-sample Kolmogorov-Smirnov) test.
    </p>
  </div>
);

const tests = ['OVL-1', 'OVL-2'] as const;
type Test = typeof tests[number];

type ResultProps = {
  test: Test,
  size: number;
  statistic: number | null;
};

type ResultState = {
  pvalue: number | null;
  fn_pvalue: {[key in Test]: (n: number, k: number) => number} | null;
};

class Result extends React.Component<ResultProps, ResultState> {
  constructor(props: ResultProps) {
    super(props);
    this.state = {
      pvalue: null,
      fn_pvalue: null,
    }
  }
  componentDidMount() {
    import('../pkg').then(wasm => {
      this.setState({
        fn_pvalue: {
          'OVL-1': wasm.p_value_1,
          'OVL-2': wasm.p_value_2,
        }
      });
    });
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
        <p className={this.props.statistic == null ? 'none' : '' }>
          statistics: <KaTeX text={statistic} /> = { this.props.statistic / this.props.size }
        </p>
        <button
          className={this.props.statistic != null && this.state.pvalue == null ? '' : 'none' }
          onClick={ event => {
            this.setState({
              pvalue: this.state.fn_pvalue[this.props.test](this.props.size, this.props.statistic)
            });
          }}
        >
          compute the <KaTeX text='p' />-value
        </button>
        <p className={this.state.pvalue == null ? 'none' : '' }>
          <KaTeX text='p' />-value: <KaTeX text='p' /> = { this.state.pvalue }
        </p>
        <h2>History</h2>
      </div>
    )
  }
}

type MainState = {
  test: Test;
  size: string;
  data: string[][];
  label: string[];
};

class Main extends React.Component<{}, MainState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      test: 'OVL-2',
      size: '3',
      label: ['data 0', 'data 1'],
      data: [['',''],['',''],['','']],
    };
  }
  render() {
    const size = this.state.data.length;
    const data: [number, number, number][] = new Array();
    let has_nan = false;
    for(let i = 0; i < size; ++i){
      for(let j = 0; j < 2; ++j){
        const value: number = Number.parseFloat(this.state.data[i][j]);
        if(Number.isNaN(value)){
          has_nan = true;
        }else{
          data.push([value, i, j]);
        }
      }
    }
    data.sort((x, y) => x[0] - y[0]);
    const duplicate = Array(size);
    for(let i = 0; i < size; ++i){
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
      if(this.state.test == 'OVL-1'){
        statistic = size - Math.max(delta_max, -delta_min);
      }else if(this.state.test == 'OVL-2'){
        statistic = size - (delta_max - delta_min);
      }
    }
    return (
      <div className='main'>
        <Description />
        <div className='part user-input'>
          <h2>Input Data</h2>
          <p>
            test:
            <select
              onChange={ event => {
                switch(event.target.value){
                  case 'OVL-1':
                  case 'OVL-2':
                    this.setState({ test: event.target.value });
                }
              } }
              defaultValue={this.state.test}
            >
              { tests.map(test => <option key={test}>{test}</option>) }
            </select>
          </p>
          <p>
            sample size:
            <input
              type='number'
              min='1'
              onChange={ event => {
                let size = Number(event.target.value);
                if(Number.isSafeInteger(size) && size > 0){
                  let old_size = this.state.data.length;
                  this.state.data.length = size;
                  for(let i = old_size; i < size; ++i){
                    this.state.data[i] = ['', ''];
                  }
                  this.setState({
                    size: event.target.value,
                    data: this.state.data
                  });
                }else{
                  this.setState({ size: event.target.value });
                  console.log('invalid sample size:', size);
                }
              } }
              value={this.state.size}
            ></input>
          </p>
          <p className={has_duplicate ? 'duplicate' : 'none'}> Data must not have duplicates. </p>
          <table className='data'>
            <thead>
              <tr>
                <th></th>
                { this.state.label.map((label, i) => <th key={i}>
                  <input
                    type='text'
                    onChange={ event => {
                      this.state.label[i] = event.target.value;
                      this.setState({ label: this.state.label });
                    } }
                    value={this.state.label[i]}
                  ></input>
                </th>) }
              </tr>
            </thead>
            <tbody>
              { this.state.data.map((row, i) => <tr key={i}>
                <td>{i + 1}</td>
                { row.map((cell, j) => <td key={j}>
                  <input
                    type='text'
                    onBlur={ event => {
                      this.state.data[i][j] = event.target.value;
                      this.setState({ data: this.state.data });
                    } }
                    className={ duplicate[i][j] ? 'duplicate-cell' : '' }
                  ></input>
                </td>) }
              </tr>) }
            </tbody>
          </table>
        </div>
        <Result
          test={this.state.test}
          statistic={statistic}
          size={size}
        />
      </div>
    )
  }
}

export { Main };