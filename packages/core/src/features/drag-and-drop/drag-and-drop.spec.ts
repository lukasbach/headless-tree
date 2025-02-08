import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { dragAndDropFeature } from "./feature";
import { selectionFeature } from "../selection/feature";
import { ItemInstance } from "../../types/core";

const isItem = (item: unknown): item is ItemInstance<any> =>
  !!item && typeof item === "object" && "getId" in item;
const areItemsEqual = (a: ItemInstance<any>, b: ItemInstance<any>) => {
  if (!isItem(a) || !isItem(b)) return undefined;
  if (a.getId() === b.getId()) return true;
  console.warn("Items are not equal:", a.getId(), b.getId());
  return false;
};
expect.addEqualityTesters([areItemsEqual]);

const factory = TestTree.default({
  initialState: {
    expandedItems: ["x1", "x11", "x2", "x21"],
  },
  onDrop: vi.fn(),
}).withFeatures(selectionFeature, dragAndDropFeature);

describe("core-feature/drag-and-drop", () => {
  const { tree } = factory.suits.async();
  tree.resetBeforeEach();
  // factory.forSuits((tree) => {
  describe("happy paths", () => {
    it("drop on expanded folder with leafs", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.do.dragOverAndDrop("x21");
      tree.expect.dropped(["x111"], {
        dragLineIndex: 10,
        dragLineLevel: 1,
        childIndex: null,
        insertionIndex: null,
        item: tree.item("x21"),
      });
    });

    it("drop on expanded folder with nested items", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.do.dragOverAndDrop("x2");
      tree.expect.dropped(["x111"], {
        dragLineIndex: 9,
        dragLineLevel: 0,
        childIndex: null,
        insertionIndex: null,
        item: tree.item("x2"),
      });
    });

    it("drop on collapsed folder", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.do.dragOverAndDrop("x12");
      tree.expect.dropped(["x111"], {
        dragLineIndex: 6,
        dragLineLevel: 1,
        childIndex: null,
        insertionIndex: null,
        item: tree.item("x12"),
      });
    });

    it("drop above item", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.setElementBoundingBox("x212");
      const event = tree.createTopDragEvent();
      tree.do.dragOverAndDrop("x212", event);
      tree.expect.dropped(["x111"], {
        dragLineIndex: 12,
        dragLineLevel: 2,
        childIndex: 1,
        insertionIndex: 1,
        item: tree.item("x21"),
      });
    });

    it("drop below item", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createBottomDragEvent();
      tree.do.dragOverAndDrop("x212", event);
      tree.expect.dropped(["x111"], {
        dragLineIndex: 13,
        dragLineLevel: 2,
        childIndex: 2,
        insertionIndex: 2,
        item: tree.item("x21"),
      });
    });

    it("drop not reparented", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.setElementBoundingBox("x114");
      const event = tree.createBottomDragEvent(2);
      tree.do.dragOverAndDrop("x114", event);
      tree.expect.dropped(["x111"], {
        dragLineIndex: 6,
        dragLineLevel: 2,
        childIndex: 4,
        insertionIndex: 3,
        item: tree.item("x11"),
      });
    });

    it("drop reparented one level", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.setElementBoundingBox("x114");
      const event = tree.createBottomDragEvent(1);
      tree.do.dragOverAndDrop("x114", event);
      tree.expect.dropped(["x111"], {
        dragLineIndex: 6,
        dragLineLevel: 1,
        childIndex: 1,
        insertionIndex: 1,
        item: tree.item("x1"),
      });
    });

    it("drop reparented two levels", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createBottomDragEvent(0);
      tree.do.dragOverAndDrop("x114", event);
      tree.expect.dropped(["x111"], {
        dragLineIndex: 6,
        dragLineLevel: 0,
        childIndex: 1,
        insertionIndex: 1,
        item: tree.item("x"),
      });
    });

    it("drags multiple in retained order (correct order)", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.ctrlSelectItem("x112");
      tree.do.ctrlSelectItem("x113");
      tree.do.ctrlSelectItem("x114");
      tree.do.startDrag("x111");
      tree.do.dragOverAndDrop("x21");
      tree.expect.dropped(["x111", "x112", "x113", "x114"], {
        dragLineIndex: 10,
        dragLineLevel: 1,
        childIndex: null,
        insertionIndex: null,
        item: tree.item("x21"),
      });
    });

    it.skip("drags multiple in retained order (inverse order)", () => {
      tree.do.ctrlSelectItem("x114");
      tree.do.ctrlSelectItem("x113");
      tree.do.ctrlSelectItem("x112");
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.do.dragOverAndDrop("x21");
      tree.expect.dropped(["x111", "x112", "x113", "x114"], {
        dragLineIndex: 10,
        dragLineLevel: 1,
        childIndex: null,
        insertionIndex: null,
        item: tree.item("x21"),
      });
    });

    it.skip("drags multiple in retained order (scrambled order)", () => {
      tree.do.ctrlSelectItem("x112");
      tree.do.ctrlSelectItem("x113");
      tree.do.ctrlSelectItem("x111");
      tree.do.ctrlSelectItem("x114");
      tree.do.startDrag("x111");
      tree.do.dragOverAndDrop("x21");
      tree.expect.dropped(["x111", "x112", "x113", "x114"], {
        dragLineIndex: 10,
        dragLineLevel: 1,
        childIndex: null,
        insertionIndex: null,
        item: tree.item("x21"),
      });
    });
  });

  describe.todo("insertion indices");

  describe("drag lines for happy paths", () => {
    it("drop on expanded folder", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.do.dragOver("x21");
      expect(tree.instance.getDragLineData()).toEqual(null);
      expect(tree.instance.getDragLineStyle()).toEqual({ display: "none" });
    });

    it("drop on collapsed folder", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      tree.do.dragOver("x12");
      expect(tree.instance.getDragLineData()).toEqual(null);
      expect(tree.instance.getDragLineStyle(0, 0)).toEqual({ display: "none" });
    });

    it("drop above item", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createTopDragEvent();
      tree.setElementBoundingBox("x212");
      tree.do.dragOver("x212", event);
      tree.expect.defaultDragLineProps(2);
    });

    it("drop below item", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createBottomDragEvent();
      tree.setElementBoundingBox("x213");
      tree.do.dragOver("x212", event);
      tree.expect.defaultDragLineProps(2);
    });

    it("drop not reparented", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createBottomDragEvent(2);
      tree.setElementBoundingBox("x12");
      tree.setElementBoundingBox("x114");
      tree.do.dragOver("x114", event);
      tree.expect.defaultDragLineProps(2);
    });

    it("drop reparented one level", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createBottomDragEvent(1);
      tree.setElementBoundingBox("x12");
      tree.setElementBoundingBox("x114");
      tree.do.dragOver("x114", event);
      tree.expect.defaultDragLineProps(1);
    });

    it("drop reparented two levels", () => {
      tree.do.ctrlSelectItem("x111");
      tree.do.startDrag("x111");
      const event = tree.createBottomDragEvent(0);
      tree.setElementBoundingBox("x12");
      tree.setElementBoundingBox("x114");
      tree.do.dragOver("x114", event);
      tree.expect.defaultDragLineProps(0);
    });
  });

  describe("foreign dnd", () => {
    const data = Symbol("foreignObject");
    const format = "application/json";

    const createForeignDragObject = tree
      .mockedHandler("createForeignDragObject")
      .mockReturnValue({ data, format });
    const onCompleteForeignDrop = tree.mockedHandler("onCompleteForeignDrop");

    it("drags tree item outside to foreign object", () => {
      tree.do.selectMultiple("x111", "x112");
      const event = tree.do.startDrag("x111");
      tree.do.dragEnd("x111");
      expect(event.dataTransfer.setData).toHaveBeenCalledWith(format, data);
      expect(createForeignDragObject).toHaveBeenCalledWith([
        tree.item("x111"),
        tree.item("x112"),
      ]);
      expect(onCompleteForeignDrop).toHaveBeenCalledWith([
        tree.item("x111"),
        tree.item("x112"),
      ]);
    });

    it("drags foreign object inside tree, on folder", () => {
      tree.mockedHandler("canDropForeignDragObject").mockReturnValue(true);
      const onDropForeignDragObject = tree.mockedHandler(
        "onDropForeignDragObject",
      );
      const event = TestTree.dragEvent();
      tree.do.dragOver("x11", event);
      tree.do.drop("x11", event);
      expect(onDropForeignDragObject).toHaveBeenCalledWith(event.dataTransfer, {
        childIndex: null,
        dragLineIndex: 1,
        dragLineLevel: 1,
        insertionIndex: null,
        item: tree.item("x11"),
      });
    });

    it("drags foreign object inside tree, between items", () => {
      tree
        .mockedHandler("canDropForeignDragObject")
        .mockImplementation((_, target) => target.item.isFolder());
      const onDropForeignDragObject = tree.mockedHandler(
        "onDropForeignDragObject",
      );
      const event = tree.createBottomDragEvent(2);
      tree.setElementBoundingBox("x212");
      tree.setElementBoundingBox("x213");
      tree.do.dragOver("x112", event);
      tree.do.drop("x112", event);
      expect(onDropForeignDragObject).toHaveBeenCalledWith(event.dataTransfer, {
        childIndex: 2,
        dragLineIndex: 4,
        dragLineLevel: 2,
        insertionIndex: 2,
        item: tree.item("x11"),
      });
    });

    it.todo("doesnt drag foreign object inside tree if not allowed", () => {
      // TODO doesnt work
      tree.mockedHandler("canDropForeignDragObject").mockReturnValue(false);
      const onDropForeignDragObject = tree.mockedHandler(
        "onDropForeignDragObject",
      );
      const event = TestTree.dragEvent();
      tree.do.dragOver("x11", event);
      tree.do.drop("x11", event);
      expect(onDropForeignDragObject).toHaveBeenCalledWith(event.dataTransfer, {
        childIndex: null,
        dragLineIndex: 1,
        dragLineLevel: 1,
        insertionIndex: null,
        item: tree.item("x11"),
      });
    });
  });

  describe("with insertion handlers", () => {
    it.todo("drags within same tree");
    it.todo("drags to another tree");
    it.todo("drags outside");
    it.todo("drags inside");
    it.todo("drags multiple within in retained order (correct order)");
    it.todo("drags multiple within in retained order (inverse order)");
    it.todo("drags multiple within in retained order (scrambled order)");
  });

  describe("special cases", () => {
    it.todo("drops at bottom of tree");
  });

  describe("drop redirection", () => {
    it.todo("redirects to parent folder without inbetween dropping");
    it.todo("doesnt redirect to parent folder with inbetween dropping");
  });

  describe("dnd restrictions", () => {
    it.todo("cannot drop on self");
    it.todo("does not reparent into itself");
    it.todo("does not reparent in the middle of a subtree");
    it.todo("does not reparent at top of a subtree");
    it.todo("cannot drop on item with canDrop=false");
    it.todo("cannot drag item with canDrag=false");
    it.todo("cannot drop foreign object with canDropForeignDragObject=false");
    it.todo("cancels drag");
    it.todo("drags prev selected if drag started with ctrl click");
    it.todo("doesnt drag prev selected if drag started with non-ctrl click");
    it.todo("doesnt drop if dragged outside of tree");
    it.todo("doesnt drop if dragged from valid to invalid position");
  });

  describe("item instance methods", () => {
    it.todo("returns isDropTarget() correct for true");
    it.todo("returns isDropTarget() correct for false");
    it.todo("returns isDraggingOver() correct for true");
    it.todo("returns isDraggingOver() correct for false");
  });

  describe.todo("retains last drag state with dragcode");
  // });
});
