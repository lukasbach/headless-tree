import type { Meta } from "@storybook/react";
import React from "react";
import {
  asyncDataLoaderFeature,
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { type DemoItem, createDemoData } from "../data";

const meta = {
  title: "React/Misc/Issue Repros/#173 Checkboxes cause too many re-renders",
  tags: ["dev"],
} satisfies Meta;

const { asyncDataLoader } = createDemoData();

export default meta;

const objectDiff = (obj1: any, obj2: any) => {
  return Object.entries(obj1).filter(
    ([key, value]) => JSON.stringify(value) !== JSON.stringify(obj2[key]),
  );
};

// story-start
export const Story = () => {
  const tree = useTree<DemoItem>({
    initialState: { expandedItems: ["fruit"], checkedItems: ["banana"] },
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: asyncDataLoader,
    createLoadingItemData: () => ({ name: "Loading..." }),
    indent: 20,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  });
  const prevStateRef = React.useRef(tree.getState());
  console.log(
    "rerender",
    JSON.stringify(objectDiff(tree.getState(), prevStateRef.current)),
  );
  prevStateRef.current = { ...tree.getState() };
  return (
    <>
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <div className="outeritem" key={item.getId()}>
            <button
              {...item.getProps()}
              style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
            >
              <div
                className={cx("treeitem", {
                  focused: item.isFocused(),
                  expanded: item.isExpanded(),
                  selected: item.isSelected(),
                  folder: item.isFolder(),
                })}
              >
                {item.getItemName()}
              </div>
            </button>
            <input type="checkbox" {...item.getCheckboxProps()} />
          </div>
        ))}
      </div>
      <pre>{JSON.stringify(tree.getState().checkedItems)}</pre>
    </>
  );
};
