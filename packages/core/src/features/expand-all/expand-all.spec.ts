import { describe, it } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { expandAllFeature } from "./feature";
import { propMemoizationFeature } from "../prop-memoization/feature";

const factory = TestTree.default({}).withFeatures(
  expandAllFeature,
  propMemoizationFeature,
);

describe("core-feature/expand-all", () => {
  factory.forSuits((tree) => {
    describe("tree instance calls", () => {
      it("expands all", async () => {
        const expandPromise = tree.instance.expandAll();
        await tree.resolveAsyncVisibleItems();
        await expandPromise;
        tree.expect.foldersExpanded("x12", "x13", "x14", "x4", "x41", "x44");
      });

      it("collapses all", () => {
        tree.instance.collapseAll();
        tree.expect.foldersCollapsed("x1", "x2", "x3", "x4");
      });

      it("cancels expanding all", async () => {
        const token = { current: true };
        const expandPromise = tree.instance.expandAll(token);
        token.current = false;
        await tree.resolveAsyncVisibleItems();
        await expandPromise;
        tree.expect.foldersCollapsed("x2", "x3", "x4");
      });
    });

    describe("item instance calls", () => {
      it("expands all", async () => {
        const expandPromise = Promise.all([
          // not sure why all are needed...
          tree.instance.getItemInstance("x1").expandAll(),
          tree.instance.getItemInstance("x2").expandAll(),
          tree.instance.getItemInstance("x3").expandAll(),
          tree.instance.getItemInstance("x4").expandAll(),
        ]);
        await tree.resolveAsyncVisibleItems();
        await expandPromise;
        tree.expect.foldersExpanded("x2", "x21", "x24");
      });

      it("collapses all", () => {
        tree.instance.collapseAll();
        tree.expect.foldersCollapsed("x1", "x2", "x3", "x4");
      });
    });
  });
});
