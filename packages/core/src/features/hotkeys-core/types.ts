import { ItemInstance, TreeInstance } from "../../types/core";

interface HotkeyConfig {
  name: string;
  hotkey: string;
  canRepeat?: boolean;
  allowWhenInputFocused?: boolean;
  isEnabled?: () => boolean;
  preventDefault?: boolean;
}

export interface TreeHotkeyConfig<T> extends HotkeyConfig {
  handler: (e: KeyboardEvent, tree: TreeInstance<T>) => void;
}

export interface ItemHotkeyConfig<T> extends HotkeyConfig {
  handler: (
    e: KeyboardEvent,
    item: ItemInstance<T>,
    tree: TreeInstance<T>
  ) => void;
}

export type HotkeysCoreFeatureDef<T> = {
  state: {};
  config: {
    hotkeyOverwrites: Record<string, string>;
    onTreeHotkey?: (name: string, element: HTMLElement) => void;
    onItemHotkey?: (
      name: string,
      item: ItemInstance<T>,
      element: HTMLElement
    ) => void;
  };
  treeInstance: {
    registerHotkey: (config: TreeHotkeyConfig<T>) => void;
    unregisterHotkey: (name: string) => void;
  };
  itemInstance: {
    registerHotkey: (config: ItemHotkeyConfig<T>) => void;
    unregisterHotkey: (name: string) => void;
  };
};
