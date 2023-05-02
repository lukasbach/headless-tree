import {
  CustomHotkeysConfig,
  ItemInstance,
  TreeInstance,
} from "../../types/core";

export interface HotkeyConfig<T> {
  hotkey: string;
  canRepeat?: boolean;
  allowWhenInputFocused?: boolean;
  isEnabled?: () => boolean;
  preventDefault?: boolean;
  handler: (e: KeyboardEvent, tree: TreeInstance<T>) => void;
}

export type HotkeysCoreFeatureDef<T> = {
  state: {};
  config: {
    hotkeys?: CustomHotkeysConfig<T>;
    onTreeHotkey?: (name: string, element: HTMLElement) => void;
    onItemHotkey?: (
      name: string,
      item: ItemInstance<T>,
      element: HTMLElement
    ) => void;
  };
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};
