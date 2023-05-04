import { ItemInstance, OnChangeFn } from "../../types/core";
import { HotkeysCoreDataRef } from "../hotkeys-core/types";

export type SearchFeatureDataRef<T = any> = HotkeysCoreDataRef & {
  matchingItems: ItemInstance<T>[];
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
    isSearchMatchingItem?: (search: string, item: ItemInstance<T>) => boolean;
  };
  treeInstance: {
    setSearch: (search: string | null) => void;
    openSearch: (initialValue?: string) => void;
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
