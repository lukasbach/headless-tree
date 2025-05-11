import { describe, expect, it } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { checkboxesFeature } from "./feature";
import { CheckedState } from "./types";

const factory = TestTree.default({})
  .withFeatures(checkboxesFeature)
  .suits.sync().tree;

describe("core-feature/checkboxes", () => {
  it("should initialize with no checked items", async () => {
    const tree = await factory.createTestCaseTree();
    expect(tree.instance.getState().checkedItems).toEqual([]);
  });

  it("should check items", async () => {
    const tree = await factory.createTestCaseTree();
    tree.item("x111").setChecked();
    tree.item("x112").setChecked();
    expect(tree.instance.getState().checkedItems).toEqual(["x111", "x112"]);
  });

  it("should uncheck an item", async () => {
    const tree = await factory
      .with({ state: { checkedItems: ["x111"] } })
      .createTestCaseTree();
    tree.item("x111").setUnchecked();
    expect(tree.instance.getState().checkedItems).not.toContain("x111");
  });

  it("should toggle checked state", async () => {
    const tree = await factory.createTestCaseTree();
    const item = tree.item("x111");

    item.toggleCheckedState();
    expect(tree.instance.getState().checkedItems).toContain("x111");

    item.toggleCheckedState();
    expect(tree.instance.getState().checkedItems).not.toContain("x111");
  });

  describe("props", () => {
    it("should toggle checked state", async () => {
      const tree = await factory.createTestCaseTree();
      const item = tree.item("x111");

      item.getCheckboxProps().onChange();
      expect(tree.instance.getState().checkedItems).toContain("x111");

      item.getCheckboxProps().onChange();
      expect(tree.instance.getState().checkedItems).not.toContain("x111");
    });

    it("should return checked state in props", async () => {
      const tree = await factory.createTestCaseTree();
      tree.item("x111").setChecked();
      expect(tree.item("x111").getCheckboxProps().checked).toBe(true);
      expect(tree.item("x112").getCheckboxProps().checked).toBe(false);
    });

    it("should create indeterminate state", async () => {
      const tree = await factory.createTestCaseTree();
      tree.item("x111").setChecked();
      const refObject = { indeterminate: undefined };
      tree.item("x11").getCheckboxProps().ref(refObject);
      expect(refObject.indeterminate).toBe(true);
    });

    it("should not create indeterminate state", async () => {
      const tree = await factory.createTestCaseTree();
      const refObject = { indeterminate: undefined };
      tree.item("x11").getCheckboxProps().ref(refObject);
      expect(refObject.indeterminate).toBe(false);
    });
  });

  it("should handle folder checking when canCheckFolders is true", async () => {
    const tree = await factory
      .with({ canCheckFolders: true })
      .createTestCaseTree();

    tree.item("x11").setChecked();
    expect(tree.instance.getState().checkedItems).toContain("x11");
  });

  it("should handle folder checking when canCheckFolders is false", async () => {
    const tree = await factory.createTestCaseTree();

    tree.item("x11").setChecked();
    expect(tree.instance.getState().checkedItems).toEqual(
      expect.arrayContaining(["x111", "x112", "x113", "x114"]),
    );
  });

  it("should turn folder indeterminate", async () => {
    const tree = await factory.createTestCaseTree();

    tree.item("x111").setChecked();
    expect(tree.item("x11").getCheckedState()).toBe(CheckedState.Indeterminate);
  });

  it("should turn folder checked if all children are checked", async () => {
    const tree = await factory
      .with({
        isItemFolder: (item) => item.getItemData().length < 4,
      })
      .createTestCaseTree();

    tree.item("x11").setChecked();
    tree.item("x12").setChecked();
    tree.item("x13").setChecked();
    expect(tree.item("x1").getCheckedState()).toBe(CheckedState.Indeterminate);
    tree.do.selectItem("x14");
    tree.item("x141").setChecked();
    tree.item("x142").setChecked();
    tree.item("x143").setChecked();
    expect(tree.item("x1").getCheckedState()).toBe(CheckedState.Indeterminate);
    tree.item("x144").setChecked();
    expect(tree.item("x1").getCheckedState()).toBe(CheckedState.Checked);
  });

  it("should return correct checked state for items", async () => {
    const tree = await factory.createTestCaseTree();
    const item = tree.instance.getItemInstance("x111");

    expect(item.getCheckedState()).toBe(CheckedState.Unchecked);

    item.setChecked();
    expect(item.getCheckedState()).toBe(CheckedState.Checked);

    item.setUnchecked();
    expect(item.getCheckedState()).toBe(CheckedState.Unchecked);
  });
});
