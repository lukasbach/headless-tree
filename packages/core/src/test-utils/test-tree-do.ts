/* eslint-disable import/no-extraneous-dependencies */
import { DragEvent } from "react";
import { Mock, expect, vi } from "vitest";
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

  selectMultiple(...ids: string[]) {
    ids.forEach((id) => this.ctrlSelectItem(id));
  }

  hotkey(hotkey: HotkeyName, e: Partial<KeyboardEvent> = {}) {
    const hotkeyConfig: HotkeyConfig<any> = {
      ...this.tree.instance.getHotkeyPresets()[hotkey],
      ...this.tree.instance.getConfig().hotkeys?.[hotkey],
    };
    if (
      hotkeyConfig.isEnabled &&
      !hotkeyConfig.isEnabled?.(this.tree.instance)
    ) {
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

  startDrag(itemId: string, event?: DragEvent) {
    if (!this.itemProps(itemId).draggable) {
      throw new Error(
        `Can't drag item ${itemId}, has attribute draggable=false`,
      );
    }

    const e = event ?? TestTree.dragEvent();
    this.itemProps(itemId).onDragStart(e);
    return e;
  }

  dragOver(itemId: string, event?: DragEvent) {
    const e = event ?? TestTree.dragEvent();
    (e.preventDefault as Mock).mockClear();
    this.itemProps(itemId).onDragOver(e);
    this.itemProps(itemId).onDragOver(e);
    this.itemProps(itemId).onDragOver(e);
    expect(e.preventDefault).toBeCalledTimes(3);

    this.consistentCalls(e.preventDefault);
    this.consistentCalls(e.stopPropagation);
    return e;
  }

  dragOverNotAllowed(itemId: string, event?: DragEvent) {
    const e = event ?? TestTree.dragEvent();
    (e.preventDefault as Mock).mockClear();
    this.itemProps(itemId).onDragOver(e);
    this.itemProps(itemId).onDragOver(e);
    this.itemProps(itemId).onDragOver(e);
    expect(e.preventDefault).toBeCalledTimes(0);

    this.consistentCalls(e.preventDefault);
    this.consistentCalls(e.stopPropagation);
    return e;
  }

  dragLeave(itemId: string) {
    this.itemProps(itemId).onDragLeave({});
  }

  dragEnd(itemId: string, event?: DragEvent) {
    const e = event ?? TestTree.dragEvent();
    this.itemProps(itemId).onDragEnd(e);
    return e;
  }

  async drop(itemId: string, event?: DragEvent) {
    const e = event ?? TestTree.dragEvent();
    await this.itemProps(itemId).onDrop(e);
    return e;
  }

  async dragOverAndDrop(itemId: string, event?: DragEvent) {
    const e = event ?? TestTree.dragEvent();
    this.dragOver(itemId, e);
    return this.drop(itemId, e);
  }

  private consistentCalls(fn: any) {
    if (!vi.isMockFunction(fn)) {
      throw new Error("fn is not a mock");
    }
    expect(
      fn.mock.calls.length,
      "function called inconsistent times",
    ).toBeOneOf([0, 3]);
    expect(
      new Set(fn.mock.calls.map((call) => call.join("__"))).size,
      "function called with inconsistent parameters",
    ).toBeOneOf([0, 1]);
  }
}
