import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { dragAndDropFeature } from "./feature";
import { selectionFeature } from "../selection/feature";
import { ItemInstance } from "../../types/core";
import { createOnDropHandler } from "../../utilities/create-on-drop-handler";
import { propMemoizationFeature } from "../prop-memoization/feature";

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
}).withFeatures(selectionFeature, dragAndDropFeature, propMemoizationFeature);

describe("core-feature/drag-and-drop", () => {
  factory.forSuits((tree) => {
    describe("happy paths", () => {
      it("drop on expanded folder with leafs", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.do.dragOverAndDrop("x21");
        tree.expect.dropped(["x111"], {
          item: tree.item("x21"),
        });
      });

      it("drop on expanded folder with nested items", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.do.dragOverAndDrop("x2");
        tree.expect.dropped(["x111"], {
          item: tree.item("x2"),
        });
      });

      it("drop on collapsed folder", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.do.dragOverAndDrop("x12");
        tree.expect.dropped(["x111"], {
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

      it("drop reparented one level", async () => {
        tree.item("x14").expand();
        await tree.resolveAsyncVisibleItems();
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.setElementBoundingBox("x144");
        const event = tree.createBottomDragEvent(1);
        tree.do.dragOverAndDrop("x144", event);
        tree.expect.dropped(["x111"], {
          dragLineIndex: 13,
          dragLineLevel: 1,
          childIndex: 4,
          insertionIndex: 4,
          item: tree.item("x1"),
        });
      });

      it("drop reparented two levels", async () => {
        tree.item("x14").expand();
        await tree.resolveAsyncVisibleItems();
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.setElementBoundingBox("x144");
        const event = tree.createBottomDragEvent(0);
        tree.do.dragOverAndDrop("x144", event);
        tree.expect.dropped(["x111"], {
          dragLineIndex: 13,
          dragLineLevel: 0,
          childIndex: 1,
          insertionIndex: 1,
          item: tree.item("x"),
        });
      });

      it("doesnt drop reparented higher than it can", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.setElementBoundingBox("x114");
        const event = tree.createBottomDragEvent(0);
        tree.do.dragOverAndDrop("x114", event);
        tree.expect.dropped(["x111"], {
          dragLineIndex: 6,
          dragLineLevel: 1,
          childIndex: 1,
          insertionIndex: 1,
          item: tree.item("x1"),
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
          item: tree.item("x21"),
        });
      });

      it("updates dnd state", () => {
        const setDndState = tree.mockedHandler("setDndState");
        tree.do.startDrag("x111");
        expect(setDndState).toBeCalledWith({
          draggedItems: [tree.item("x111")],
          draggingOverItem: tree.item("x1"),
        });
        tree.do.dragOver("x21");
        expect(setDndState).toBeCalledWith({
          draggedItems: [tree.item("x111")],
          draggingOverItem: tree.item("x21"),
          dragTarget: {
            item: tree.item("x21"),
          },
        });
        tree.do.drop("x22");
        expect(setDndState).toBeCalledWith(null);
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
        expect(tree.instance.getDragLineStyle(0, 0)).toEqual({
          display: "none",
        });
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

      it("drop reparented two levels", async () => {
        tree.item("x14").expand();
        await tree.resolveAsyncVisibleItems();
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        const event = tree.createBottomDragEvent(0);
        tree.setElementBoundingBox("x2");
        tree.setElementBoundingBox("x144");
        tree.do.dragOver("x144", event);
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
        expect(onDropForeignDragObject).toHaveBeenCalledWith(
          event.dataTransfer,
          {
            item: tree.item("x11"),
          },
        );
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
        expect(onDropForeignDragObject).toHaveBeenCalledWith(
          event.dataTransfer,
          {
            childIndex: 2,
            dragLineIndex: 4,
            dragLineLevel: 2,
            insertionIndex: 2,
            item: tree.item("x11"),
          },
        );
      });

      it("doesnt drag foreign object inside tree if not allowed", () => {
        tree.mockedHandler("canDropForeignDragObject").mockReturnValue(false);
        const onDropForeignDragObject = tree.mockedHandler(
          "onDropForeignDragObject",
        );
        const event = TestTree.dragEvent();
        tree.do.dragOverNotAllowed("x11", event);
        tree.do.drop("x11", event);
        expect(onDropForeignDragObject).not.toHaveBeenCalled();
      });
    });

    describe("with insertion handlers", () => {
      const changeChildren = vi.fn();
      const suiteTree = tree.with({
        onDrop: createOnDropHandler((item, newChildren) => {
          changeChildren(item.getId(), newChildren);
        }),
      });

      suiteTree.resetBeforeEach();

      it("drags within same tree on expanded folder", async () => {
        suiteTree.do.selectMultiple("x111", "x112");
        suiteTree.do.startDrag("x111");
        await suiteTree.do.dragOverAndDrop("x21");
        expect(changeChildren).toHaveBeenCalledWith("x11", ["x113", "x114"]);
        expect(changeChildren).toHaveBeenCalledWith("x21", [
          "x211",
          "x212",
          "x213",
          "x214",
          "x111",
          "x112",
        ]);
      });

      it("drags within same tree on collapsed folder", async () => {
        suiteTree.do.selectMultiple("x111", "x112");
        suiteTree.do.startDrag("x111");
        suiteTree.do.dragOverAndDrop("x22");
        await suiteTree.resolveAsyncVisibleItems();
        expect(changeChildren).toHaveBeenCalledWith("x11", ["x113", "x114"]);
        expect(changeChildren).toHaveBeenCalledWith("x22", [
          "x221",
          "x222",
          "x223",
          "x224",
          "x111",
          "x112",
        ]);
      });

      it("drags within same tree inside folder", async () => {
        suiteTree.do.selectMultiple("x111", "x112");
        suiteTree.do.startDrag("x111");
        await suiteTree.do.dragOverAndDrop(
          "x212",
          suiteTree.createBottomDragEvent(2),
        );
        expect(changeChildren).toHaveBeenCalledWith("x11", ["x113", "x114"]);
        expect(changeChildren).toHaveBeenCalledWith("x21", [
          "x211",
          "x212",
          "x111",
          "x112",
          "x213",
          "x214",
        ]);
      });

      it("drags within one folder", () => {
        if (!("invalidateItemData" in suiteTree.instance)) {
          // since sync trees don't reflect changes in children, this test
          // doesn't work for them
          return;
        }

        suiteTree.do.selectMultiple("x111", "x112");
        suiteTree.do.startDrag("x111");
        suiteTree.do.dragOverAndDrop(
          "x113",
          suiteTree.createBottomDragEvent(2),
        );
        expect(changeChildren).toHaveBeenCalledWith("x11", [
          "x113",
          "x111",
          "x112",
          "x114",
        ]);
      });

      it("drags outside", () => {
        const createForeignDragObject = suiteTree
          .mockedHandler("createForeignDragObject")
          .mockReturnValue({ format: "format", data: "data" });
        const onCompleteForeignDrop = suiteTree.mockedHandler(
          "onCompleteForeignDrop",
        );
        suiteTree.do.selectMultiple("x111", "x112");
        const e = suiteTree.do.startDrag("x111");
        expect(e.dataTransfer.setData).toHaveBeenCalledWith("format", "data");
        expect(createForeignDragObject).toHaveBeenCalledWith([
          suiteTree.item("x111"),
          suiteTree.item("x112"),
        ]);
        suiteTree.do.dragEnd("x111");
        expect(onCompleteForeignDrop).toHaveBeenCalledWith([
          suiteTree.item("x111"),
          suiteTree.item("x112"),
        ]);
      });

      it("drags inside if allowed", () => {
        suiteTree
          .mockedHandler("canDropForeignDragObject")
          .mockReturnValue(true);
        const onDropForeignDragObject = suiteTree.mockedHandler(
          "onDropForeignDragObject",
        );
        const e = TestTree.dragEvent();
        suiteTree.do.drop("x21", e);
        expect(onDropForeignDragObject).toBeCalledWith(e.dataTransfer, {
          item: suiteTree.item("x21"),
        });
      });

      it("doesnt drag inside if not allowed", () => {
        suiteTree
          .mockedHandler("canDropForeignDragObject")
          .mockReturnValue(false);
        const onDropForeignDragObject = suiteTree.mockedHandler(
          "onDropForeignDragObject",
        );
        const e = TestTree.dragEvent();
        suiteTree.do.drop("x21", e);
        expect(onDropForeignDragObject).not.toHaveBeenCalled();
      });

      it("drags multiple within in retained order (correct order)", async () => {
        suiteTree.do.selectMultiple("x111", "x112", "x113", "x114");
        suiteTree.do.startDrag("x111");
        await suiteTree.do.dragOverAndDrop(
          "x212",
          suiteTree.createBottomDragEvent(),
        );
        expect(changeChildren).toHaveBeenCalledWith("x11", []);
        expect(changeChildren).toHaveBeenCalledWith("x21", [
          "x211",
          "x212",
          "x111",
          "x112",
          "x113",
          "x114",
          "x213",
          "x214",
        ]);
      });

      it("drags multiple within in retained order (inverse order)", async () => {
        suiteTree.do.selectMultiple("x114", "x113", "x112", "x111");
        suiteTree.do.startDrag("x111");
        await suiteTree.do.dragOverAndDrop(
          "x212",
          suiteTree.createBottomDragEvent(),
        );
        expect(changeChildren).toHaveBeenCalledWith("x11", []);
        expect(changeChildren).toHaveBeenCalledWith("x21", [
          "x211",
          "x212",
          "x114",
          "x113",
          "x112",
          "x111",
          "x213",
          "x214",
        ]);
      });

      it("drags multiple within in retained order (scrambled order)", async () => {
        suiteTree.do.selectMultiple("x111", "x114", "x112", "x113");
        suiteTree.do.startDrag("x111");
        await suiteTree.do.dragOverAndDrop(
          "x212",
          suiteTree.createBottomDragEvent(),
        );
        expect(changeChildren).toHaveBeenCalledWith("x11", []);
        expect(changeChildren).toHaveBeenCalledWith("x21", [
          "x211",
          "x212",
          "x111",
          "x114",
          "x112",
          "x113",
          "x213",
          "x214",
        ]);
      });
    });

    describe("special cases", () => {
      it.todo("drops at bottom of tree");
    });

    describe("drop redirection", () => {
      it("redirects to parent folder without inbetween dropping", async () => {
        const testTree = await tree
          .with({ canReorder: false })
          .createTestCaseTree();
        testTree.do.startDrag("x111");
        testTree.do.dragOverAndDrop("x212", testTree.createBottomDragEvent(2));
        testTree.expect.dropped(["x111"], {
          item: tree.item("x21"),
        });
      });

      it("doesnt redirect to parent folder with inbetween dropping", async () => {
        const testTree = await tree
          .with({ canReorder: true })
          .createTestCaseTree();
        testTree.do.startDrag("x111");
        testTree.do.dragOverAndDrop("x212", testTree.createBottomDragEvent(2));
        testTree.expect.dropped(["x111"], {
          childIndex: 2,
          dragLineIndex: 13,
          dragLineLevel: 2,
          insertionIndex: 2,
          item: tree.item("x21"),
        });
      });
    });

    describe("dnd restrictions", () => {
      it.todo("cannot drop on self", () => {
        tree.do.startDrag("x11");
        tree.expect.dragOverNotAllowed("x112");
      });

      it.todo("cannot drop on self, nested additional layer", () => {
        tree.do.startDrag("x1");
        tree.expect.dragOverNotAllowed("x112");
      });

      it.todo("does not reparent into itself", () => {
        tree.do.startDrag("x11");
        tree.setElementBoundingBox("x114");
        const event = tree.createBottomDragEvent(1);
        tree.expect.dragOverNotAllowed("x114", event);
      });

      it.for([0, 1, 2])("does not reparent at level %i of a subtree", (i) => {
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.setElementBoundingBox("x112");
        const event = tree.createBottomDragEvent(i);
        tree.do.dragOverAndDrop("x112", event);
        tree.expect.dropped(["x111"], {
          dragLineIndex: 4,
          dragLineLevel: 2,
          childIndex: 2,
          insertionIndex: 1,
          item: tree.item("x11"),
        });
      });

      it("cannot drop on item with canDrop=false", () => {
        const canDrop = tree.mockedHandler("canDrop").mockReturnValue(false);
        tree.do.startDrag("x111");
        tree.expect.dragOverNotAllowed("x2");
        expect(canDrop).toHaveBeenCalledWith([tree.item("x111")], {
          item: tree.item("x2"),
        });
      });

      it("item with canDrag=false does not invoke drag handler when dragged", () => {
        const canDrag = tree.mockedHandler("canDrag").mockReturnValue(false);
        const setDndState = tree.mockedHandler("setDndState");
        const e = TestTree.dragEvent();
        tree.instance.getItemInstance("x111").getProps().onDragStart(e);
        expect(canDrag).toHaveBeenCalledWith([tree.item("x111")]);
        expect(e.preventDefault).toBeCalled();
        expect(setDndState).not.toBeCalled();
      });

      it.todo("cancels drag");

      it("drags all selected if drag is started within selection", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.ctrlSelectItem("x112");
        tree.do.ctrlSelectItem("x113");
        tree.do.startDrag("x111");
        tree.do.dragOverAndDrop("x21");
        tree.expect.dropped(["x111", "x112", "x113"], {
          item: tree.item("x21"),
        });
      });

      it("drags all only new item if drag is started outside previous selection", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.ctrlSelectItem("x112");
        tree.do.ctrlSelectItem("x113");
        tree.do.startDrag("x114");
        tree.do.dragOverAndDrop("x21");
        tree.expect.dropped(["x114"], {
          item: tree.item("x21"),
        });
      });
    });

    describe("item instance methods", () => {
      it("returns isDragTarget() correct for folders", () => {
        tree.do.startDrag("x111");
        tree.do.dragOver("x21");
        expect(tree.instance.getItemInstance("x21").isDragTarget()).toBe(true);
        expect(tree.instance.getItemInstance("x211").isDragTarget()).toBe(
          false,
        );
      });

      it("returns isDragTarget() correct for items", () => {
        tree.do.startDrag("x111");
        tree.do.dragOver("x211");
        expect(tree.instance.getItemInstance("x21").isDragTarget()).toBe(true);
        expect(tree.instance.getItemInstance("x211").isDragTarget()).toBe(
          false,
        );
      });

      it("returns isDraggingOver() correct for folders", () => {
        tree.do.startDrag("x111");
        tree.do.dragOver("x21");
        expect(tree.instance.getItemInstance("x21").isDraggingOver()).toBe(
          true,
        );
        expect(tree.instance.getItemInstance("x211").isDraggingOver()).toBe(
          false,
        );
      });

      it("returns isDraggingOver() correct for items", () => {
        tree.do.startDrag("x111");
        tree.do.dragOver("x211");
        expect(tree.instance.getItemInstance("x211").isDraggingOver()).toBe(
          true,
        );
        expect(tree.instance.getItemInstance("x21").isDraggingOver()).toBe(
          false,
        );
      });
    });

    describe("retains last drag state with dragcode", () => {
      it("uses constant number of calls to canDrop", () => {
        const canDrop = tree.mockedHandler("canDrop").mockReturnValue(true);
        tree.do.startDrag("x111");
        Array.from({ length: 30 }).forEach(() => {
          tree.do.dragOver("x12");
        });
        expect(canDrop).toBeCalledTimes(3);
      });
    });
  });
});
