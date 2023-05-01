import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { useTree } from "../index";

const meta = {
  title: "React/Basic Example",
} satisfies Meta;

export default meta;

export const Example = () => {
  const [state, setState] = useState({ rootItemId: "root" });

  console.log("STATE", state);

  const tree = useTree<string>({
    state,
    onStateChange: setState,
    getItemName: (item) => item,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
  } as any);

  return (
    <div>
      {tree.getItems().map((item) => (
        <div
          key={item.getId()}
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <button {...item.getProps()}>
            {item.isExpanded() ? "v" : ">"}
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
