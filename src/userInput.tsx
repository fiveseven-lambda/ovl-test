import * as React from 'react';
import {tests, UserInputProps} from './types';

export const UserInput = (props: UserInputProps) => (
  <div className='part user-input'>
    <h2>Data Input</h2>
    <p>
      test:
      <select
        className='input'
        onChange={ props.handleSelectTest }
        value={ props.state.test }
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
        onChange={ props.handleSetSampleSize }
        value={ props.state.size }
      />
    </p>
    <button onClick={ props.handleClear }>
      clear all cells
    </button>
    <details>
      <summary>import csv</summary>
      <p>file: <input type='file' onChange={ props.handleCSVInput } /></p>
      <p>
        <input
          type='checkbox'
          onChange={ props.handleCSVHeader }
          checked={ props.state.csvHeader }
        />
        <label>header row</label>
        <input
          type='checkbox'
          onChange={ props.handleCSVIndex }
          checked={ props.state.csvIndex }
        />
        <label>index column</label>
      </p>
      <div className='csv-sample'>
        <p>
          sample:
        </p>
        <pre>
          { (() => {
            if(props.state.csvHeader){
              if(props.state.csvIndex){
return `,foo,bar
1,85,27
2,35,91`
            }else{
return `foo,bar
85,27
35,91`
            }
          }else{
            if(props.state.csvIndex){
return `1,85,27
2,35,91`
            }else{
return `85,27
35,91`
              }
            }
          })() }
        </pre>
      </div>
    </details>
    <p className={ props.has_duplicate ? 'duplicate' : 'none' }>
      Data must not have duplicates.
    </p>
    <table className='data'>
      <thead>
        <tr>
          <th />
          { props.state.label.map((label, i) => <th key={i}>
            <input
              type='text'
              onChange={props.handleChangeLabel(i)}
              value={props.state.label[i]}
            />
          </th>) }
        </tr>
      </thead>
      <tbody>
        { props.state.data.map((row, i) => <tr key={i}>
          <td>{i + 1}</td>
          { row.map((cell, j) => <td key={j}>
            <input
              type='text'
              onChange={props.handleChangeData(i, j)}
              onBlur={props.handleBlurData}
              className={ props.duplicate[i][j] ? 'duplicate-cell' : '' }
              value={props.state.data[i][j]}
            />
          </td>) }
        </tr>) }
      </tbody>
    </table>
  </div>
);