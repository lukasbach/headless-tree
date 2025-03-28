import { ItemInstance, SetStateFn } from "../../types/core";

export enum AssistiveDndState {
  None,
  Started,
  Dragging,
  Completed,
  Aborted,
}

export type KeyboardDragAndDropFeatureDef<T> = {
  state: {
    assistiveDndState?: AssistiveDndState | null;
  };
  config: {
    setAssistiveDndState?: SetStateFn<AssistiveDndState | undefined | null>;
    onStartKeyboardDrag?: (items: ItemInstance<T>[]) => void;
  };
  treeInstance: {
    setKeyboardDraggingForeignObject: (dataTransfer: DataTransfer) => void;
    unsetKeyboardDraggingForeignObject: () => void;
  };
  itemInstance: {};
  hotkeys: "startDrag" | "cancelDrag" | "completeDrag" | "dragUp" | "dragDown";
};
