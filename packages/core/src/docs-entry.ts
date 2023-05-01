import {
  TreeState as OldTreeState,
  TreeConfig as OldTreeConfig,
  TreeInstance as OldTreeInstance,
  ItemInstance as OldItemInstance,
} from "./types/core";

export * from ".";

export interface TreeState<T> extends OldTreeState<T> {}
export interface TreeConfig<T> extends OldTreeConfig<T> {}
export interface TreeInstance<T> extends OldTreeInstance<T> {}
export interface ItemInstance<T> extends OldItemInstance<T> {}
