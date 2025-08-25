/* eslint-disable jsx-a11y/label-has-associated-control */
import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  asyncDataLoaderFeature,
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Checkboxes/Async Configurability",
  tags: ["feature/checkbox", "checkbox"],
} satisfies Meta;

export default meta;

const { asyncDataLoader } = createDemoData();

// story-start
export const AsyncConfigurability = () => {
  const [canCheckFolders, setCanCheckFolders] = useState(false);
  const [propagateCheckedState, setPropagateCheckedState] = useState(true);
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    // initialState: { expandedItems: ["fruit", "berries"] },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: asyncDataLoader,
    createLoadingItemData: () => ({ name: "Loading..." }),
    indent: 20,
    canCheckFolders,
    propagateCheckedState,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  });

  return (
    <>
      <div>
        <label>
          <input
            type="checkbox"
            checked={canCheckFolders}
            onChange={(e) => setCanCheckFolders(e.target.checked)}
          />
          Can check folders
        </label>
        <label>
          <input
            type="checkbox"
            checked={propagateCheckedState}
            onChange={(e) => setPropagateCheckedState(e.target.checked)}
          />
          Propagate checked state
        </label>
      </div>
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
            {!tree
              .getState()
              .loadingCheckPropagationItems.includes(item.getId()) ? (
              <input type="checkbox" {...item.getCheckboxProps()} />
            ) : (
              <>Loading</>
            )}
          </div>
        ))}
      </div>
      <pre>Checked Items: {JSON.stringify(tree.getState().checkedItems)}</pre>
      <pre>
        Loading Item Children:{" "}
        {JSON.stringify(tree.getState().loadingItemChildrens)}
      </pre>
      <pre>
        Loading Item Data: {JSON.stringify(tree.getState().loadingItemData)}
      </pre>
      <pre>
        Loading Checkbox propagation:{" "}
        {JSON.stringify(tree.getState().loadingCheckPropagationItems)}
      </pre>
    </>
  );
};
