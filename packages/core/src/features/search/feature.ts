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
  dependingFeatures: ["main", "tree"],

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

  createTreeInstance: (prev, instance) => ({
    ...prev,

    setSearch: (search) => {
      instance.getConfig().setSearch?.(search);
      instance
        .getItems()
        .find((item) =>
          instance
            .getConfig()
            .isSearchMatchingItem?.(instance.getSearchValue(), item)
        )
        ?.setFocused();
    },
    openSearch: (initialValue = "") => {
      instance.setSearch(initialValue);
      setTimeout(() => {
        instance
          .getDataRef<SearchFeatureDataRef>()
          .current.searchInput?.focus();
      });
    },
    closeSearch: () => {
      instance.setSearch(null);
      instance.updateDomFocus();
    },
    isSearchOpen: () => instance.getState().search !== null,
    getSearchValue: () => instance.getState().search || "",
    registerSearchInputElement: (element) => {
      const dataRef = instance.getDataRef<SearchFeatureDataRef>();
      dataRef.current.searchInput = element;
      if (element && dataRef.current.keydownHandler) {
        element.addEventListener("keydown", dataRef.current.keydownHandler);
      }
    },
    getSearchInputElement: () =>
      instance.getDataRef<SearchFeatureDataRef>().current.searchInput ?? null,

    getSearchInputElementProps: () => ({
      value: instance.getSearchValue(),
      onChange: (e: any) => instance.setSearch(e.target.value),
      onBlur: () => instance.closeSearch(),
    }),

    getSearchMatchingItems: memo(
      (search, items) =>
        items.filter((item) =>
          instance.getConfig().isSearchMatchingItem?.(search, item)
        ),
      () => [instance.getSearchValue(), instance.getItems()]
    ),
  }),

  createItemInstance: (prev, item, tree) => ({
    ...prev,
    isMatchingSearch: () =>
      tree.getSearchMatchingItems().some((i) => i.getId() === item.getId()),
  }),

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

    nextSearchItem: {
      hotkey: "ArrowDown",
      allowWhenInputFocused: true,
      isEnabled: (tree) => tree.isSearchOpen(),
      handler: (e, tree) => {
        const focusItem = tree
          .getSearchMatchingItems()
          .find(
            (item) =>
              item.getItemMeta().index >
              tree.getFocusedItem().getItemMeta().index
          );
        focusItem?.setFocused();
        focusItem?.scrollTo({ block: "nearest", inline: "nearest" });
      },
    },

    previousSearchItem: {
      hotkey: "ArrowUp",
      allowWhenInputFocused: true,
      isEnabled: (tree) => tree.isSearchOpen(),
      handler: (e, tree) => {
        const focusItem = [...tree.getSearchMatchingItems()]
          .reverse()
          .find(
            (item) =>
              item.getItemMeta().index <
              tree.getFocusedItem().getItemMeta().index
          );
        focusItem?.setFocused();
        focusItem?.scrollTo({ block: "nearest", inline: "nearest" });
      },
    },
  },
};
