import { FeatureImplementation } from "../../types/core";
import { HotkeysCoreDataRef } from "./types";
import { hotkeysCoreController } from "./shared";

export const hotkeysCoreFeature: FeatureImplementation = {
  key: "hotkeys-core",

  onTreeMount: (tree, element) => {
    const data = tree.getDataRef<HotkeysCoreDataRef>();
    const keydown = (e: KeyboardEvent) => {
      const isInputFocused = e.target instanceof HTMLInputElement;
      hotkeysCoreController.dispatchKeyDown(tree, data, e, {
        isInputFocused,
        releaseAfterDispatch: isInputFocused,
      });
    };

    const keyup = (e: KeyboardEvent) => {
      hotkeysCoreController.dispatchKeyUp(data, e);
    };

    const reset = () => {
      hotkeysCoreController.clearPressedKeys(data);
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
