export const tests = ['OVL-1', 'OVL-2'] as const;
export type Test = typeof tests[number];

export type UserInputProps = {
  state: MainState,
  has_duplicate: boolean,
  duplicate: boolean[][],
  handleSelectTest: React.ChangeEventHandler<HTMLSelectElement>;
  handleSetSampleSize: React.ChangeEventHandler<HTMLInputElement>;
  handleChangeLabel: (i: number) => React.ChangeEventHandler<HTMLInputElement>;
  handleChangeData: (i: number, j: number) => React.ChangeEventHandler<HTMLInputElement>;
  handleBlurData: React.FocusEventHandler<HTMLInputElement>;
  handleClear: React.MouseEventHandler<HTMLInputElement>;
  handleCSVInput: React.ChangeEventHandler<HTMLInputElement>;
  handleCSVHeader: React.ChangeEventHandler<HTMLInputElement>;
  handleCSVIndex: React.ChangeEventHandler<HTMLInputElement>;
}

type HistoryItem = {
  date: Date;
  label: string[];
  test: Test;
  size: number;
  statistic: number;
  pvalue: number;
};

export type ResultProps = {
  test: Test,
  size: number;
  statistic: number | null;
  compute_pvalue: (event: React.MouseEvent<HTMLInputElement>) => void;
  pvalue: PValue | null;
  history: HistoryItem[];
};

export type ResultState = {
  showPrecise: boolean;
}

type PValue = {
  pvalue: number;
  numer: string;
  denom: string;
}

export type MainState = {
  entering: [number, number] | null;
  test: Test;
  size: string;
  data: string[][];
  label: string[];
  csvFile: File | null;
  csvHeader: boolean;
  csvIndex: boolean;
  pvalue: PValue | null;
  fn_pvalue: {[key in Test]: (n: number, k: number) => Promise<string>} | null;
  history: HistoryItem[];
};
