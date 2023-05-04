import { ItemInstance, OnChangeFn } from "../../types/core";

export type SearchFeatureDataRef<T = any> = {
  matchingItems: ItemInstance<any>[];
  searchInput: HTMLInputElement | null;
};

export type SearchFeatureDef<T> = {
  state: {
    search: string | null;
  };
  config: {
    onChangeSearch?: OnChangeFn<string | null>;
    onOpenSearch?: () => void;
    onCloseSearch?: () => void;
    onSearchMatchesItems?: (search: string, items: ItemInstance<T>[]) => void;
    isSearchMatchingItem?: (search: string, item: T) => boolean;
  };
  treeInstance: {
    setSearch: (search: string | null) => void;
    openSearch: () => void;
    closeSearch: () => void;
    isSearchOpen: () => boolean;
    getSearchValue: () => string;
    registerSearchInputElement: (element: HTMLInputElement | null) => void;
    getSearchInputElement: () => HTMLInputElement | null;
    getSearchInputElementProps: () => any;
    getSearchMatchingItems: () => ItemInstance<T>[];
  };
  itemInstance: {
    isMatchingSearch: () => boolean;
  };
  hotkeys:
    | "openSearch"
    | "closeSearch"
    | "nextSearchItem"
    | "previousSearchItem";
};
