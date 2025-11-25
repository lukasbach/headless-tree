import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  TreeState,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
  TreeItemInstance,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Drag and Drop/Drag Line",
  tags: ["feature/dnd", "basic"],
} satisfies Meta;

export default meta;

const STATIC_FEATURES = [
  syncDataLoaderFeature,
  selectionFeature,
  hotkeysCoreFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
];

const mockDataLoader = {
  getItem: (itemId: string) => itemId,
  getChildren: (itemId: string) =>
    Array.from({ length: 6 }, (_, i) => `${itemId}-${i + 1}`),
};

const handleDrop = (items: TreeItemInstance<string>[], target: any) => {
  alert(
    `Dropped ${items.map((item) => item.getId())} on ${target.item.getId()}, ${JSON.stringify(target)}`
  );
};

interface TreeItemRowProps {
  item: TreeItemInstance<string>;
}

const TreeItemRow = React.memo(({ item }: TreeItemRowProps) => {
  return (
    <button
      {...item.getProps()}
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
  );
});

TreeItemRow.displayName = "TreeItemRow";

export const DragLine = () => {
  const [state, setState] = useState<Partial<TreeState<string>>>({
    expandedItems: ["root-1", "root-1-2"],
  });

  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    dataLoader: mockDataLoader,
    onDrop: handleDrop,
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canReorder: true,
    indent: 20,
    features: STATIC_FEATURES,
  });

  const dragLineStyle = tree.getDragLineStyle();
  const dragLineData = tree.getDragLineData();
  const items = tree.getItems();

  return (
    <div {...tree.getContainerProps()} className="tree">
      <AssistiveTreeDescription tree={tree} />

      {items.map((item) => (
        <TreeItemRow key={item.getId()} item={item} />
      ))}

      {dragLineData && (
        <div style={dragLineStyle} className="dragline" />
      )}

      <pre>
        {JSON.stringify({ dragLine: dragLineData }, null, 2)}
      </pre>
    </div>
  );
};
