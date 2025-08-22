import { describe, expect, it, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { checkboxesFeature } from "./feature";
import { CheckedState } from "./types";

const factory = TestTree.default({}).withFeatures(checkboxesFeature);

describe("core-feature/checkboxes", () => {
  factory.forSuits((tree) => {
    it("should initialize with no checked items", async () => {
      expect(tree.instance.getState().checkedItems).toEqual([]);
    });

    it("should check items", async () => {
      tree.item("x111").setChecked();
      tree.item("x112").setChecked();
      expect(tree.instance.getState().checkedItems).toEqual(["x111", "x112"]);
    });

    it("should uncheck an item", async () => {
      tree.item("x111").setChecked();
      tree.item("x111").setUnchecked();
      expect(tree.instance.getState().checkedItems).not.toContain("x111");
    });

    it("should toggle checked state", async () => {
      const item = tree.item("x111");
      item.toggleCheckedState();
      expect(tree.instance.getState().checkedItems).toContain("x111");
      item.toggleCheckedState();
      expect(tree.instance.getState().checkedItems).not.toContain("x111");
    });

    describe("props", () => {
      it("should toggle checked state", async () => {
        const item = tree.item("x111");
        item.getCheckboxProps().onChange();
        expect(tree.instance.getState().checkedItems).toContain("x111");
        item.getCheckboxProps().onChange();
        expect(tree.instance.getState().checkedItems).not.toContain("x111");
      });

      it("should return checked state in props", async () => {
        tree.item("x111").setChecked();
        expect(tree.item("x111").getCheckboxProps().checked).toBe(true);
        expect(tree.item("x112").getCheckboxProps().checked).toBe(false);
      });

      it("should create indeterminate state", async () => {
        tree.item("x111").setChecked();
        const refObject = { indeterminate: undefined };
        tree.item("x11").getCheckboxProps().ref(refObject);
        await vi.waitFor(() => expect(refObject.indeterminate).toBe(true));
      });

      it("should not create indeterminate state", async () => {
        const refObject = { indeterminate: undefined };
        tree.item("x11").getCheckboxProps().ref(refObject);
        expect(refObject.indeterminate).toBe(false);
      });
    });

    it("should handle folder checking", async () => {
      const testTree = await tree
        .with({ canCheckFolders: true, propagateCheckedState: false })
        .createTestCaseTree();
      testTree.item("x11").setChecked();
      expect(testTree.instance.getState().checkedItems).toContain("x11");
    });

    it("should not check folders if disabled", async () => {
      const testTree = await tree
        .with({ canCheckFolders: false, propagateCheckedState: false })
        .createTestCaseTree();
      testTree.item("x11").setChecked();
      expect(testTree.instance.getState().checkedItems.length).toBe(0);
    });

    it("should propagate checked state", async () => {
      const testTree = await tree
        .with({ propagateCheckedState: true })
        .createTestCaseTree();
      await testTree.item("x11").setChecked();
      expect(testTree.instance.getState().checkedItems).toEqual(
        expect.arrayContaining(["x111", "x112", "x113", "x114"]),
      );
    });

    it("should turn folder indeterminate", async () => {
      const testTree = await tree
        .with({ propagateCheckedState: true })
        .createTestCaseTree();
      testTree.item("x111").setChecked();
      expect(testTree.item("x11").getCheckedState()).toBe(
        CheckedState.Indeterminate,
      );
    });

    it("should turn folder checked if all children are checked", async () => {
      const testTree = await tree
        .with({
          isItemFolder: (item: any) => item.getItemData().length < 4,
          propagateCheckedState: true,
          canCheckFolders: false,
        })
        .createTestCaseTree();
      await testTree.item("x11").setChecked();
      await testTree.item("x12").setChecked();
      await testTree.item("x13").setChecked();
      expect(testTree.item("x1").getCheckedState()).toBe(
        CheckedState.Indeterminate,
      );
      testTree.do.selectItem("x14");
      await testTree.item("x141").setChecked();
      await testTree.item("x142").setChecked();
      await testTree.item("x143").setChecked();
      expect(testTree.item("x1").getCheckedState()).toBe(
        CheckedState.Indeterminate,
      );
      await testTree.item("x144").setChecked();
      expect(testTree.item("x1").getCheckedState()).toBe(CheckedState.Checked);
    });

    it("should return correct checked state for items", async () => {
      const item = tree.instance.getItemInstance("x111");
      expect(item.getCheckedState()).toBe(CheckedState.Unchecked);
      item.setChecked();
      expect(item.getCheckedState()).toBe(CheckedState.Checked);
      item.setUnchecked();
      expect(item.getCheckedState()).toBe(CheckedState.Unchecked);
    });
  });
});
