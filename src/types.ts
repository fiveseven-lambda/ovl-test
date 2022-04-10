export type WidthSwitch = 'wide' | 'narrow';

export const tests = ['OVL-1', 'OVL-2'] as const;
export type Test = typeof tests[number];

export type PartialSetter<T> = [T, (_: Partial<T>) => void];
export type Setter<T> = [T, (_: T) => void];

export type Input = {
  test: Test,
  size: string,
  label: [string, string],
  data: [string, string][],
};

export type Results = {
  duplicate: [boolean, [boolean, boolean][]],
  statistic: number,
}

export type ResultProps = {
  input: Input,
  results: Results,
  pValue: Setter<PValue>,
  pkg: Pkg,
  widthSwitch: WidthSwitch,
}

export type PValue = {
  approx: number;
  precise: [string, string]
}

export type UserInputProps = {
  widthSwitch: WidthSwitch,
  input: PartialSetter<Input>,
  duplicate: [boolean, [boolean, boolean][]],
}

export type Pkg = {
  fn: {[key in Test]: (n: number, k: number) => Promise<string>}
}