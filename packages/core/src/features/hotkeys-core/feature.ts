import { FeatureImplementation } from "../../types/core";
import {
  HotkeysCoreFeatureDef,
  ItemHotkeyConfig,
  TreeHotkeyConfig,
} from "./types";
import { MainFeatureDef } from "../main/types";

type ItemDataRef = {
  hotkeys: Record<string, ItemHotkeyConfig<any>>;
};
type TreeDataRef = {
  hotkeys: Record<string, TreeHotkeyConfig<any>>;
  keydownHandler?: (e: KeyboardEvent) => void;
  keyupHandler?: (e: KeyboardEvent) => void;
  pressedKeys: Set<string>;
};

export const hotkeysCoreFeature: FeatureImplementation<
  any,
  HotkeysCoreFeatureDef<any>,
  MainFeatureDef | HotkeysCoreFeatureDef<any>
> = {
  key: "hotkeys-core",
  dependingFeatures: ["main", "tree"],

  onTreeMount: (tree, element) => {
    const data = tree.getDataRef<TreeDataRef>();
    const keydown = (e: KeyboardEvent) => {
      data.current.pressedKeys ??= new Set();
      const newMatch = !data.current.pressedKeys.has(e.key);
      data.current.pressedKeys.add(e.key);

      const hotkeyConfig = Object.values(data.current.hotkeys).find(
        ({ hotkey }) =>
          hotkey.split("+").every((key) => data.current.pressedKeys.has(key))
      );

      if (!hotkeyConfig) return;
      if (hotkeyConfig.isEnabled && !hotkeyConfig.isEnabled()) return;
      if (
        !hotkeyConfig.allowWhenInputFocused &&
        e.target instanceof HTMLInputElement
      )
        return;
      if (!hotkeyConfig.canRepeat && !newMatch) return;
      if (hotkeyConfig.preventDefault) e.preventDefault();
      hotkeyConfig.handler(e, tree as any);
    };

    const keyup = (e: KeyboardEvent) => {
      data.current.pressedKeys ??= new Set();
      data.current.pressedKeys.delete(e.key);
    };

    element.addEventListener("keydown", keydown);
    element.addEventListener("keyup", keyup);
    data.current.keydownHandler = keydown;
    data.current.keyupHandler = keyup;
  },
  onTreeUnmount: (tree, element) => {
    const data = tree.getDataRef<TreeDataRef>();
    if (data.current.keyupHandler) {
      element.removeEventListener("keyup", data.current.keyupHandler);
      delete data.current.keyupHandler;
    }
    if (data.current.keydownHandler) {
      element.removeEventListener("keydown", data.current.keydownHandler);
      delete data.current.keydownHandler;
    }
  },

  // onItemMount: (item, element) => {},
  // onItemUnmount: (item, element) => {},

  createTreeInstance: (prev, instance) => ({
    ...prev,
    registerHotkey: (config) => {
      instance.getDataRef<TreeDataRef>().current.hotkeys ??= {};
      instance.getDataRef<TreeDataRef>().current.hotkeys[config.name] = config;
    },
    unregisterHotkey: (name) => {
      delete instance.getDataRef<TreeDataRef>().current.hotkeys?.[name];
    },
  }),
};
