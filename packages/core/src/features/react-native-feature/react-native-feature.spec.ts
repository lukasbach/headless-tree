import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { checkboxesFeature } from "../checkboxes/feature";
import { renamingFeature } from "../renaming/feature";
import { searchFeature } from "../search/feature";
import { selectionFeature } from "../selection/feature";
import { syncDataLoaderFeature } from "../sync-data-loader/feature";
import { reactNativeFeature } from "./feature";

describe("react-native-feature", () => {
  it("remaps item click handling to onPress", async () => {
    const tree = await TestTree.default({})
      .withFeatures(syncDataLoaderFeature, selectionFeature, reactNativeFeature)
      .createTestCaseTree();

    const props = tree.item("x2").getProps();

    expect(props).not.toHaveProperty("onClick");
    expect(props).not.toHaveProperty("aria-selected");
    expect(props).not.toHaveProperty("aria-expanded");
    expect(props.accessibilityRole).toBe("treeitem");

    props.onPress({});

    expect(tree.item("x2").isSelected()).toBe(true);
    expect(tree.item("x2").isExpanded()).toBe(true);
  });

  it("handles hotkeys from container key events", async () => {
    const tree = await TestTree.default({})
      .withFeatures(syncDataLoaderFeature, selectionFeature, reactNativeFeature)
      .createTestCaseTree();

    const props = tree.instance.getContainerProps();
    const event = {
      nativeEvent: { key: "ArrowDown", code: "ArrowDown" },
      prevented: false,
      preventDefault() {
        if (this !== event) {
          throw new TypeError("Illegal invocation");
        }

        this.prevented = true;
      },
      stopPropagation: vi.fn(),
    };

    props.onKeyDown(event);

    expect(tree.instance.getFocusedItem().getId()).toBe("x11");
    expect(event.prevented).toBe(true);
  });

  it("remaps search, renaming, and checkbox props to react native handlers", async () => {
    const onRename = vi.fn();
    const tree = await TestTree.default({ onRename })
      .withFeatures(
        syncDataLoaderFeature,
        selectionFeature,
        searchFeature,
        renamingFeature,
        checkboxesFeature,
        reactNativeFeature,
      )
      .createTestCaseTree();

    tree.instance.openSearch();
    const searchProps = tree.instance.getSearchInputElementProps();
    expect(searchProps).not.toHaveProperty("onChange");
    searchProps.onChangeText("x12");
    expect(tree.instance.getSearchValue()).toBe("x12");
    searchProps.onSubmitEditing();
    expect(tree.instance.isSearchOpen()).toBe(false);

    tree.item("x1").startRenaming();
    const renameProps = tree.item("x1").getRenameInputProps();
    expect(renameProps).not.toHaveProperty("onChange");
    renameProps.onChangeText("renamed");
    expect(tree.instance.getRenamingValue()).toBe("renamed");
    renameProps.onSubmitEditing();
    expect(onRename).toHaveBeenCalledWith(expect.anything(), "renamed");

    const checkboxProps = tree.item("x111").getCheckboxProps();
    expect(checkboxProps).not.toHaveProperty("checked");
    expect(checkboxProps).not.toHaveProperty("onChange");
    checkboxProps.onValueChange(true);
    expect(tree.item("x111").getCheckedState()).toBe("checked");
  });
});
