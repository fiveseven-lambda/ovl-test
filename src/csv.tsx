import * as React from 'react';
import { parse } from 'csv-parse/sync';
import { Input, Setter, PartialSetter, CSVDelimiter, CSVDelimiters, CSVDelimitersName } from './types';

export const CSV = ({input: [_, setInput]}: {input: PartialSetter<Input>}) => {
  const [file, setFile] = React.useState<File>(null);
  const [format, setFormat] = React.useState<[boolean, boolean]>([false, false]);
  const [delimiter, setDelimiter] = React.useState<CSVDelimiter>(',');
  const readCSV = (file: File, [header, index]: [boolean, boolean], encoding: string, delimiter: CSVDelimiter, setInput: (_: Partial<Input>) => void) => {
    const reader = new FileReader();
    reader.onload = event => {
      if(typeof event.target.result !== 'string') return;
      let csv;
      try{
        csv = parse(event.target.result, { delimiter });
      }catch(error){
        alert(`Failed to parse CSV file. ${error}`);
        return;
      }
      if(csv.length == 0){
        alert('empty file specified');
        return;
      }else if(csv[0].length !== +index + 2){
        alert(`CSV format error: expected ${+index + 2} columns but found ${csv[0].length}`);
        return;
      }
      const size = csv.length - +header;
      if(size === 0) return true;
      const update: Partial<Input> = {};
      update.size = size.toString();
      if(header){
        update.label = [csv[0][+index], csv[0][+index + 1]];
      }
      update.data = Array(size);
      for(let i = 0; i < size; ++i){
        update.data[i] = [csv[+header + i][+index], csv[+header + i][+index + 1]];
      }
      setInput(update);
    };
    reader.readAsText(file, encoding);
  };
  const formatSetter: Setter<[boolean, boolean]> = [format, format => {
    if(file !== null) readCSV(file, format, encoding, delimiter, setInput);
    setFormat(format);
  }]
  const encodings = [
    'UTF-8',
    '866',
    'latin2',
    'latin3',
    'latin4',
    'cyrillic',
    'arabic',
    'greek',
    'hebrew',
    'logical',
    'latin6',
    'ISO-8859-13',
    'ISO-8859-14',
    'ISO-8859-15',
    'ISO-8859-16',
    'KOI8-R',
    'KOI8-U',
    'macintosh',
    'windows-874',
    'windows-1250',
    'windows-1251',
    'latin1',
    'windows-1253',
    'latin5',
    'windows-1255',
    'windows-1256',
    'windows-1257',
    'windows-1258',
    'x-mac-cyrillic',
    'GBK',
    'gb18030',
    'Big5',
    'EUC-JP',
    'ISO-2022-JP',
    'Shift_JIS',
    'EUC-KR',
    'iso-2022-cn',
    'UTF-16BE',
    'UTF-16',
  ];
  const [encoding, setEncoding] = React.useState<string>('UTF-8');
  return <div className='input-part'>
    <details className='csv'>
      <summary>import csv</summary>
      <div className='csv-details'>
        <div className='input-part'>
          file: <input
            type='file'
            onChange={ event => {
              const files = event.target.files;
              if(files.length > 0){
                readCSV(files[0], format, encoding, delimiter, setInput);
                setFile(files[0]);
              }
            } }
          />
        </div>
        <div className='input-part'>
          encoding: <select
            onChange={ event => {
              const encoding = event.target.value;
              if(file !== null) readCSV(file, format, encoding, delimiter, setInput);
              setEncoding(encoding);
            }}
            value={encoding}
          >
            {encodings.map((encoding, i) => <option key={i}>{encoding}</option>)}
          </select>
        </div>
        <div className='input-part'>
          delimiter: <select
            onChange={ event => {
              let delimiter: CSVDelimiter = null;
              for(const d of CSVDelimiters){
                if(event.target.value === d){
                  delimiter = d;
                }
              }
              if(delimiter !== null){
                if(file !== null) readCSV(file, format, encoding, delimiter, setInput);
                setDelimiter(delimiter);
              }
            }}
            value={delimiter}
          >
            { CSVDelimiters.map((delimiter, i) => <option key={i} value={delimiter}>{delimiter} ({CSVDelimitersName[delimiter]})</option>) }
          </select>
        </div>
        <table>
          <tbody>
            <SelectCSVFormat
              format={formatSetter}
              value={[false, false]}
              label='data only'
              sample={'10,20\n30,40\n50,60\n ︙'.replace(/,/g, delimiter)}
            />
            <SelectCSVFormat
              format={formatSetter}
              value={[true, false]}
              label='with header row'
              sample={'data 0,data 1\n10,20\n30,40\n50,60\n ︙'.replace(/,/g, delimiter)}
            />
            <SelectCSVFormat
              format={formatSetter}
              value={[false, true]}
              label='with index column'
              sample={'1,10,20\n2,30,40\n3,50,60\n ︙'.replace(/,/g, delimiter)}
            />
            <SelectCSVFormat
              format={formatSetter}
              value={[true, true]}
              label='with header row and index column'
              sample={',data 0,data 1\n1,10,20\n2,30,40\n3,50,60\n ︙'.replace(/,/g, delimiter)}
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
