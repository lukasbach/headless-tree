import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { selectionFeature } from "../selection/feature";
import { ItemInstance } from "../../types/core";
import { propMemoizationFeature } from "../prop-memoization/feature";
import { keyboardDragAndDropFeature } from "./feature";
import { dragAndDropFeature } from "../drag-and-drop/feature";

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
      it("drop on expanded folder with leafs", () => {
        tree.do.ctrlSelectItem("x111");
        tree.do.startDrag("x111");
        tree.do.dragOverAndDrop("x21");
        tree.expect.dropped(["x111"], {
          item: tree.item("x21"),
        });
      });
    });
  });
});
