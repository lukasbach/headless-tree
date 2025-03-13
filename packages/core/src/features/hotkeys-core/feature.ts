import {
  FeatureImplementation,
  HotkeysConfig,
  TreeInstance,
} from "../../types/core";
import { HotkeyConfig, HotkeysCoreDataRef } from "./types";

const specialKeys: Record<string, RegExp> = {
  Letter: /^[a-z]$/,
  LetterOrNumber: /^[a-z0-9]$/,
  Plus: /^\+$/,
  Space: /^ $/,
};

const testHotkeyMatch = (
  pressedKeys: Set<string>,
  tree: TreeInstance<any>,
  hotkey: HotkeyConfig<any>,
) => {
  const supposedKeys = hotkey.hotkey.split("+");
  const doKeysMatch = supposedKeys.every((key) =>
    key in specialKeys
      ? [...pressedKeys].some((pressedKey) => specialKeys[key].test(pressedKey))
      : pressedKeys.has(key),
  );
  const isEnabled = !hotkey.isEnabled || hotkey.isEnabled(tree);
  const equalCounts = pressedKeys.size === supposedKeys.length;
  return doKeysMatch && isEnabled && equalCounts;
};

const findHotkeyMatch = (
  pressedKeys: Set<string>,
  tree: TreeInstance<any>,
  config1: HotkeysConfig<any>,
  config2: HotkeysConfig<any>,
) => {
  return Object.entries({ ...config1, ...config2 }).find(([, hotkey]) =>
    testHotkeyMatch(pressedKeys, tree, hotkey),
  )?.[0] as keyof HotkeysConfig<any> | undefined;
};

export const hotkeysCoreFeature: FeatureImplementation = {
  key: "hotkeys-core",

  onTreeMount: (tree, element) => {
    const data = tree.getDataRef<HotkeysCoreDataRef>();
    const keydown = (e: KeyboardEvent) => {
      data.current.pressedKeys ??= new Set();
      const newMatch = !data.current.pressedKeys.has(e.key);
      data.current.pressedKeys.add(e.key);

      const hotkeyName = findHotkeyMatch(
        data.current.pressedKeys,
        tree as any,
        tree.getHotkeyPresets(),
        tree.getConfig().hotkeys as HotkeysConfig<any>,
      );

      if (!hotkeyName) return;

      const hotkeyConfig: HotkeyConfig<any> = {
        ...tree.getHotkeyPresets()[hotkeyName],
        ...tree.getConfig().hotkeys?.[hotkeyName],
      };

      if (!hotkeyConfig) return;
      if (
        !hotkeyConfig.allowWhenInputFocused &&
        e.target instanceof HTMLInputElement
      )
        return;
      if (!hotkeyConfig.canRepeat && !newMatch) return;
      if (hotkeyConfig.preventDefault) e.preventDefault();

      hotkeyConfig.handler(e, tree as any);
      tree.getConfig().onTreeHotkey?.(hotkeyName, e);
    };

    const keyup = (e: KeyboardEvent) => {
      data.current.pressedKeys ??= new Set();
      data.current.pressedKeys.delete(e.key);
    };

    // keyup is registered on document, because some hotkeys shift
    // the focus away from the tree (i.e. search)
    // and then we wouldn't get the keyup event anymore
    element.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    data.current.keydownHandler = keydown;
    data.current.keyupHandler = keyup;
  },

  onTreeUnmount: (tree, element) => {
    const data = tree.getDataRef<HotkeysCoreDataRef>();
    if (data.current.keyupHandler) {
      document.removeEventListener("keyup", data.current.keyupHandler);
      delete data.current.keyupHandler;
    }
    if (data.current.keydownHandler) {
      element.removeEventListener("keydown", data.current.keydownHandler);
      delete data.current.keydownHandler;
    }
  },
};
