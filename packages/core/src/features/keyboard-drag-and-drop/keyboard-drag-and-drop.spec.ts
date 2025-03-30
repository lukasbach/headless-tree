import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { selectionFeature } from "../selection/feature";
import { ItemInstance } from "../../types/core";
import { propMemoizationFeature } from "../prop-memoization/feature";
import { keyboardDragAndDropFeature } from "./feature";
import { dragAndDropFeature } from "../drag-and-drop/feature";
import { AssistiveDndState } from "./types";

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
}).withFeatures(
  selectionFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
  propMemoizationFeature,
);

describe("core-feature/keyboard-drag-and-drop", () => {
  factory.forSuits((tree) => {
    describe("happy paths", () => {
      it("correct initial state", () => {
        tree.do.selectMultiple("x111", "x112");
        tree.do.hotkey("startDrag");
        tree.expect.substate("dnd", {
          dragTarget: {
            childIndex: 2,
            dragLineIndex: 4,
            dragLineLevel: 2,
            insertionIndex: 0,
            item: tree.item("x11"),
          },
          draggedItems: [tree.item("x111"), tree.item("x112")],
        });
        tree.expect.substate("assistiveDndState", AssistiveDndState.Started);
      });

      it("moves down 1", () => {
        tree.do.selectMultiple("x111", "x112");
        tree.do.hotkey("startDrag");
        tree.do.hotkey("dragDown");
        tree.expect.substate("dnd", {
          dragTarget: {
            childIndex: 3,
            dragLineIndex: 5,
            dragLineLevel: 2,
            insertionIndex: 1,
            item: tree.item("x11"),
          },
          draggedItems: [tree.item("x111"), tree.item("x112")],
        });
        tree.expect.substate("assistiveDndState", AssistiveDndState.Dragging);
      });

      it("moves down 2", () => {
        tree.do.selectMultiple("x111", "x112");
        tree.do.hotkey("startDrag");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.expect.substate("dnd", {
          dragTarget: {
            childIndex: 4,
            dragLineIndex: 6,
            dragLineLevel: 2,
            insertionIndex: 2,
            item: tree.item("x11"),
          },
          draggedItems: [tree.item("x111"), tree.item("x112")],
        });
        tree.expect.substate("assistiveDndState", AssistiveDndState.Dragging);
      });

      it("reparent down", () => {
        tree.do.selectMultiple("x111", "x112");
        tree.do.hotkey("startDrag");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.expect.substate("dnd", {
          dragTarget: {
            childIndex: 1,
            dragLineIndex: 6,
            dragLineLevel: 1,
            insertionIndex: 1,
            item: tree.item("x1"),
          },
          draggedItems: [tree.item("x111"), tree.item("x112")],
        });
      });

      it("doesn't reparent further", () => {
        tree.do.selectMultiple("x111", "x112");
        tree.do.hotkey("startDrag");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.expect.substate("dnd", {
          dragTarget: { item: tree.item("x12") },
          draggedItems: [tree.item("x111"), tree.item("x112")],
        });
      });

      it("reparent back up", () => {
        tree.do.selectMultiple("x111", "x112");
        tree.do.hotkey("startDrag");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragDown");
        tree.do.hotkey("dragUp");
        tree.expect.substate("dnd", {
          dragTarget: {
            childIndex: 4,
            dragLineIndex: 6,
            dragLineLevel: 2,
            insertionIndex: 2,
            item: tree.item("x11"),
          },
          draggedItems: [tree.item("x111"), tree.item("x112")],
        });
      });
    });

    describe.todo("dropping");
    describe.todo("cancel drag");
    describe.todo("foreign drag in");
    describe.todo("foreign drag out");
    describe.todo("can drag");
    describe.todo("can drop");
  });
});
