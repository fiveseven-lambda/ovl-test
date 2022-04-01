import * as React from 'react';
import { KaTeX } from './katex';

import {MainState} from './types';
import {UserInput} from './userInput';
import {Result} from './result';
import {parse} from 'csv-parse/sync';

const Description = () => (
  <div className='part description'>
    <h2>Summary</h2>
    <p>
      This page implements
      the OVL-<KaTeX text='q' /> (<KaTeX text='q = 1, 2' />),
      a statistical framework for two-sample testing.
      Here you can test whether two samples come from the same distribution.
    </p>
    <p>
      The OVL-1 is equivalent to the <a href='https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test'>two-sample Kolmogorov-Smirnov test</a>.
    </p>
    <h2>Detail</h2>
    <p>
      Let <KaTeX text='X_1, \ldots, X_m'/> and <KaTeX text='Y_1, \ldots, Y_n'/> be
      independent random variables with distribution functions <KaTeX text='F_0' /> and <KaTeX text='F_1' />, respectively.
      You can calculate the OVL-<KaTeX text='q' /> statistic <KaTeX text='\rho_{q,m,n}' /> and its <KaTeX text='p' />-value from their values.
      The null hypothesis is <KaTeX text='H_0: F_0 = F_1' /> and
      the alternative hypothesis is <KaTeX text='H_1: F_0 \neq F_1' />.
    </p>
  </div>
);

class Main extends React.Component<{}, MainState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      test: 'OVL-2',
      size: '3',
      label: ['data 0', 'data 1'],
      data: [['',''],['',''],['','']],
      pvalue: null,
      fn_pvalue: null,
      csvFile: null,
      csvHeader: true,
      csvIndex: false,
    };
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
  computeStatistic(): { has_duplicate: boolean, duplicate: boolean[][], statistic: number | null } {
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
    return { has_duplicate, duplicate, statistic }
  }
  readCSV(file: File, header: boolean, index: boolean) {
    const reader = new FileReader();
    reader.onload = event => {
      if(typeof event.target.result !== 'string') return;
      const csv = parse(event.target.result);
      const size = csv.length - +header;
      const label = this.state.label;
      if(header){
        for(let i = 0; i < 2; ++i){
          label[i] = csv[0][+index + i];
        }
      }
      const data = Array(size);
      for(let i = 0; i < size; ++i){
        data[i] = ['', ''];
        for(let j = 0; j < Math.min(csv[+header + i].length - +index, 2); ++j){
          data[i][j] = csv[+header + i][+index + j];
        }
      }
      this.setState({
        csvFile: file,
        csvHeader: header,
        csvIndex: index,
        size: size.toString(),
        label,
        data,
      });
    }
    reader.readAsText(file);
  }
  render() {
    let result = this.computeStatistic();
    return (
      <div className='main'>
        <Description />
        <UserInput
          state={this.state}
          has_duplicate={result.has_duplicate}
          duplicate={result.duplicate}
          handleSelectTest={ event => {
            switch(event.target.value){
              case 'OVL-1':
              case 'OVL-2':
                this.setState({
                  test: event.target.value,
                  pvalue: null
                });
            }
          } }
          handleSetSampleSize={ event => {
            let size = Number(event.target.value);
            if(Number.isSafeInteger(size) && size > 0){
              let old_size = this.state.data.length;
              this.state.data.length = size;
              for(let i = old_size; i < size; ++i){
                this.state.data[i] = ['', ''];
              }
              this.setState({
                size: event.target.value,
                data: this.state.data,
                pvalue: null,
              });
            }else{
              this.setState({ size: event.target.value });
              console.log('invalid sample size:', size);
            }
          } }
          handleChangeLabel={ i => event => {
            this.state.label[i] = event.target.value;
            this.setState({ label: this.state.label });
          } }
          handleChangeData={ (i, j) => event => {
            this.state.data[i][j] = event.target.value;
            this.setState({
              data: this.state.data,
              pvalue: null,
            });
          } }
          handleClear={ event => {
            for(let i = 0; i < this.state.data.length; ++i){
              for(let j = 0; j < 2; ++j){
                this.state.data[i][j] = '';
              }
            }
            this.setState({
              data: this.state.data,
              pvalue: null
            });
          } }
          handleCSVInput={ event => {
            const files = event.target.files;
            if(files.length > 0){
              this.readCSV(
                files[0],
                this.state.csvHeader,
                this.state.csvIndex,
              );
            }
          } }
          handleCSVHeader={ event => {
            let checked = event.target.checked;
            if(this.state.csvFile){
              this.readCSV(this.state.csvFile, checked, this.state.csvIndex);
            }else{
              this.setState({ csvHeader: checked })
            }
          } }
          handleCSVIndex={ event => {
            let checked = event.target.checked;
            if(this.state.csvFile){
              this.readCSV(this.state.csvFile, this.state.csvHeader, checked);
            }else{
              this.setState({ csvIndex: checked })
            }
          } }
        />
        <Result
          test={this.state.test}
          size={this.state.data.length}
          statistic={result.statistic}
          pvalue={this.state.pvalue}
          compute_pvalue={ () => {
            this.setState({
              pvalue: this.state.fn_pvalue[this.state.test](this.state.data.length, result.statistic)
            });
          } }
        />
      </div>
    )
  }
}

export { Main };