import { TestTree } from "./test-tree";
import { HotkeyName } from "../types/core";
import { HotkeyConfig } from "../features/hotkeys-core/types";

export class TestTreeDo<T> {
  protected itemInstance(itemId: string) {
    return this.tree.instance.getItemInstance(itemId);
  }

  protected itemProps(itemId: string) {
    return this.itemInstance(itemId).getProps();
  }

  constructor(protected tree: TestTree<T>) {}

  selectItem(id: string) {
    this.itemProps(id).onClick({});
  }

  shiftSelectItem(id: string) {
    this.itemProps(id).onClick({ shiftKey: true });
  }

  ctrlSelectItem(id: string) {
    this.itemProps(id).onClick({ ctrlKey: true });
  }

  ctrlShiftSelectItem(id: string) {
    this.itemProps(id).onClick({ shiftKey: true, ctrlKey: true });
  }

  hotkey(hotkey: HotkeyName, e: Partial<KeyboardEvent> = {}) {
    const hotkeyConfig: HotkeyConfig<any> = {
      ...this.tree.instance.getHotkeyPresets()[hotkey],
      ...this.tree.instance.getConfig().hotkeys?.[hotkey],
    };
    if (!hotkeyConfig.isEnabled?.(this.tree.instance)) {
      throw new Error(`Hotkey "${hotkey}" is disabled`);
    }
    if (!hotkeyConfig.handler) {
      throw new Error(`Hotkey "${hotkey}" has no handler`);
    }
    hotkeyConfig.handler(
      {
        ...e,
        stopPropagation: () => {},
        preventDefault: () => {},
      } as any,
      this.tree.instance,
    );
  }
}
