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
  handleClear: React.MouseEventHandler<HTMLInputElement>;
  handleCSVInput: React.ChangeEventHandler<HTMLInputElement>;
  handleCSVHeader: React.ChangeEventHandler<HTMLInputElement>;
  handleCSVIndex: React.ChangeEventHandler<HTMLInputElement>;
}

export type ResultProps = {
  test: Test,
  size: number;
  statistic: number | null;
  compute_pvalue: (event: React.MouseEvent<HTMLInputElement>) => void;
  pvalue: number | null;
};

export type MainState = {
  test: Test;
  size: string;
  data: string[][];
  label: string[];
  csvFile: File | null;
  csvHeader: boolean;
  csvIndex: boolean;
  pvalue: number | null;
  fn_pvalue: {[key in Test]: (n: number, k: number) => number} | null;
};
