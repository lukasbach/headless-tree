type SimplifiedMeta = {
  argTypes: Record<string | number | symbol, { type: string | undefined }>;
};
type ResolveType<
  M extends SimplifiedMeta,
  T extends string | number | symbol,
> = M["argTypes"][T]["type"] extends "number"
  ? number
  : M["argTypes"][T]["type"] extends "boolean"
    ? boolean
    : M["argTypes"][T]["type"] extends "string"
      ? string
      : any;
type RetrieveArgType<M extends SimplifiedMeta> = keyof M["argTypes"];
export type PropsOfArgtype<M extends SimplifiedMeta> = {
  [K in RetrieveArgType<M>]: ResolveType<M, K>;
};
