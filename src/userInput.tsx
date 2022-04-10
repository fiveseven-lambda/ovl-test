import * as React from 'react';

import { tests, WidthSwitch, Input, PartialSetter, UserInputProps } from './types';
import { CSV } from './csv';

export const UserInput = ({widthSwitch, input, duplicate}: UserInputProps) => <div className={`part ${widthSwitch}`}>
  <h2>Input</h2>
  <SelectTest input={input}/>
  <SampleSize input={input}/>
  <Clear input={input}/>
  <CSV input={input}/>
  <Data widthSwitch={widthSwitch} input={input} duplicate={duplicate}/>
</div>

const SelectTest = ({input: [input, setInput]}: { input: PartialSetter<Input> }) => <div className='input-part'>
  test: <select
    onChange={ event => {
      for(const test of tests) if(event.target.value === test) setInput({ test });
    } }
    value={ input.test }
  >
    { tests.map((test, i) => <option key={i}>{test}</option>) }
  </select>
</div>

const SampleSize = ({input: [input, setInput]}: { input: PartialSetter<Input> }) => {
  const [focused, setFocused] = React.useState(false);
  const setSize = (s: string, data: string[][]) => {
    const new_size = Number(s);
    if(Number.isSafeInteger(new_size) && new_size > 0){
      const old_size = data.length;
      data.length = new_size;
      for(let i = old_size; i < new_size; ++i) data[i] = ['', ''];
    }else{
      alert('invalid sample size');
    }
  };
  return <div className='input-part'>
    sample size: <input
      type='number'
      min='1'
      value={input.size}
      onFocus={ _ => setFocused(true) }
      onBlur={ event => {
        const data = input.data;
        setSize(event.target.value, data);
        setInput({ data });
        setFocused(false);
      } }
      onInput={ event => {
        const size = event.currentTarget.value;
        const data = input.data;
        if(!focused) setSize(size, data);
        setInput({ size: event.currentTarget.value })
      } }
    />
  </div>
}

const Clear = ({input: [input, setInput]}: {input: PartialSetter<Input>}) => <div className='input-part'>
  <button
    onClick={ _ => setInput({ data: input.data.map(_ => ['', '']) }) }
  > clear all cells </button>
</div>

const Data = ({widthSwitch, input: [input, setInput], duplicate}: {widthSwitch: WidthSwitch, input: PartialSetter<Input>, duplicate: [boolean, [boolean, boolean][]]}) => {
  const [oldDuplicate, setOldDuplicate] = React.useState<[boolean, [boolean, boolean][]]>(null);
  if(oldDuplicate !== null) duplicate = oldDuplicate;
  const [has_duplicate, duplicates] = duplicate;
  let elements: React.ReactElement[] = [];
  if(has_duplicate){
    elements.push(
      <p key='duplicate' className='duplicate'>Data must not have duplicates.</p>
    );
  }
  elements.push(
    <table key='table'>
      <thead>
        <tr>
          <th/>
          { input.label.map((cell, i) => <th key={i}>
            <input
              type='text'
              value={cell}
              onChange={ event => {
                const label = input.label;
                label[i] = event.target.value;
                setInput({ label });
              } }
            />
          </th>) }
        </tr>
      </thead>
      <tbody>
        { input.data.map((row, i) => <tr key={i}>
          <td> {i + 1} </td>
          { row.map((cell, j) => <td key={j}>
            <input
              type='text'
              className={duplicates[i] && duplicates[i][j] ? 'duplicate-cell' : ''}
              value={cell}
              onFocus={ _ => setOldDuplicate(duplicate) }
              onBlur={ _ => setOldDuplicate(null) }
              onChange={ event => {
                const data = input.data;
                data[i][j] = event.target.value;
                setInput({ data });
              } }
            />
          </td>) }
        </tr>) }
      </tbody>
    </table>);
  return <div className={`input-part data ${widthSwitch}`}>{elements}</div>
}