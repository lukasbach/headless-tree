type TAllKeys<T> = T extends any ? keyof T : never;

type TIndexValue<T, K extends PropertyKey, D = never> = T extends any
  ? K extends keyof T
    ? T[K]
    : D
  : never;

type TPartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

type TFunction = (...a: any[]) => any;

type TPrimitives =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | Date
  | TFunction;

export type TMerged<T> = [T] extends [Array<any>]
  ? { [K in keyof T]: TMerged<T[K]> }
  : [T] extends [TPrimitives]
    ? T
    : [T] extends [object]
      ? TPartialKeys<{ [K in TAllKeys<T>]: TMerged<TIndexValue<T, K>> }, never>
      : T;
