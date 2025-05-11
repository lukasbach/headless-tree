import {
  FeatureImplementation,
  HotkeysConfig,
  TreeInstance,
} from "../../types/core";
import { HotkeyConfig, HotkeysCoreDataRef } from "./types";

const specialKeys: Record<string, RegExp> = {
  // TODO:breaking deprecate auto-lowercase
  letter: /^Key[A-Z]$/,
  letterornumber: /^(Key[A-Z]|Digit[0-9])$/,
  plus: /^(NumpadAdd|Plus)$/,
  minus: /^(NumpadSubtract|Minus)$/,
  control: /^(ControlLeft|ControlRight)$/,
  shift: /^(ShiftLeft|ShiftRight)$/,
};

const testHotkeyMatch = (
  pressedKeys: Set<string>,
  tree: TreeInstance<any>,
  hotkey: HotkeyConfig<any>,
) => {
  const supposedKeys = hotkey.hotkey.toLowerCase().split("+"); // TODO:breaking deprecate auto-lowercase
  const doKeysMatch = supposedKeys.every((key) => {
    if (key in specialKeys) {
      return [...pressedKeys].some((pressedKey) =>
        specialKeys[key].test(pressedKey),
      );
    }

    const pressedKeysLowerCase = [...pressedKeys] // TODO:breaking deprecate auto-lowercase
      .map((k) => k.toLowerCase());

    if (pressedKeysLowerCase.includes(key.toLowerCase())) {
      return true;
    }

    if (pressedKeysLowerCase.includes(`key${key.toLowerCase()}`)) {
      // TODO:breaking deprecate e.key character matching
      return true;
    }

    return false;
  });
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
      const { ignoreHotkeysOnInputs, onTreeHotkey, hotkeys } = tree.getConfig();
      if (e.target instanceof HTMLInputElement && ignoreHotkeysOnInputs) {
        return;
      }

      data.current.pressedKeys ??= new Set();
      const newMatch = !data.current.pressedKeys.has(e.code);
      data.current.pressedKeys.add(e.code);

      const hotkeyName = findHotkeyMatch(
        data.current.pressedKeys,
        tree as any,
        tree.getHotkeyPresets(),
        hotkeys as HotkeysConfig<any>,
      );

      if (e.target instanceof HTMLInputElement) {
        // JS respects composite keydowns while input elements are focused, and
        // doesnt send the associated keyup events with the same key name
        data.current.pressedKeys.delete(e.code);
      }

      if (!hotkeyName) return;

      const hotkeyConfig: HotkeyConfig<any> = {
        ...tree.getHotkeyPresets()[hotkeyName],
        ...hotkeys?.[hotkeyName],
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
      onTreeHotkey?.(hotkeyName, e);
    };

    const keyup = (e: KeyboardEvent) => {
      data.current.pressedKeys ??= new Set();
      data.current.pressedKeys.delete(e.code);
    };

    const reset = () => {
      data.current.pressedKeys = new Set();
    };

    // keyup is registered on document, because some hotkeys shift
    // the focus away from the tree (i.e. search)
    // and then we wouldn't get the keyup event anymore
    element.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    window.addEventListener("focus", reset);
    data.current.keydownHandler = keydown;
    data.current.keyupHandler = keyup;
    data.current.resetHandler = reset;
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
    if (data.current.resetHandler) {
      window.removeEventListener("focus", data.current.resetHandler);
      delete data.current.resetHandler;
    }
  },
};
