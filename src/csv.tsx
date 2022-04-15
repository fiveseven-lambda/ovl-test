import * as React from 'react';
import { parse } from 'csv-parse/sync';
import { Input, Setter, PartialSetter, CSVDelimiters, CSVDelimitersName } from './types';

type Format = [boolean, boolean];

export const CSV = ({input: [_, setInput]}: {input: PartialSetter<Input>}) => {
  const [text, setText] = React.useState<string>('');
  const [delimiter, setDelimiter] = React.useState<string>(',');
  const [format, setFormat] = React.useState<Format>([false, false]);
  const [error, setError] = React.useState<string>(null);
  const readCSV = (text: string, delimiter: string, [header, index]: Format) => {
    let csv: string[][];
    console.log(text, delimiter);
    try{
      csv = parse(text, { delimiter });
    }catch(error){
      setError(`Failed to parse CSV: ${error}`);
      return;
    }
    console.log(csv);
    if(csv.length == 0){
      setError('empty');
      return;
    }else if(csv[0].length !== +index + 2){
      setError(`Wrong format: expected ${+index + 2} columns but found ${csv[0].length}`);
      return;
    }
    const size = csv.length - +header;
    const update: Partial<Input> = {};
    update.size = size.toString();
    if(header){
      update.label = [csv[0][+index], csv[0][+index + 1]];
    }
    update.data = Array(size);
    for(let i = 0; i < size; ++i){
      update.data[i] = [csv[+header + i][+index], csv[+header + i][+index + 1]];
    }
    setError('');
    setInput(update);
  };
  return <div className='input-part'>
    <details className='csv'>
      <summary>CSV / Excel</summary>
      <div className='csv-details'>
        <CSVInput
          text={text}
          handleChangeText={ (text: string) => {
            setText(text);
            readCSV(text, delimiter, format);
          } }
        />
        <Delimiter
          value={delimiter}
          onChange={ event => {
            const delimiter = event.target.value;
            setDelimiter(delimiter);
            readCSV(text, delimiter, format);
          } }
        />
        <Format
          format={ [format, format => {
            setFormat(format);
            readCSV(text, delimiter, format);
          }] }
        />
        { error === null ? null : <p className='error'>{error}</p> }
      </div>
    </details>
  </div>
}

const CSVInput = ({text, handleChangeText}: {text: string, handleChangeText(_: string): void}) => {
  return <div id='csv-input'>
    <TextArea text={text} handleChangeText={handleChangeText}/>
    <ReadFile handleChangeText={handleChangeText}/>
  </div>
}

const TextArea = ({text, handleChangeText}: {text: string, handleChangeText(_: string): void}) => <div className='input-part'>
  <textarea
    id='csv-textarea'
    placeholder='Paste here, or select a file'
    value={text}
    onChange={ event => handleChangeText(event.target.value) }
  />
</div>

const ReadFile = ({handleChangeText}: {handleChangeText(_: string): void}) => {
  const readFile = (file: File, encoding: string) => {
    const reader = new FileReader();
    reader.onload = event => {
      if(typeof event.target.result === 'string'){
        handleChangeText(event.target.result);
      }
    }
    reader.readAsText(file, encoding);
  };
  const [file, setFile] = React.useState<File>(null);
  const [encoding, setEncoding] = React.useState<string>('UTF-8');
  return <div>
    <SelectFile readFile={readFile} setFile={setFile} encoding={encoding}/>
    <Encoding readFile={readFile} file={file} setEncoding={setEncoding}/>
  </div>
}

const SelectFile = ({
  readFile,
  setFile,
  encoding
}: {
  readFile(file: File, encoding: string): void,
  setFile(file: File): void,
  encoding: string
}) => <div className='input-part'>
  File: <input type='file' onChange={ event => {
    const files = event.target.files;
    if(files.length > 0){
      readFile(files[0], encoding);
      setFile(files[0]);
    }
  } }/>
</div>

const Encoding = ({
  readFile,
  file,
  setEncoding
}: {
  readFile(file: File, encoding: string): void,
  file: File,
  setEncoding(encoding: string): void,
}) => <div className='input-part'>
  Encoding: <select onChange={ event => {
    const encoding = event.target.value;
    if(file !== null) readFile(file, encoding);
    setEncoding(encoding);
  } }>
    { encodings.map((encoding, i) => <option key={i}>{encoding}</option>) }
  </select>
</div>

const Delimiter = ({
  value,
  onChange
}: {
  value: string,
  onChange: React.ChangeEventHandler<HTMLSelectElement>
}) => <div className='input-part'>
  Delimiter: <select value={value} onChange={onChange}>
    { CSVDelimiters.map((delimiter, i) => <option key={i} value={delimiter}>{`${delimiter} (${CSVDelimitersName[delimiter]})`}</option>) }
  </select>
</div>

const Format = ({ format }: { format: Setter<Format> }) => <div className='input-part'>
  <table>
    <tbody>
      <FormatOption
        format={format}
        value={[false, false]}
        label='data only'
        sample={'10,20\n30,40\n50,60\n ︙'}
      />
      <FormatOption
        format={format}
        value={[true, false]}
        label='with header row'
        sample={'data 0,data 1\n10,20\n30,40\n50,60\n ︙'}
      />
      <FormatOption
        format={format}
        value={[false, true]}
        label='with index column'
        sample={'1,10,20\n2,30,40\n3,50,60\n ︙'}
      />
      <FormatOption
        format={format}
        value={[true, true]}
        label='with header row and index column'
        sample={',data 0,data 1\n1,10,20\n2,30,40\n3,50,60\n ︙'}
      />
    </tbody>
  </table>
</div>

const FormatOption = ({
  format: [format, setFormat],
  value,
  label,
  sample
}: {
  format: Setter<Format>
  value: Format,
  label: string,
  sample: string,
}) => <tr>
  <td><pre className='csv-sample'>{sample}</pre></td>
  <td>
    <input
      type='radio'
      name='csv-format'
      checked={ format.every((x, i) => x === value[i]) }
      onChange={ _ => setFormat(value) }
    ></input>
    <label>{label}</label>
  </td>
</tr>

const encodings = [
  'UTF-8',
  'IBM866',
  'ISO-8859-2',
  'ISO-8859-3',
  'ISO-8859-4',
  'ISO-8859-5',
  'ISO-8859-6',
  'ISO-8859-7',
  'ISO-8859-8',
  'ISO-8859-8i',
  'ISO-8859-10',
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
  'windows-1252',
  'windows-1253',
  'windows-1254',
  'windows-1255',
  'windows-1256',
  'windows-1257',
  'windows-1258',
  'x-mac-cyrillic',
  'GBK',
  'GB18030',
  'HZ-GB-2312',
  'Big5',
  'EUC-JP',
  'ISO-2022-JP',
  'Shift_JIS',
  'EUC-KR',
  'ISO-2022-KR',
  'UTF-16BE',
  'UTF-16LE'
];