import { FeatureImplementation, HotkeysConfig } from "../../types/core";
import { HotkeysCoreFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";

type TreeDataRef = {
  keydownHandler?: (e: KeyboardEvent) => void;
  keyupHandler?: (e: KeyboardEvent) => void;
  pressedKeys: Set<string>;
};

const findHotkeyMatch = (
  pressedKeys: Set<string>,
  config1: HotkeysConfig<any, any>,
  config2: HotkeysConfig<any, any>
) =>
  Object.entries({ ...config1, ...config2 }).find(([, { hotkey }]) =>
    hotkey.split("+").every((key) => pressedKeys.has(key))
  )?.[0];

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

      const hotkeyName = findHotkeyMatch(
        data.current.pressedKeys,
        tree.getHotkeyPresets(),
        tree.getConfig().hotkeys as HotkeysConfig<any>
      );

      if (!hotkeyName) return;

      const hotkeyConfig = {
        ...tree.getHotkeyPresets()[hotkeyName],
        ...tree.getConfig().hotkeys?.[hotkeyName],
      };

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
};
