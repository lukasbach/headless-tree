import type { Meta } from "@storybook/react";
import React, { type FC, useEffect, useRef, useState } from "react";
import {
  type FeatureImplementation,
  type TreeState,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";
import { PropsOfArgtype } from "../argtypes";

import "./delayed-drag-activation.css";

const meta = {
  title: "React/Drag and Drop/Delayed Drag Activation",
  tags: ["feature/dnd"],
  argTypes: {
    activationMode: {
      type: "string",
      options: ["time", "distance"],
      control: { type: "radio" },
    },
    activationDelaySeconds: {
      type: "number",
      control: { type: "number", min: 0, max: 3, step: 0.1 },
    },
    activationDistancePixels: {
      type: "number",
      control: { type: "number", min: 0, max: 100, step: 1 },
    },
  },
  args: {
    activationMode: "distance",
    activationDelaySeconds: 0.5,
    activationDistancePixels: 32,
  },
} satisfies Meta;

export default meta;

// story-start
type DelayedDragActivationMode = "time" | "distance";
type DragCursorPosition = {
  clientX: number;
  clientY: number;
};

declare module "@headless-tree/core" {
  export interface TreeConfig<T> {
    delayedDragActivationMode?: T extends unknown
      ? DelayedDragActivationMode
      : never;
    delayedDragActivationDelaySeconds?: number;
    delayedDragActivationDistancePixels?: number;
    setDelayedDragCursorPosition?: (
      position: DragCursorPosition | null,
    ) => void;
  }
}

type DelayedDragActivationDataRef = {
  delayedDragActivation?: {
    activated: boolean;
    initialClientX: number;
    initialClientY: number;
    onDragStart?: (event: DragEvent) => void;
    startedAt: number;
  };
};

type DragActivationState = NonNullable<
  DelayedDragActivationDataRef["delayedDragActivation"]
>;

const isActivationConstraintFulfilled = (
  event: DragEvent,
  dragActivation: DragActivationState,
  mode: DelayedDragActivationMode,
  delaySeconds: number,
  distancePixels: number,
) => {
  if (mode === "time") {
    return Date.now() - dragActivation.startedAt >= delaySeconds * 1000;
  }

  return (
    Math.hypot(
      event.clientX - dragActivation.initialClientX,
      event.clientY - dragActivation.initialClientY,
    ) >= distancePixels
  );
};

const delayedDragActivationFeature: FeatureImplementation = {
  key: "delayed-drag-activation",
  deps: ["drag-and-drop"],
  overwrites: ["drag-and-drop"],
  itemInstance: {
    getProps: ({ tree, prev }) => {
      const props = prev?.() ?? {};

      return {
        ...props,
        onDragOver: (event: DragEvent) => {
          const dataRef = tree.getDataRef<DelayedDragActivationDataRef>();
          const dragActivation = dataRef.current.delayedDragActivation;

          if (dragActivation && !dragActivation.activated) {
            return;
          }

          props.onDragOver?.(event);
        },
      };
    },
    getDragHandleProps: ({ tree, prev }) => {
      const props = prev?.() ?? {};
      const onDragStart = props.onDragStart as
        | ((event: DragEvent) => void)
        | undefined;

      return {
        ...props,
        onDragStart: (event: DragEvent) => {
          const hiddenDragImage = document.getElementById(
            "delayed-drag-hidden-image",
          );

          if (hiddenDragImage) {
            event.dataTransfer?.setDragImage(hiddenDragImage, 0, 0);
          }

          const dataRef = tree.getDataRef<DelayedDragActivationDataRef>();
          tree.getConfig().setDelayedDragCursorPosition?.(null);
          dataRef.current.delayedDragActivation = {
            activated: false,
            initialClientX: event.clientX,
            initialClientY: event.clientY,
            onDragStart,
            startedAt: Date.now(),
          };
        },
        onDrag: (event: DragEvent) => {
          const dataRef = tree.getDataRef<DelayedDragActivationDataRef>();
          const dragActivation = dataRef.current.delayedDragActivation;

          if (!dragActivation) {
            tree.getConfig().setDelayedDragCursorPosition?.(null);
            props.onDrag?.(event);
            return;
          }

          const {
            delayedDragActivationMode = "distance",
            delayedDragActivationDelaySeconds = 0,
            delayedDragActivationDistancePixels = 0,
          } = tree.getConfig();

          if (
            !isActivationConstraintFulfilled(
              event,
              dragActivation,
              delayedDragActivationMode,
              delayedDragActivationDelaySeconds,
              delayedDragActivationDistancePixels,
            )
          ) {
            return;
          }

          if (!dragActivation.activated) {
            dragActivation.activated = true;
            dragActivation.onDragStart?.(event);
          }

          tree.getConfig().setDelayedDragCursorPosition?.({
            clientX: event.clientX,
            clientY: event.clientY,
          });
          props.onDrag?.(event);
        },
        onDragEnd: (event: DragEvent) => {
          const dataRef = tree.getDataRef<DelayedDragActivationDataRef>();
          dataRef.current.delayedDragActivation = undefined;
          tree.getConfig().setDelayedDragCursorPosition?.(null);
          props.onDragEnd?.(event);
        },
      };
    },
  },
};

type DelayedDragCursorPreviewProps = {
  dragCursorPosition: DragCursorPosition | null;
  draggedItemNames: string[];
};

const DelayedDragCursorPreview: FC<DelayedDragCursorPreviewProps> = ({
  dragCursorPosition,
  draggedItemNames,
}) => {
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previewElement = previewRef.current;

    if (!previewElement || !dragCursorPosition) {
      return;
    }

    previewElement.style.transform = `translate(${dragCursorPosition.clientX + 16}px, ${dragCursorPosition.clientY + 16}px)`;
  }, [dragCursorPosition]);

  const isVisible = draggedItemNames.length > 0 && !!dragCursorPosition;

  return (
    <div
      ref={previewRef}
      aria-hidden
      className={cn("delayed-drag-cursor-preview", {
        visible: isVisible,
      })}
    >
      <span className="delayed-drag-cursor-preview__label">{`${draggedItemNames.length} items`}</span>
    </div>
  );
};

