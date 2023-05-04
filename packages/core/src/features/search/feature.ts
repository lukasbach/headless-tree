import * as inspector from "inspector";
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
    onChangeSearch: makeStateUpdater("search", tree),
    onSearchMatchesItems: (search, item) => {
      return tree
        .getConfig()
        .getItemName(item)
        .toLowerCase()
        .includes(search.toLowerCase());
    },
    ...defaultConfig,
  }),

  createTreeInstance: (prev, instance) => ({
    ...prev,

    setSearch: (search) => {
      instance.getConfig().onChangeSearch?.(search);
    },
    openSearch: () => {
      instance.setSearch("");
      setTimeout(() => {
        instance
          .getDataRef<SearchFeatureDataRef>()
          .current.searchInput?.focus();
      });
    },
    closeSearch: () => instance.setSearch(null),
    isSearchOpen: () => instance.getState().search !== null,
    getSearchValue: () => instance.getState().search || "",
    registerSearchInputElement: (element) => {
      instance.getDataRef<SearchFeatureDataRef>().current.searchInput = element;
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

  createItemInstance: (prev, item, itemMeta, tree) => ({
    ...prev,
    isMatchingSearch: () =>
      tree.getSearchMatchingItems().some((i) => i.getId() === item.getId()),
  }),
};
