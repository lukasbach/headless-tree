import { ItemInstance } from "../../types/core";

export type KeyboardDragAndDropFeatureDef<T> = {
  state: {};
  config: {
    onStartKeyboardDrag?: (items: ItemInstance<T>[]) => void;
  };
  treeInstance: {
    setKeyboardDraggingForeignObject: (dataTransfer: DataTransfer) => void;
    unsetKeyboardDraggingForeignObject: () => void;
  };
  itemInstance: {};
  hotkeys: "startDrag" | "cancelDrag" | "completeDrag" | "dragUp" | "dragDown";
};
