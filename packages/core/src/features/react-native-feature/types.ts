import { CustomHotkeysConfig } from "../../types/core";

export type ReactNativeFeatureDef<T> = {
  state: {};
  config: {
    hotkeys?: CustomHotkeysConfig<T>;
    onTreeHotkey?: (name: string, e: KeyboardEvent) => void;
    ignoreHotkeysOnInputs?: boolean;
  };
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};
