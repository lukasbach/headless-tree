// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "vitest";
import { TestTree } from "./test-tree";

export class TestTreeExpect<T> {
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
}
