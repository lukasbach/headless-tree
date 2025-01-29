import { describe, it } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { dragAndDropFeature } from "./feature";

const factory = TestTree.default({}).withFeatures(dragAndDropFeature);

describe("core-feature/drag-and-drop", () => {
  factory.forSuits((tree) => {
    describe("happy paths", () => {
      it.todo("drop on expanded folder");
      it.todo("drop on collapsed folder");
      it.todo("drop above item");
      it.todo("drop below item");
      it.todo("drop reparented one level");
      it.todo("drop reparented two levels");
      it.todo("drags multiple in retained order (correct order)");
      it.todo("drags multiple in retained order (inverse order)");
      it.todo("drags multiple in retained order (scrambled order)");
    });

    describe("drag lines for happy paths", () => {
      it.todo("drop on expanded folder");
      it.todo("drop on collapsed folder");
      it.todo("drop above item");
      it.todo("drop below item");
      it.todo("drop reparented one level");
      it.todo("drop reparented two levels");
      it.todo("drop reparented to root level");
    });

    describe("foreign dnd", () => {
      it.todo("drags tree item outside to foreign object");
      it.todo("drags foreign object inside tree, on folder");
      it.todo("drags foreign object inside tree, between items");
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
  });
});
