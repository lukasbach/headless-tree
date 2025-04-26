import { ItemInstance, SetStateFn } from "../../types/core";
import { HotkeysCoreDataRef } from "../hotkeys-core/types";

export interface SearchFeatureDataRef<T = any> extends HotkeysCoreDataRef {
  matchingItems: ItemInstance<T>[];
  searchInput: HTMLInputElement | null;
}

export type SearchFeatureDef<T> = {
  state: {
    search: string | null;
  };
  config: {
    setSearch?: SetStateFn<string | null>;
    onOpenSearch?: () => void;
    onCloseSearch?: () => void;
    isSearchMatchingItem?: (search: string, item: ItemInstance<T>) => boolean;
  };
  treeInstance: {
    setSearch: (search: string | null) => void;
    openSearch: (initialValue?: string) => void;
    closeSearch: () => void;
    isSearchOpen: () => boolean;
    getSearchValue: () => string;
    registerSearchInputElement: (element: HTMLInputElement | null) => void; // TODO remove
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
    | "submitSearch"
    | "nextSearchItem"
    | "previousSearchItem";
};
