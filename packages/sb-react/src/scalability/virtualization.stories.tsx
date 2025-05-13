import type { Meta } from "@storybook/react";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  TreeState,
  buildProxiedInstance,
  buildStaticInstance,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Virtualizer, useVirtualizer } from "@tanstack/react-virtual";
import cn from "classnames";
import { PropsOfArgtype } from "../argtypes";

const meta = {
  title: "React/Scalability/Basic Virtualization",
  tags: ["homepage"],
  argTypes: {
    itemsPerLevel: {
      type: "number",
    },
    openLevels: {
      type: "number",
    },
    useProxyInstances: {
      type: "boolean",
    },
  },
  args: {
    itemsPerLevel: 10,
    openLevels: 4,
    useProxyInstances: true,
  },
} satisfies Meta;

export default meta;

// story-start
const getInitiallyExpandedItemIds = (
  itemsPerLevel: number,
  openLevels: number,
  prefix = "folder",
): string[] => {
  if (openLevels === 0) {
    return [];
  }

  const expandedItems: string[] = [];

  for (let i = 0; i < itemsPerLevel; i++) {
    expandedItems.push(`${prefix}-${i}`);
  }

  return [
    ...expandedItems,
    ...expandedItems.flatMap((itemId) =>
      getInitiallyExpandedItemIds(itemsPerLevel, openLevels - 1, itemId),
    ),
  ];
};

const Inner = forwardRef<Virtualizer<HTMLDivElement, Element>, any>(
  ({ tree }, ref) => {
    const parentRef = useRef<HTMLDivElement | null>(null);

    const virtualizer = useVirtualizer({
      count: tree.getItems().length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 27,
    });

    useImperativeHandle(ref, () => virtualizer);

    return (
      <div
        ref={parentRef}
        style={{
          height: `400px`,
          overflow: "auto",
        }}
      >
        <div
          {...tree.getContainerProps()}
          className="tree"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = tree.getItems()[virtualItem.index];
            return (
              <button
                {...item.getProps()}
                key={item.getId()}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingLeft: `${item.getItemMeta().level * 20}px`,
                }}
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
            );
          })}
          <div style={tree.getDragLineStyle()} className="dragline" />
        </div>
      </div>
    );
  },
);

export const BasicVirtualization = ({
  itemsPerLevel,
  openLevels,
  useProxyInstances,
}: PropsOfArgtype<typeof meta>) => {
  const virtualizer = useRef<Virtualizer<HTMLDivElement, Element> | null>(null);
  const [state, setState] = useState<Partial<TreeState<string>>>(() => ({
    expandedItems: getInitiallyExpandedItemIds(itemsPerLevel, openLevels),
  }));
  const tree = useTree<string>({
    instanceBuilder: useProxyInstances
      ? buildProxiedInstance
      : buildStaticInstance,
    state,
    setState,
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    scrollToItem: (item) => {
      virtualizer.current?.scrollToIndex(item.getItemMeta().index);
    },
    canReorder: true,
    indent: 20,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => {
        const items: string[] = [];
        for (let i = 0; i < itemsPerLevel; i++) {
          items.push(`${itemId}-${i}`);
        }
        return items;
      },
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  return <Inner tree={tree} ref={virtualizer} />;
};
