import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { asyncDataLoaderFeature } from "./feature";
import { propMemoizationFeature } from "../prop-memoization/feature";

const tree = TestTree.default({}).withFeatures(
  asyncDataLoaderFeature,
  propMemoizationFeature,
);

describe("core-feature/selections", () => {
  tree.resetBeforeEach();

  describe("loading of items", () => {
    it("has initial items", () => {
      tree.expect.hasChildren("x", ["x1", "x2", "x3", "x4"]);
      tree.expect.hasChildren("x1", ["x11", "x12", "x13", "x14"]);
      tree.expect.hasChildren("x11", ["x111", "x112", "x113", "x114"]);
      tree.expect.hasChildren("x12", []);
    });

    it.skip("has loading items after expanding", async () => {
      tree.do.selectItem("x12");
      await TestTree.resolveAsyncLoaders();
      // tree.debug();
      tree.expect.hasChildren("x12", [
        "loading",
        "loading",
        "loading",
        "loading",
      ]);
    });

    it("has loaded items after expanding and loading", async () => {
      tree.do.selectItem("x12");
      await tree.resolveAsyncVisibleItems();
      tree.expect.hasChildren("x12", ["x121", "x122", "x123", "x124"]);
      tree.expect.hasChildren("x12", ["x121", "x122", "x123", "x124"]);
    });
  });

  describe("calls handlers", () => {
    it("updates setLoadingItems", async () => {
      const setLoadingItemChildrens = tree.mockedHandler(
        "setLoadingItemChildrens",
      );
      const setLoadingItemData = tree.mockedHandler("setLoadingItemData");
      tree.do.selectItem("x12");
      expect(setLoadingItemChildrens).toHaveBeenCalledWith(["x12"]);
      expect(setLoadingItemData).not.toHaveBeenCalled();
      await tree.resolveAsyncVisibleItems();
      expect(setLoadingItemChildrens).toHaveBeenCalledWith([]);
      expect(setLoadingItemData).toHaveBeenCalledWith(["x121"]);
      expect(setLoadingItemData).toHaveBeenCalledWith([]);
    });

    it("calls onLoadedItem", async () => {
      const onLoadedItem = tree.mockedHandler("onLoadedItem");
      tree.do.selectItem("x12");
      await tree.resolveAsyncVisibleItems();
      expect(onLoadedItem).toHaveBeenCalledWith("x121", "x121");
    });

    it("calls onLoadedChildren", async () => {
      const onLoadedChildren = tree.mockedHandler("onLoadedChildren");
      tree.do.selectItem("x12");
      await tree.resolveAsyncVisibleItems();
      expect(onLoadedChildren).toHaveBeenCalledWith("x12", [
        "x121",
        "x122",
        "x123",
        "x124",
      ]);
    });
  });

  describe("data invalidation", () => {
    const getItem = vi.fn(async (id) => id);
    const getChildren = vi.fn(async (id) => [
      `${id}1`,
      `${id}2`,
      `${id}3`,
      `${id}4`,
    ]);
    const suiteTree = tree.with({ dataLoader: { getItem, getChildren } });
    suiteTree.resetBeforeEach();

    it("invalidates item data on item instance", async () => {
      getItem.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      getItem.mockResolvedValueOnce("new");
      suiteTree.item("x1").invalidateItemData();
      await suiteTree.resolveAsyncVisibleItems();
      expect(getItem).toHaveBeenCalledWith("x1");
      expect(suiteTree.item("x1").getItemData()).toBe("new");
    });

    it("invalidates children ids on item instance", async () => {
      getChildren.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      getChildren.mockResolvedValueOnce(["new1", "new2"]);
      suiteTree.item("x1").invalidateChildrenIds();
      await suiteTree.resolveAsyncVisibleItems();
      expect(getChildren).toHaveBeenCalledWith("x1");
      suiteTree.expect.hasChildren("x1", ["new1", "new2"]);
    });

    it("doesnt call item data getter twice", async () => {
      await suiteTree.resolveAsyncVisibleItems();
      getItem.mockClear();
      suiteTree.item("x1").invalidateItemData();
      await suiteTree.resolveAsyncVisibleItems();
      expect(suiteTree.item("x1").getItemData()).toBe("x1");
      expect(suiteTree.item("x1").getItemData()).toBe("x1");
      expect(getItem).toHaveBeenCalledTimes(1);
    });

    it("doesnt call children getter twice", async () => {
      await suiteTree.resolveAsyncVisibleItems();
      getChildren.mockClear();
      suiteTree.item("x1").invalidateChildrenIds();
      await suiteTree.resolveAsyncVisibleItems();
      suiteTree.expect.hasChildren("x1", ["x11", "x12", "x13", "x14"]);
      suiteTree.expect.hasChildren("x1", ["x11", "x12", "x13", "x14"]);
      expect(getChildren).toHaveBeenCalledTimes(1);
    });
  });

  // TODO - add tests for getChildrenWithData
});
