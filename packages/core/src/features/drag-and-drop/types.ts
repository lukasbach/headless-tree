import { ItemInstance, SetStateFn } from "../../types/core";

export interface DndDataRef {
  lastDragCode?: string;
  lastAllowDrop?: boolean;
}

export interface DndState<T> {
  draggedItems?: ItemInstance<T>[];
  draggingOverItem?: ItemInstance<T>;
  dragTarget?: DragTarget<T>;
}

export interface DragLineData {
  indent: number;
  top: number;
  left: number;
  width: number;
}

export type DragTarget<T> =
  | {
      item: ItemInstance<T>;
      childIndex: number;
      insertionIndex: number;
      dragLineIndex: number;
      dragLineLevel: number;
    }
  | {
      item: ItemInstance<T>;
    };

export enum DragTargetPosition {
  Top = "top",
  Bottom = "bottom",
  Item = "item",
}

export type DragAndDropFeatureDef<T> = {
  state: {
    dnd?: DndState<T> | null;
  };
  config: {
    setDndState?: SetStateFn<DndState<T> | undefined | null>;

    /** Defines the size of the area at the top and bottom of an item where, when an item is dropped, the item willö
     * be placed above or below the item within the same parent, as opposed to being placed inside the item.
     * If `canReorder` is `false`, this is ignored. */
    reorderAreaPercentage?: number;
    canReorder?: boolean;

    canDrag?: (items: ItemInstance<T>[]) => boolean;
    canDrop?: (items: ItemInstance<T>[], target: DragTarget<T>) => boolean;

    indent?: number;

    createForeignDragObject?: (items: ItemInstance<T>[]) => {
      format: string;
      data: any;
    };
    setDragImage?: (items: ItemInstance<T>[]) => {
      imgElement: Element;
      xOffset?: number;
      yOffset?: number;
    };
    canDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: DragTarget<T>,
    ) => boolean;
    onDrop?: (
      items: ItemInstance<T>[],
      target: DragTarget<T>,
    ) => void | Promise<void>;
    onDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: DragTarget<T>,
    ) => void | Promise<void>;
    onCompleteForeignDrop?: (items: ItemInstance<T>[]) => void;
  };
  treeInstance: {
    getDragTarget: () => DragTarget<T> | null;
    getDragLineData: () => DragLineData | null;

    getDragLineStyle: (
      topOffset?: number,
      leftOffset?: number,
    ) => Record<string, any>;
  };
  itemInstance: {
    isDragTarget: () => boolean;
    isDragTargetAbove: () => boolean;
    isDragTargetBelow: () => boolean;
    isDraggingOver: () => boolean;
  };
  hotkeys: never;
};
