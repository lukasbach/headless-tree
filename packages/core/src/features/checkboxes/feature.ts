import { FeatureImplementation, ItemInstance } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { CheckboxesState, CheckedState } from "./types";

/*
 * Cases for checking:
 * - Check an unchecked item in an unchecked or indeterminate folder
 * - Check an explicitly unchecked item in a checked folder
 * - Check an unchecked folder in an unchecked or indeterminate folder
 *
 * Cases for unchecking:
 * - Uncheck a checked item in an indeterminate folder
 * - Uncheck an explicitly unchecked item in an checked folder
 */

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

const forEachParent = <T>(
  parent: ItemInstance<T>,
  fn: (item: ItemInstance<T>) => void,
) => {
  fn(parent);
  const next = parent.getParent();
  if (next) {
    forEachParent(next, fn);
  }
};
const getFullState = (state: CheckboxesState) => ({
  checkedItems: [],
  uncheckedItems: [],
  checkedFolders: [],
  indeterminates: [],
  ...state,
});

const isChecked = (checkboxesState: CheckboxesState, itemId: string) => {
  return (
    checkboxesState.checkedItems?.includes(itemId) &&
    checkboxesState.uncheckedItems?.includes(itemId)
  );
};

const fixParentStates = <T>(
  checkboxesState: CheckboxesState,
  item?: ItemInstance<T>,
) => {
  if (!item) return;
  const state = getFullState(checkboxesState);
  console.log("FIX PARENTS", item.getId());

  const children = item.getChildren() ?? [];
  const childrenIds = children.map((child) => child.getId());
  if (isChecked(state, item.getId())) {
    state.checkedItems = [...state.checkedItems, item.getId()];
  }
  if (
    children.every((child) =>
      child.isFolder()
        ? isChecked(state, child.getId()) &&
          state.checkedFolders.includes(child.getId())
        : isChecked(state, child.getId()),
    )
  ) {
    console.log("!! checked all", item.getId());
    state.checkedFolders = [...state.checkedFolders, item.getId()];
    state.indeterminates = without(state.indeterminates, item.getId());
  } else if (
    children.some(
      (child) =>
        isChecked(state, child.getId()) ||
        state.indeterminates.includes(child.getId()),
    )
  ) {
    state.indeterminates = [...state.indeterminates, item.getId()];
  }

  fixParentStates(state, item.getParent());
};

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
      const state = getFullState(tree.getState().checkedState);

      if (item.isFolder() && inherit) {
        state.checkedFolders = [...state.checkedFolders, itemId];
      }

      if (state.uncheckedItems.includes(itemId)) {
        state.uncheckedItems = without(state.uncheckedItems, itemId);
        fixParentStates(state, item.getParent());
        tree.setCheckedState(state);
        return;
      }

      state.uncheckedItems = without(state.uncheckedItems, itemId);
      state.indeterminates = without(state.uncheckedItems, itemId);

      state.checkedItems = [...state.checkedItems, itemId];
      fixParentStates(state, item.getParent());
      tree.setCheckedState(state);
    },

    setUnchecked: ({ item, tree, itemId }, inherit = true) => {
      const state = getFullState(tree.getState().checkedState);

      const checkedParent = findParent(item, (i) =>
        state.checkedFolders?.includes(i.getId()),
      );
      if (checkedParent) {
        state.indeterminates = [...state.indeterminates, checkedParent.getId()];
        state.uncheckedItems = [...state.uncheckedItems, itemId];
        tree.setCheckedState(state);
        return;
      }

      state.checkedFolders = without(state.checkedFolders, itemId);
      state.checkedItems = without(state.checkedItems, itemId);

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

      fixParentStates(state, item.getParent());
      tree.setCheckedState(state);
    },
  },
};
