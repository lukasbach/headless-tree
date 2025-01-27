import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";

const factory = TestTree.default({});

describe("core-feature/selections", () => {
  factory.forSuits((tree) => {
    describe("expanded items", () => {
      it("can expand via tree instance", () => {
        const setExpandedItems = tree.mockedHandler("setExpandedItems");
        tree.instance.expandItem("x2");
        expect(setExpandedItems).toHaveBeenCalledWith(["x1", "x11", "x2"]);
      });

      it("can expand via item", () => {
        const setExpandedItems = tree.mockedHandler("setExpandedItems");
        tree.instance.getItemInstance("x2").expand();
        expect(setExpandedItems).toHaveBeenCalledWith(["x1", "x11", "x2"]);
      });

      it("returns correct isItemExpanded value", () => {
        expect(tree.instance.isItemExpanded("x2")).toBe(false);
        tree.instance.expandItem("x2");
        expect(tree.instance.isItemExpanded("x2")).toBe(true);
      });

      it("calls setState", () => {
        const setState = tree.mockedHandler("setState");
        tree.instance.expandItem("x2");
        expect(setState).toBeCalledWith(
          expect.objectContaining({ expandedItems: ["x1", "x11", "x2"] }),
        );
      });

      it("expands on click", () => {
        const setExpandedItems = tree.mockedHandler("setExpandedItems");
        tree.do.selectItem("x2");
        expect(setExpandedItems).toHaveBeenCalledWith(["x1", "x11", "x2"]);
      });
    });

    describe("collapsed items", () => {
      it("can collapse via tree instance", () => {
        const setExpandedItems = tree.mockedHandler("setExpandedItems");
        tree.instance.collapseItem("x1");
        expect(setExpandedItems).toHaveBeenCalledWith(["x11"]);
      });

      it("can collapse via item", () => {
        const setExpandedItems = tree.mockedHandler("setExpandedItems");
        tree.instance.getItemInstance("x1").collapse();
        expect(setExpandedItems).toHaveBeenCalledWith(["x11"]);
      });

      it("returns correct isItemExpanded value", () => {
        expect(tree.instance.isItemExpanded("x1")).toBe(true);
        tree.instance.collapseItem("x1");
        expect(tree.instance.isItemExpanded("x1")).toBe(false);
      });

      it("calls setState", () => {
        const setState = tree.mockedHandler("setState");
        tree.instance.collapseItem("x1");
        expect(setState).toBeCalledWith(
          expect.objectContaining({ expandedItems: ["x11"] }),
        );
      });

      it("collapses on click", () => {
        const setExpandedItems = tree.mockedHandler("setExpandedItems");
        tree.do.selectItem("x1");
        expect(setExpandedItems).toHaveBeenCalledWith(["x11"]);
      });
    });

    describe("focused item", () => {
      it("focuses item on tree instance", () => {
        const setFocusedItem = tree.mockedHandler("setFocusedItem");
        tree.instance.focusItem("x11");
        expect(setFocusedItem).toHaveBeenCalledWith("x11");
      });

      it("focuses item on item instance", () => {
        const setFocusedItem = tree.mockedHandler("setFocusedItem");
        tree.instance.getItemInstance("x11").setFocused();
        expect(setFocusedItem).toHaveBeenCalledWith("x11");
      });

      it("returns correct initial focused item", () => {
        expect(tree.instance.getFocusedItem().getId()).toBe("x1");
      });

      it("returns correct focused item", () => {
        tree.instance.focusItem("x11");
        expect(tree.instance.getFocusedItem().getId()).toBe("x11");
      });

      it("calls setState", () => {
        const setState = tree.mockedHandler("setState");
        tree.instance.focusItem("x1");
        expect(setState).toBeCalledWith(
          expect.objectContaining({ focusedItem: "x1" }),
        );
      });

      it("updates dom focus", async () => {
        const scrollToItem = tree.mockedHandler("scrollToItem");
        const element = { focus: vi.fn() };
        tree.instance.getItemInstance("x2").registerElement(element as any);
        tree.instance.focusItem("x2");
        tree.instance.updateDomFocus();
        vi.runAllTimers();
        await vi.waitFor(() =>
          expect(scrollToItem).toBeCalledWith(tree.instance.getFocusedItem()),
        );
        expect(element.focus).toBeCalled();
      });

      describe("move focus", () => {
        it("focuses next item", () => {
          tree.instance.focusItem("x2");
          const setFocusedItem = tree.mockedHandler("setFocusedItem");
          tree.instance.focusNextItem();
          expect(setFocusedItem).toHaveBeenCalledWith("x3");
        });

        it("focuses previous item", () => {
          tree.instance.focusItem("x2");
          const setFocusedItem = tree.mockedHandler("setFocusedItem");
          tree.instance.focusPreviousItem();
          expect(setFocusedItem).toHaveBeenCalledWith("x14");
        });

        it("remains at last item when focus is at bottom", () => {
          tree.instance.focusItem("x4");
          const setFocusedItem = tree.mockedHandler("setFocusedItem");
          tree.instance.focusNextItem();
          expect(setFocusedItem).toHaveBeenCalledWith("x4");
          expect(setFocusedItem).toHaveBeenCalledTimes(1);
        });

        it("remains at first item when focus is at top", () => {
          tree.instance.focusItem("x1");
          const setFocusedItem = tree.mockedHandler("setFocusedItem");
          tree.instance.focusPreviousItem();
          expect(setFocusedItem).toHaveBeenCalledWith("x1");
          expect(setFocusedItem).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe("items meta", () => {
      it("root item", () => {
        expect(tree.instance.getItemInstance("x").getItemMeta()).toEqual({
          index: -1,
          itemId: "x",
          level: -1,
          parentId: null,
          posInSet: 0,
          setSize: 1,
        });
      });

      it("expanded container", () => {
        expect(tree.instance.getItemInstance("x11").getItemMeta()).toEqual({
          index: 1,
          itemId: "x11",
          level: 1,
          parentId: "x1",
          posInSet: 0,
          setSize: 4,
        });
      });

      it("top leaf", () => {
        expect(tree.instance.getItemInstance("x111").getItemMeta()).toEqual({
          index: 2,
          itemId: "x111",
          level: 2,
          parentId: "x11",
          posInSet: 0,
          setSize: 4,
        });
      });

      it("middle leaf", () => {
        expect(tree.instance.getItemInstance("x112").getItemMeta()).toEqual({
          index: 3,
          itemId: "x112",
          level: 2,
          parentId: "x11",
          posInSet: 1,
          setSize: 4,
        });
      });

      it("bottom leaf", () => {
        expect(tree.instance.getItemInstance("x114").getItemMeta()).toEqual({
          index: 5,
          itemId: "x114",
          level: 2,
          parentId: "x11",
          posInSet: 3,
          setSize: 4,
        });
      });

      it("item after expanded contents", () => {
        expect(tree.instance.getItemInstance("x2").getItemMeta()).toEqual({
          index: 9,
          itemId: "x2",
          level: 0,
          parentId: "x",
          posInSet: 1,
          setSize: 4,
        });
      });

      it("last item", () => {
        expect(tree.instance.getItemInstance("x2").getItemMeta()).toEqual({
          index: 9,
          itemId: "x2",
          level: 0,
          parentId: "x",
          posInSet: 1,
          setSize: 4,
        });
      });
    });

    describe.todo("container props");
    describe.todo("item props");
    describe.todo("util functions");
    describe.todo("primary action");
    describe.todo("item above/below");
    describe.todo("hotkeys");
  });
});
