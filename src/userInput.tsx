import * as React from 'react';
import {tests, UserInputProps} from './types';

export class UserInput extends React.Component<UserInputProps> {
  render() {
    return (
      <div className='part user-input'>
        <h2>Data Input</h2>
        <p>
          test:
          <select
            className='input'
            onChange={ this.props.handleSelectTest }
            value={ this.props.state.test }
          >
            { tests.map(test => <option key={test}>{test}</option>) }
          </select>
        </p>
        <p>
          sample size:
          <input
            type='number'
            min='1'
            className='input'
            onChange={ this.props.handleSetSampleSize }
            value={this.props.state.size}
          />
        </p>
        <button onClick={ this.props.handleClear }>
          clear all cells
        </button>
        <details>
          <summary>import csv</summary>
          <p>file: <input type='file' onChange={ this.props.handleCSVInput } /></p>
          <p>
            <input
              type='checkbox'
              onChange={ this.props.handleCSVHeader }
              checked={ this.props.state.csvHeader }
            />
            <label>header row</label>
            <input
              type='checkbox'
              onChange={ this.props.handleCSVIndex }
              checked={ this.props.state.csvIndex }
            />
            <label>index column</label>
          </p>
          <p>
            sample format:
          </p>
          <pre className='csv-sample'>
            { (() => {
              if(this.props.state.csvHeader){
                if(this.props.state.csvIndex){
return `,foo,bar
1,85,27
2,35,91`
                }else{
return `foo,bar
85,27
35,91`
                }
              }else{
                if(this.props.state.csvIndex){
return `1,85,27
2,35,91`
                }else{
return `85,27
35,91`
                }
              }
            })() }
          </pre>
        </details>
        <p className={ this.props.has_duplicate ? 'duplicate' : 'none' }>
          Data must not have duplicates.
        </p>
        <table className='data'>
          <thead>
            <tr>
              <th />
              { this.props.state.label.map((label, i) => <th key={i}>
                <input
                  type='text'
                  onChange={this.props.handleChangeLabel(i)}
                  value={this.props.state.label[i]}
                />
              </th>) }
            </tr>
          </thead>
          <tbody>
            { this.props.state.data.map((row, i) => <tr key={i}>
              <td>{i + 1}</td>
              { row.map((cell, j) => <td key={j}>
                <input
                  type='text'
                  onChange={this.props.handleChangeData(i, j)}
                  className={ this.props.duplicate[i][j] ? 'duplicate-cell' : '' }
                  value={this.props.state.data[i][j]}
                />
              </td>) }
            </tr>) }
          </tbody>
        </table>
      </div>
    );
  }
}