import { HotkeysConfig, TreeInstance } from "../../types/core";
import { HotkeyConfig, HotkeysCoreDataRef } from "./types";

// e.code may be empty or "Unidentified" on mobile virtual keyboards
// or during IME composition, so we fall back to e.key
const resolveKeyCode = (event: Pick<KeyboardEvent, "code" | "key">) =>
  event.code !== "" && event.code !== "Unidentified" ? event.code : event.key;

const specialKeys: Record<string, RegExp> = {
  letter: /^Key[A-Z]$/,
  letterornumber: /^(Key[A-Z]|Digit[0-9])$/,
  plus: /^(NumpadAdd|Plus)$/,
  minus: /^(NumpadSubtract|Minus)$/,
  control: /^(ControlLeft|ControlRight)$/,
  shift: /^(ShiftLeft|ShiftRight)$/,
  metaorcontrol: /^(MetaLeft|MetaRight|ControlLeft|ControlRight)$/,
  enter: /^(Enter|NumpadEnter)$/,
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

    // TODO:breaking deprecate auto-lowercase
    const pressedKeysLowerCase = [...pressedKeys].map((pressedKey) =>
      pressedKey.toLowerCase(),
    );

    return (
      pressedKeysLowerCase.includes(key.toLowerCase()) ||
      pressedKeysLowerCase.includes(`key${key.toLowerCase()}`) // TODO:breaking deprecate e.key character matching
    );
  });
  const isEnabled = !hotkey.isEnabled || hotkey.isEnabled(tree);
  return doKeysMatch && isEnabled && pressedKeys.size === supposedKeys.length;
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

export const hotkeysCoreController = {
  clearPressedKeys: (dataRef: { current: HotkeysCoreDataRef }) => {
    dataRef.current.pressedKeys = new Set();
  },

  dispatchKeyDown: (
    tree: TreeInstance<any>,
    dataRef: { current: HotkeysCoreDataRef },
    eventLike: Partial<KeyboardEvent>,
    options: {
      isInputFocused?: boolean;
      releaseAfterDispatch?: boolean;
    } = {},
  ) => {
    const { isInputFocused = false, releaseAfterDispatch = false } = options;
    const { ignoreHotkeysOnInputs, onTreeHotkey, hotkeys } = tree.getConfig();
    if (isInputFocused && ignoreHotkeysOnInputs) {
      return;
    }

    const resolvedCode = resolveKeyCode({
      code: eventLike.code ?? "",
      key: eventLike.key ?? "",
    });

    dataRef.current.pressedKeys ??= new Set();
    const isNewKey = !dataRef.current.pressedKeys.has(resolvedCode);
    if (resolvedCode) {
      dataRef.current.pressedKeys.add(resolvedCode);
    }

    const hotkeyName = findHotkeyMatch(
      dataRef.current.pressedKeys,
      tree,
      tree.getHotkeyPresets(),
      hotkeys as HotkeysConfig<any>,
    );

    if (releaseAfterDispatch && resolvedCode) {
      // JS respects composite keydowns while input elements are focused, and
      // doesnt send the associated keyup events with the same key name
      dataRef.current.pressedKeys.delete(resolvedCode);
    }

    if (!hotkeyName) {
      return;
    }

    const hotkeyConfig: HotkeyConfig<any> = {
      ...tree.getHotkeyPresets()[hotkeyName],
      ...hotkeys?.[hotkeyName],
    };

    if (!hotkeyConfig) {
      return;
    }

    if (!hotkeyConfig.allowWhenInputFocused && isInputFocused) {
      return;
    }

    if (!hotkeyConfig.canRepeat && !isNewKey) {
      return;
    }

    if (hotkeyConfig.preventDefault) {
      eventLike.preventDefault?.();
    }

    hotkeyConfig.handler(eventLike as KeyboardEvent, tree);
    onTreeHotkey?.(hotkeyName, eventLike as KeyboardEvent);
  },

  dispatchKeyUp: (
    dataRef: { current: HotkeysCoreDataRef },
    eventLike: Partial<KeyboardEvent>,
  ) => {
    const resolvedCode = resolveKeyCode({
      code: eventLike.code ?? "",
      key: eventLike.key ?? "",
    });
    if (!resolvedCode) {
      return;
    }

    dataRef.current.pressedKeys ??= new Set();
    dataRef.current.pressedKeys.delete(resolvedCode);
  },
};
