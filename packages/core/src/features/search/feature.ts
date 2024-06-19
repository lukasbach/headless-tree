import { FeatureImplementation } from "../../types/core";
import { SearchFeatureDataRef, SearchFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { makeStateUpdater, memo } from "../../utils";

export const searchFeature: FeatureImplementation<
  any,
  SearchFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | SearchFeatureDef<any>
> = {
  key: "search",

  getInitialState: (initialState) => ({
    search: null,
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setSearch: makeStateUpdater("search", tree),
    isSearchMatchingItem: (search, item) =>
      search.length > 0 &&
      item.getItemName().toLowerCase().includes(search.toLowerCase()),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    search: "setSearch",
  },

  treeInstance: {
    setSearch: ({ tree }, search) => {
      tree.applySubStateUpdate("search", search);
      tree
        .getItems()
        .find((item) =>
          tree.getConfig().isSearchMatchingItem?.(tree.getSearchValue(), item),
        )
        ?.setFocused();
    },
    openSearch: ({ tree }, initialValue = "") => {
      tree.setSearch(initialValue);
      setTimeout(() => {
        tree.getDataRef<SearchFeatureDataRef>().current.searchInput?.focus();
      });
    },
    closeSearch: ({ tree }) => {
      tree.setSearch(null);
      tree.updateDomFocus();
    },
    isSearchOpen: ({ tree }) => tree.getState().search !== null,
    getSearchValue: ({ tree }) => tree.getState().search || "",
    registerSearchInputElement: ({ tree }, element) => {
      const dataRef = tree.getDataRef<SearchFeatureDataRef>();
      dataRef.current.searchInput = element;
      if (element && dataRef.current.keydownHandler) {
        element.addEventListener("keydown", dataRef.current.keydownHandler);
      }
    },
    getSearchInputElement: ({ tree }) =>
      tree.getDataRef<SearchFeatureDataRef>().current.searchInput ?? null,

    getSearchInputElementProps: ({ tree }) => ({
      value: tree.getSearchValue(),
      onChange: (e: any) => tree.setSearch(e.target.value),
      onBlur: () => tree.closeSearch(),
    }),

    getSearchMatchingItems: memo(
      (search, items, isSearchMatchingItem) =>
        items.filter((item) => search && isSearchMatchingItem?.(search, item)),
      ({ tree }) => [
        tree.getSearchValue(),
        tree.getItems(),
        tree.getConfig().isSearchMatchingItem,
      ],
    ),
  },

  itemInstance: {
    isMatchingSearch: ({ tree, item }) =>
      tree.getSearchMatchingItems().some((i) => i.getId() === item.getId()),
  },

  hotkeys: {
    openSearch: {
      hotkey: "LetterOrNumber",
      preventDefault: true, // TODO make true default
      isEnabled: (tree) => !tree.isSearchOpen(),
      handler: (e, tree) => {
        e.stopPropagation();
        tree.openSearch(e.key);
      },
    },

    closeSearch: {
      // TODO allow multiple, i.e. Enter
      hotkey: "Escape",
      allowWhenInputFocused: true,
      isEnabled: (tree) => tree.isSearchOpen(),
      handler: (e, tree) => {
        tree.closeSearch();
      },
    },

    submitSearch: {
      hotkey: "Enter",
      allowWhenInputFocused: true,
      isEnabled: (tree) => tree.isSearchOpen(),
      handler: (e, tree) => {
        tree.closeSearch();
        tree.setSelectedItems([tree.getFocusedItem().getId()]);
      },
    },

    nextSearchItem: {
      hotkey: "ArrowDown",
      allowWhenInputFocused: true,
      canRepeat: true,
      isEnabled: (tree) => tree.isSearchOpen(),
      handler: (e, tree) => {
        const focusItem = tree
          .getSearchMatchingItems()
          .find(
            (item) =>
              item.getItemMeta().index >
              tree.getFocusedItem().getItemMeta().index,
          );
        focusItem?.setFocused();
        focusItem?.scrollTo({ block: "nearest", inline: "nearest" });
      },
    },

    previousSearchItem: {
      hotkey: "ArrowUp",
      allowWhenInputFocused: true,
      canRepeat: true,
      isEnabled: (tree) => tree.isSearchOpen(),
      handler: (e, tree) => {
        const focusItem = [...tree.getSearchMatchingItems()]
          .reverse()
          .find(
            (item) =>
              item.getItemMeta().index <
              tree.getFocusedItem().getItemMeta().index,
          );
        focusItem?.setFocused();
        focusItem?.scrollTo({ block: "nearest", inline: "nearest" });
      },
    },
  },
};
