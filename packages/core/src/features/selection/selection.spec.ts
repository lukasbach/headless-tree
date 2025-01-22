import { describe, expect, it } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { syncDataLoaderFeature } from "../sync-data-loader/feature";
import { selectionFeature } from "./feature";

describe("core-feature/selections", () => {
  // describe.for([syncTree, asyncTree, proxifiedSyncTree, proxifiedAsyncTree], () => {});
  const tree = TestTree.default({})
    .withFeatures(syncDataLoaderFeature, selectionFeature)
    .withResetBeforeEach();

  it("sets aria-selected to false", () => {
    expect(
      tree.instance.getItemInstance("x111").getProps()["aria-selected"],
    ).toBe("false");
  });

  it("sets aria-selected to true", () => {
    tree.do.selectItem("x111");
    expect(
      tree.instance.getItemInstance("x111").getProps()["aria-selected"],
    ).toBe("true");
  });

  describe("select and control select", () => {
    it("should make isSelected true", () => {
      tree.do.selectItem("x111");
      tree.do.ctrlSelectItem("x112");
      tree.do.ctrlSelectItem("x113");

      expect(tree.instance.getItemInstance("x111").isSelected()).toBe(true);
      expect(tree.instance.getItemInstance("x112").isSelected()).toBe(true);
      expect(tree.instance.getItemInstance("x113").isSelected()).toBe(true);
    });

    it("should call individual state setters", () => {
      const setSelectedItems = tree.mockedHandler("setSelectedItems");
      const setFocusedItem = tree.mockedHandler("setFocusedItem");

      tree.do.selectItem("x111");
      tree.do.ctrlSelectItem("x112");
      tree.do.ctrlSelectItem("x113");

      expect(setSelectedItems).toHaveBeenCalledWith(["x111", "x112", "x113"]);
      expect(setFocusedItem).toHaveBeenCalledWith("x113");
    });

    it("should call joint state setter", () => {
      const setState = tree.mockedHandler("setState");

      tree.do.selectItem("x111");
      tree.do.ctrlSelectItem("x112");
      tree.do.ctrlSelectItem("x113");

      expect(setState).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedItems: ["x111", "x112", "x113"],
          focusedItem: "x113",
        }),
      );
    });
  });

  describe("shift select", () => {});
  describe("resets old selection after new select", () => {});
  describe("programmatic select", () => {});
});
