import { FeatureImplementation, ItemInstance } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { CheckboxesState, CheckedState } from "./types";

const without = (array: string[], value: string) => {
  const index = array.indexOf(value);
  if (index === -1) return array;
  const newArray = [...array];
  newArray.splice(index, 1);
  return newArray;
};

const findParent = <T>(
  item: ItemInstance<T>,
  fn: (item: ItemInstance<T>) => boolean | undefined | null,
) => {
  let iter: ItemInstance<T> | undefined = item;
  do {
    iter = iter.getParent();
    if (iter && fn(iter)) return iter;
  } while (iter);
  return false;
};

const fixParentStates = <T>(state: CheckboxesState, item: ItemInstance<T>) => {
  const children = item.getChildren()?.map((child) => child.getId()) ?? [];
  if (children.every((child) => state.checkedItems?.includes(child))) {
    state.checkedItems = [...children, item.getId()];
  } else if (
    children.some(
      (child) =>
        state.checkedItems?.includes(child) ||
        state.indeterminates?.includes(child),
    )
  ) {
    state.indeterminates = [...children, item.getId()];
    return CheckedState.Indeterminate;
  } else {
    state.checkedItems = [...children, item.getId()];
  }

  return 123;
};

const getFullState = (state: CheckboxesState) => ({
  checkedItems: [],
  uncheckedItems: [],
  checkedFolders: [],
  indeterminates: [],
  ...state,
});

export const checkboxesFeature: FeatureImplementation = {
  key: "checkboxes",

  overwrites: ["selection"],

  getInitialState: (initialState) => ({
    checkedState: {},
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setCheckedState: makeStateUpdater("checkedState", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    checkedState: "setCheckedState",
  },

  treeInstance: {
    setCheckedState: ({ tree }, checkedState) => {
      tree.applySubStateUpdate("checkedState", checkedState);
    },
  },

  itemInstance: {
    getCheckboxProps: ({ item }) => {
      const checkedState = item.getCheckedState();
      return {
        onChange: item.toggleCheckedState,
        checked: checkedState === CheckedState.Checked,
        ref: (r: any) => {
          if (r) {
            r.indeterminate = checkedState === CheckedState.Indeterminate;
          }
        },
      };
    },

    toggleCheckedState: ({ item }) => {
      if (item.getCheckedState() === CheckedState.Checked) {
        item.setUnchecked();
      } else {
        item.setChecked();
      }
    },

    getCheckedState: ({ item, tree, itemId }) => {
      const state = tree.getState().checkedState;
      if (state.indeterminates?.includes(itemId)) {
        return CheckedState.Indeterminate;
      }

      if (state.checkedFolders?.includes(itemId)) {
        return CheckedState.Checked;
      }

      if (state.checkedItems?.includes(itemId)) {
        return CheckedState.Checked;
      }

      if (
        !state.uncheckedItems?.includes(itemId) &&
        state.checkedFolders?.some((folder) => item.isDescendentOf(folder))
      ) {
        return CheckedState.Checked;
      }

      return CheckedState.Unchecked;
    },

    setChecked: ({ item, tree, itemId }, inherit = true) => {
      const state = tree.getState().checkedState;
      state.uncheckedItems = without(state.uncheckedItems ?? [], itemId);
      state.indeterminates = without(state.uncheckedItems ?? [], itemId);

      if (item.isFolder() && inherit) {
        state.checkedFolders = [...(state.checkedFolders ?? []), itemId];
      } else {
        state.checkedItems = [...(state.checkedItems ?? []), itemId];
      }

      tree.setCheckedState(state);
    },

    setUnchecked: ({ item, tree, itemId }, inherit = true) => {
      const state = getFullState(tree.getState().checkedState);
      state.checkedFolders = without(state.checkedFolders, itemId);
      state.checkedItems = without(state.checkedItems, itemId);

      const checkedParent = findParent(item, (i) =>
        state.checkedFolders?.includes(i.getId()),
      );
      if (checkedParent) {
        state.indeterminates = [...state.indeterminates, checkedParent.getId()];
      }

      if (item.isFolder() && inherit) {
        state.checkedItems = state.checkedItems.filter((item) =>
          tree.getItemInstance(item)?.isDescendentOf(itemId),
        );
        state.checkedFolders = state.checkedFolders.filter((item) =>
          tree.getItemInstance(item)?.isDescendentOf(itemId),
        );
      } else {
        state.uncheckedItems = [...state.checkedItems, itemId];
      }

      tree.setCheckedState(state);
    },
  },
};
