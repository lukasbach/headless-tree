import type { Meta } from "@storybook/react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  renamingFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { HotkeyName } from "@headless-tree/core/src";

const meta = {
  title: "React/Misc/Hotkey Debugger",
  tags: ["dev"],
} satisfies Meta;

export default meta;

// story-start
const HotkeyDisplay = (props: {
  value: { current: { pressedKeys?: Set<string> } };
}) => {
  const [, update] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      update((i) => i + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return <span>{[...(props.value.current.pressedKeys ?? [])].join(";")}</span>;
};

const KeyDownDisplay = (props: { event: "keydown" | "keyup" }) => {
  const [key, setKey] = useState("");
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      setKey(e.code);
      setTimeout(() => setKey((k) => (k === e.code ? "" : k)), 500);
    };
    document.addEventListener(props.event, keydown);
    return () => {
      document.removeEventListener(props.event, keydown);
    };
  }, [props.event]);
  return <span>{key || "None"}</span>;
};

export const HotkeyDebugger = () => {
  const [text, setText] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (text) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setText(""), 1500);
    }
  }, [text]);

  const tree = useTree<string>({
    initialState: {
      expandedItems: ["root-1", "root-1-2"],
    },
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    canReorder: true,
    onDrop: (items, target) => {
      alert(
        `Dropped ${items.map((item) =>
          item.getId(),
        )} on ${target.item.getId()}, ${JSON.stringify(target)}`,
      );
    },
    indent: 20,
    onTreeHotkey: (name) => {
      const { hotkey } = tree.getHotkeyPresets()[name as HotkeyName];
      setText(`Hotkey ${name} pressed on tree (${hotkey})`);
    },
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-1item`,
        `${itemId}-2item`,
        `${itemId}-3item`,
      ],
    },
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      renamingFeature,
      searchFeature,
    ],
  });
  console.log(tree.getDataRef<any>().current.pressedKeys);

  return (
    <>
      <p className="description" style={{ minHeight: "30px" }}>
        {text || "No Hotkey pressed"}
      </p>
      <p className="description" style={{ minHeight: "30px" }}>
        Recorded keys: <HotkeyDisplay value={tree.getDataRef<any>()} />
        <br />
        keydown=
        <KeyDownDisplay event="keydown" />
        <br />
        keyup=
        <KeyDownDisplay event="keyup" />
      </p>
      {tree.isSearchOpen() && (
        <>
          <p>Navigate between search results with ArrowUp and ArrowDown.</p>
          <input {...tree.getSearchInputElementProps()} /> (
          {tree.getSearchMatchingItems().length} matches)
        </>
      )}{" "}
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <Fragment key={item.getId()}>
            {item.isRenaming() ? (
              <div
                className="renaming-item"
                style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
              >
                <input {...item.getRenameInputProps()} />
              </div>
            ) : (
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
                    searchmatch: item.isMatchingSearch(),
                  })}
                >
                  {item.getItemName()}
                </div>
              </button>
            )}
          </Fragment>
        ))}
        <div style={tree.getDragLineStyle()} className="dragline" />
      </div>
    </>
  );
};
