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
}
