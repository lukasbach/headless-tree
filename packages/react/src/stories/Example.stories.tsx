import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { hotkeysCoreFeature, selectionFeature } from "@headless-tree/core";
import { useTree } from "../index";

const meta = {
  title: "React/Example",
} satisfies Meta;

export default meta;

export const Example = () => {
  const [state, setState] = useState({ rootItemId: "root" });
  const tree = useTree<string>({
    state,
    onStateChange: setState,
    getItemName: (item) => item,
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    features: [selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div ref={tree.registerElement}>
      {tree.getItems().map((item) => (
        <div
          key={item.getId()}
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <button {...item.getProps()} ref={item.registerElement}>
            {item.isExpanded() ? "v" : ">"}
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
