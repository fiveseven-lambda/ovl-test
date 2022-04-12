const unicode = require('unicode-properties/unicode-properties.cjs');

export function parseUniFloat(s: string, decimalSeparator: string): number {
  let tmp: string = '';
  let isInteger = true;
  for(const c of s){
    const codePoint = c.codePointAt(0);
    if(unicode.isDigit(codePoint)){
      tmp += unicode.getNumericValue(codePoint);
    }else if(c === decimalSeparator){
      tmp += '.';
      isInteger = false;
    }else{
      if(isInteger){
        switch(c){
          case ' ':
          case ',':
          case '.':
          case ' ':
          case '_':
          case '\'':
            continue;
        }
      }
      tmp += c;
    }
  }
  return Number.parseFloat(tmp);
}