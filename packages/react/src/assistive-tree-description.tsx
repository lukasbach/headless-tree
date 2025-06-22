import React, { HTMLProps } from "react";
import {
  AssistiveDndState,
  DndState,
  HotkeysConfig,
  TreeInstance,
} from "@headless-tree/core";

// https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09

const styles = {
  position: "absolute",
  margin: "-1px",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
} as const;

const getDefaultLabel = <T,>(
  dnd: DndState<T> | null | undefined,
  assistiveState: AssistiveDndState,
  hotkeys: HotkeysConfig<T>,
) => {
  if (!hotkeys.startDrag) return ""; // No hotkey feature configured
  const itemNames =
    dnd?.draggedItems?.map((item) => item.getItemName()).join(", ") ?? "";
  const position = !dnd?.dragTarget
    ? "None"
    : "childIndex" in dnd.dragTarget
      ? `${dnd.dragTarget.childIndex} of ${dnd.dragTarget.item.getChildren().length} in ${dnd.dragTarget.item.getItemName()}`
      : `in ${dnd.dragTarget.item.getItemName()}`;
  const navGuide =
    `Press ${hotkeys.dragUp?.hotkey} and ${hotkeys.dragDown?.hotkey} to move up or down, ` +
    `${hotkeys.completeDrag?.hotkey} to drop, ${hotkeys.cancelDrag?.hotkey} to abort.`;
  switch (assistiveState) {
    case AssistiveDndState.Started:
      return itemNames
        ? `Dragging ${itemNames}. Current position: ${position}. ${navGuide}`
        : `Current position: ${position}. ${navGuide}`;
    case AssistiveDndState.Dragging:
      return itemNames ? `${itemNames}, ${position}` : position;
    case AssistiveDndState.Completed:
      return `Drag completed. Press ${hotkeys.startDrag?.hotkey} to move selected items`;
    case AssistiveDndState.Aborted:
      return `Drag cancelled. Press ${hotkeys.startDrag?.hotkey} to move selected items`;
    case AssistiveDndState.None:
    default:
      return `Press ${hotkeys.startDrag?.hotkey} to move selected items`;
  }
};

export const AssistiveTreeDescription = <T,>({
  tree,
  getLabel = getDefaultLabel,
  ...props
}: {
  tree: TreeInstance<T>;
  getLabel?: typeof getDefaultLabel;
} & HTMLProps<HTMLSpanElement>) => {
  const state = tree.getState();
  return (
    <span
      aria-live="assertive"
      {...props}
      style={{
        ...styles,
        ...props.style,
      }}
    >
      {getLabel(
        state.dnd,
        state.assistiveDndState ?? AssistiveDndState.None,
        tree.getHotkeyPresets(),
      )}
    </span>
  );
};
