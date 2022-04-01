import * as React from 'react';
import * as katex from 'katex';

export const KaTeX = (props: {text: string}) => (
  <span dangerouslySetInnerHTML={{
    __html: katex.renderToString(props.text)
  }}></span>
);