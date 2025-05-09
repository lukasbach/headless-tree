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
      const setLoadingItemData = suiteTree.mockedHandler("setLoadingItemData");
      getItem.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      getItem.mockResolvedValueOnce("new");
      suiteTree.item("x1").invalidateItemData();
      await suiteTree.resolveAsyncVisibleItems();
      expect(getItem).toHaveBeenCalledWith("x1");
      expect(suiteTree.item("x1").getItemData()).toBe("new");
      expect(setLoadingItemData).toBeCalledWith(["x1"]);
      expect(setLoadingItemData).toBeCalledWith([]);
    });

    it("invalidates children ids on item instance", async () => {
      const setLoadingItemChildrens = suiteTree.mockedHandler(
        "setLoadingItemChildrens",
      );
      getChildren.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      getChildren.mockResolvedValueOnce(["new1", "new2"]);
      suiteTree.item("x1").invalidateChildrenIds();
      await suiteTree.resolveAsyncVisibleItems();
      expect(getChildren).toHaveBeenCalledWith("x1");
      suiteTree.expect.hasChildren("x1", ["new1", "new2"]);
      expect(setLoadingItemChildrens).toBeCalledWith(["x1"]);
      expect(setLoadingItemChildrens).toBeCalledWith([]);
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

    it("optimistic invalidates item data on item instance", async () => {
      const setLoadingItemData = suiteTree.mockedHandler("setLoadingItemData");
      getItem.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      getItem.mockResolvedValueOnce("new");
      suiteTree.item("x1").invalidateItemData(true);
      await suiteTree.resolveAsyncVisibleItems();
      expect(getItem).toHaveBeenCalledWith("x1");
      expect(suiteTree.item("x1").getItemData()).toBe("new");
      expect(setLoadingItemData).toBeCalledTimes(1);
      expect(setLoadingItemData).toBeCalledWith([]);
    });

    it("optimistic invalidates children ids on item instance", async () => {
      const setLoadingItemChildrens = suiteTree.mockedHandler(
        "setLoadingItemChildrens",
      );
      getChildren.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      getChildren.mockResolvedValueOnce(["new1", "new2"]);
      suiteTree.item("x1").invalidateChildrenIds(true);
      await suiteTree.resolveAsyncVisibleItems();
      expect(getChildren).toHaveBeenCalledWith("x1");
      suiteTree.expect.hasChildren("x1", ["new1", "new2"]);
      expect(setLoadingItemChildrens).toBeCalledTimes(1);
      expect(setLoadingItemChildrens).toBeCalledWith([]);
    });
  });

  describe("getChildrenWithData", () => {
    const getChildrenWithData = vi.fn(async (id) => [
      { id: `${id}1`, data: `${id}1-data` },
      { id: `${id}2`, data: `${id}2-data` },
    ]);
    const getItem = vi.fn();
    const suiteTree = tree.with({
      dataLoader: { getItem, getChildrenWithData },
    });
    suiteTree.resetBeforeEach();

    it("loads children with data", async () => {
      getChildrenWithData.mockClear();
      suiteTree.do.selectItem("x12");
      await suiteTree.resolveAsyncVisibleItems();
      expect(getChildrenWithData).toHaveBeenCalledWith("x12");
      suiteTree.expect.hasChildren("x12", ["x121", "x122"]);
      expect(suiteTree.item("x121").getItemData()).toBe("x121-data");
      expect(suiteTree.item("x122").getItemData()).toBe("x122-data");
    });

    it.skip("invalidates children and reloads with data", async () => {
      await suiteTree.resolveAsyncVisibleItems();
      suiteTree.item("x").invalidateChildrenIds();
      getChildrenWithData.mockResolvedValueOnce([
        { id: "new1", data: "new1-data" },
        { id: "new2", data: "new2-data" },
      ]);
      getChildrenWithData.mockClear();
      await suiteTree.resolveAsyncVisibleItems();
      expect(getChildrenWithData).toHaveBeenCalledTimes(1);
      suiteTree.expect.hasChildren("x", ["new1", "new2"]);
      expect(suiteTree.item("new1").getItemData()).toBe("new1-data");
      expect(suiteTree.item("new2").getItemData()).toBe("new2-data");
    });

    it("does not call getChildrenWithData twice unnecessarily", async () => {
      await suiteTree.resolveAsyncVisibleItems();
      getChildrenWithData.mockClear();
      suiteTree.item("x").invalidateChildrenIds();
      await suiteTree.resolveAsyncVisibleItems();
      suiteTree.expect.hasChildren("x", ["x1", "x2"]);
      expect(getChildrenWithData).toHaveBeenCalledTimes(1);
    });
  });
});
