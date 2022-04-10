import * as React from 'react';
import { parse } from 'csv-parse/sync';

import { tests, WidthSwitch, Input, Setter, PartialSetter, UserInputProps } from './types';

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

const CSV = ({input: [_, setInput]}: {input: PartialSetter<Input>}) => {
  const [file, setFile] = React.useState<File>(null);
  const [format, setFormat] = React.useState<[boolean, boolean]>([false, false]);
  const readCSV = (file: File, [header, index]: [boolean, boolean], setInput: (_: Partial<Input>) => void) => {
    const reader = new FileReader();
    reader.onload = event => {
      if(typeof event.target.result !== 'string') return;
      const csv = parse(event.target.result);
      const size = csv.length - +header;
      const update: Partial<Input> = {};
      update.size = size.toString();
      if(header){
        update.label = [csv[0][+index], csv[0][+index + 1]];
      }
      update.data = Array(size);
      for(let i = 0; i < size; ++i){
        update.data[i] = ['', ''];
        for(let j = 0; j < Math.min(csv[+header + i].length - +index, 2); ++j){
          update.data[i][j] = csv[+header + i][+index + j];
        }
      }
      setInput(update);
    };
    reader.readAsText(file);
  };
  const formatSetter: Setter<[boolean, boolean]> = [format, format => {
    if(file !== null) readCSV(file, format, setInput);
    setFormat(format);
  }]
  return <div className='input-part'>
    <details className='csv'>
      <summary>import csv</summary>
      <div className='csv-details'>
        <div>
          file: <input
            type='file'
            onChange={ event => {
              const files = event.target.files;
              if(files.length > 0){
                readCSV(files[0], format, setInput);
                setFile(files[0]);
              }
            } }
          />
        </div>
        <table>
          <tbody>
            <SelectCSVFormat
              format={formatSetter}
              value={[false, false]}
              label='data only'
              sample={'10,20\n30,40\n50,60\n ︙'}
            />
            <SelectCSVFormat
              format={formatSetter}
              value={[true, false]}
              label='with header row'
              sample={'data 0,data 1\n10,20\n30,40\n50,60\n ︙'}
            />
            <SelectCSVFormat
              format={formatSetter}
              value={[false, true]}
              label='with index column'
              sample={'1,10,20\n2,30,40\n3,50,60\n ︙'}
            />
            <SelectCSVFormat
              format={formatSetter}
              value={[true, true]}
              label='with header row and index column'
              sample={',data 0,data 1\n1,10,20\n2,30,40\n3,50,60\n ︙'}
            />
          </tbody>
        </table>
      </div>
    </details>
  </div>
}

const SelectCSVFormat = ({
  format: [format, setFormat],
  value,
  label,
  sample,
}: {
  format: Setter<[boolean, boolean]>,
  value: [boolean, boolean],
  label: string,
  sample: string,
}) => <tr>
  <td>
    <pre className='csv-sample'>{sample}</pre>
  </td>
  <td>
    <input
      type='radio'
      name='csv-format'
      checked={ format.every((x, i) => x === value[i]) }
      onChange={ _ => setFormat(value) }
    />
    <label>{label}</label>
  </td>
</tr>

const Data = ({widthSwitch, input: [input, setInput], duplicate}: {widthSwitch: WidthSwitch, input: PartialSetter<Input>, duplicate: [boolean, boolean][]}) => {
  const [oldDuplicate, setOldDuplicate] = React.useState<[boolean, boolean][]>(null);
  if(oldDuplicate !== null) duplicate = oldDuplicate;
  return <div className={`input-part data ${widthSwitch}`}>
    <table>
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
              className={duplicate[i] && duplicate[i][j] ? 'duplicate-cell' : ''}
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
    </table>
  </div>
}