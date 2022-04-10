import * as React from 'react';
import { parse } from 'csv-parse/sync';
import { Input, Setter, PartialSetter } from './types';

export const CSV = ({input: [_, setInput]}: {input: PartialSetter<Input>}) => {
  const [file, setFile] = React.useState<File>(null);
  const [format, setFormat] = React.useState<[boolean, boolean]>([false, false]);
  const readCSV = (file: File, [header, index]: [boolean, boolean], encoding: string, setInput: (_: Partial<Input>) => void) => {
    const reader = new FileReader();
    reader.onload = event => {
      if((() => {
        if(typeof event.target.result !== 'string') return;
        const csv = parse(event.target.result);
        const size = csv.length - +header;
        if(size === 0) return true;
        const update: Partial<Input> = {};
        update.size = size.toString();
        if(header){
          if(csv[0].length - +index !== 2) return true;
          update.label = [csv[0][+index], csv[0][+index + 1]];
        }
        update.data = Array(size);
        for(let i = 0; i < size; ++i){
          if(csv[+header + i].length - +index !== 2) return true;
          update.data[i] = [csv[+header + i][+index], csv[+header + i][+index + 1]];
        }
        setInput(update);
        return false;
      })()){
        alert('invalid csv file. check format and encoding again');
      }
    };
    reader.readAsText(file, encoding);
  };
  const formatSetter: Setter<[boolean, boolean]> = [format, format => {
    if(file !== null) readCSV(file, format, encoding, setInput);
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
                readCSV(files[0], format, encoding, setInput);
                setFile(files[0]);
              }
            } }
          />
        </div>
        <div className='input-part'>
          encoding: <select
            onChange={ event => {
              const encoding = event.target.value;
              if(file !== null) readCSV(file, format, encoding, setInput);
              setEncoding(encoding);
            }}
            value={encoding}
          >
            {encodings.map((encoding, i) => <option key={i}>{encoding}</option>)}
          </select>
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