const toActivationMode = (mode: string): DelayedDragActivationMode =>
  mode === "time" ? "time" : "distance";

export const DelayedDragActivation = ({
  activationMode,
  activationDelaySeconds,
  activationDistancePixels,
}: PropsOfArgtype<typeof meta>) => {
  const [state, setState] = useState<Partial<TreeState<any>>>({
    expandedItems: ["root-1", "root-1-2"],
    selectedItems: ["root-1-2-1", "root-1-2-2", "root-1-2-3"],
  });
  const [dragCursorPosition, setDragCursorPosition] =
    useState<DragCursorPosition | null>(null);
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canReorder: true,
    delayedDragActivationMode: toActivationMode(activationMode),
    delayedDragActivationDelaySeconds: activationDelaySeconds,
    delayedDragActivationDistancePixels: activationDistancePixels,
    setDelayedDragCursorPosition: setDragCursorPosition,
    onDrop: (items, target) => {
      alert(
        `Dropped ${items.map((item) =>
          item.getId(),
        )} on ${target.item.getId()}, ${JSON.stringify(target)}`,
      );
    },
    indent: 20,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-4`,
      ],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      delayedDragActivationFeature,
      keyboardDragAndDropFeature,
    ],
  });

  const draggedItemNames =
    tree.getState().dnd?.draggedItems?.map((item) => item.getItemName()) ?? [];

  return (
    <>
      <p className="description">
        The drag state starts after the configured delay or movement threshold.
      </p>
      <div
        id="delayed-drag-hidden-image"
        className="delayed-drag-hidden-image"
      />
      <div {...tree.getContainerProps()} className="tree delayed-drag-tree">
        <AssistiveTreeDescription tree={tree} />
        {tree.getItems().map((item) => (
          <button
            {...item.getProps()}
            key={item.getId()}
            style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
          >
            <div
              className={cn("treeitem", {
                focused: item.isFocused(),
                expanded: item.isExpanded(),
                selected: item.isSelected(),
                folder: item.isFolder(),
                drop: item.isDragTarget(),
              })}
            >
              {item.getItemName()}
            </div>
          </button>
        ))}
      </div>
      <DelayedDragCursorPreview
        dragCursorPosition={dragCursorPosition}
        draggedItemNames={draggedItemNames}
      />
    </>
  );
};
