/* eslint-disable import/no-extraneous-dependencies */
import { Mock, expect } from "vitest";
import { DragEvent } from "react";
import { TestTree } from "./test-tree";
import { DropTarget } from "../features/drag-and-drop/types";

export class TestTreeExpect<T> {
  protected itemInstance(itemId: string) {
    return this.tree.instance.getItemInstance(itemId);
  }

  protected itemProps(itemId: string) {
    return this.itemInstance(itemId).getProps();
  }

  constructor(private tree: TestTree<T>) {}

  foldersExpanded(...itemIds: string[]) {
    for (const itemId of itemIds) {
      expect(
        this.tree.instance.getItemInstance(itemId).isExpanded(),
        `Expected ${itemId} to be expanded`,
      ).toBe(true);
    }
  }

  foldersCollapsed(...itemIds: string[]) {
    for (const itemId of itemIds) {
      expect(
        this.tree.instance.getItemInstance(itemId).isExpanded(),
        `Expected ${itemId} to be collapsed`,
      ).toBe(false);
    }
  }

  hasChildren(itemId: string, children: string[]) {
    const item = this.tree.instance.getItemInstance(itemId);
    const itemChildren = item.getChildren().map((child) => child.getId());
    expect(itemChildren).toEqual(children);
  }

  dropped(draggedItems: string[], target: DropTarget<any>) {
    expect(this.tree.instance.getConfig().onDrop).toBeCalledWith(
      draggedItems.map((id) => this.tree.item(id)),
      target,
    );
  }

  dragOverNotAllowed(itemId: string, event?: DragEvent) {
    const e = event ?? TestTree.dragEvent();
    (e.preventDefault as Mock).mockClear();
    this.itemProps(itemId).onDragOver(e);
    this.itemProps(itemId).onDragOver(e);
    this.itemProps(itemId).onDragOver(e);
    expect(
      e.preventDefault,
      "onDragOver shouldn't call e.preventDefault if drag is not allowed",
    ).not.toBeCalled();

    this.itemProps(itemId).onDrop(e);
    expect(
      e.preventDefault,
      "onDrop shouldn't call e.preventDefault if drag is not allowed",
    ).not.toBeCalled();
    expect(
      this.tree.instance.getConfig().onDrop,
      "onDrop handler shouldn't be called if drag is not allowed",
    ).not.toBeCalled();
    return e;
  }

  defaultDragLineProps(indent = 0) {
    expect(this.tree.instance.getDragLineData()).toEqual({
      indent,
      left: indent * 20,
      width: 100 - indent * 20,
      top: 0,
    });
    expect(this.tree.instance.getDragLineStyle(0, 0)).toEqual({
      left: `${indent * 20}px`,
      pointerEvents: "none",
      top: "0px",
      width: `${100 - indent * 20}px`,
    });
  }
}
