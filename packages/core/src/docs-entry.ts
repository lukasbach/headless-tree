import {
  TreeState as OldTreeState,
  TreeConfig as OldTreeConfig,
  TreeInstance as OldTreeInstance,
  ItemInstance as OldItemInstance,
} from "./types/core";

export * from ".";

/** @group  Tree Interface */
export interface TreeState<T> extends OldTreeState<T> {}
/** @group  Tree Interface */
export interface TreeConfig<T> extends OldTreeConfig<T> {}
/** @group  Tree Interface */
export interface TreeInstance<T> extends OldTreeInstance<T> {}
/** @group  Tree Interface */
export interface ItemInstance<T> extends OldItemInstance<T> {}
