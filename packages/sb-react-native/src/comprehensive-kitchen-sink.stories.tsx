import React, { useState } from "react";
import type { Meta } from "@storybook/react";
import {
  TreeState,
  createOnDropHandler,
  dragAndDropFeature,
  expandAllFeature,
  keyboardDragAndDropFeature,
  reactNativeFeature,
  renamingFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Pressable, Text, TextInput, View } from "react-native";

const meta = {
  title: "React Native/Kitchen Sink/Comprehensive",
  tags: ["react-native", "homepage"],
} satisfies Meta;

export default meta;

type DemoItem = {
  name: string;
  children?: string[];
};

const initialData: Record<string, DemoItem> = {
  root: {
    name: "Root",
    children: ["fruit", "vegetables", "meals", "dessert"],
  },
  fruit: { name: "Fruit", children: ["apple", "banana", "orange"] },
  apple: { name: "Apple" },
  banana: { name: "Banana" },
  orange: { name: "Orange" },
  vegetables: { name: "Vegetables", children: ["carrot", "potato"] },
  carrot: { name: "Carrot" },
  potato: { name: "Potato" },
  meals: { name: "Meals", children: ["breakfast", "dinner"] },
  breakfast: { name: "Breakfast" },
  dinner: { name: "Dinner" },
  dessert: { name: "Dessert", children: ["cake", "cookies"] },
  cake: { name: "Cake" },
  cookies: { name: "Cookies" },
};

export const ComprehensiveKitchenSink = () => {
  const [data, setData] = useState(initialData);
  const [state, setState] = useState<Partial<TreeState<DemoItem>>>({
    expandedItems: ["fruit", "vegetables"],
    selectedItems: ["banana", "orange"],
  });

  const updateChildren = (itemId: string, children: string[]) => {
    setData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        children,
      },
    }));
  };

  const tree = useTree<DemoItem>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      updateChildren(item.getId(), newChildren);
    }),
    onRename: (item, value) => {
      setData((prev) => ({
        ...prev,
        [item.getId()]: {
          ...prev[item.getId()],
          name: value,
        },
      }));
    },
    indent: 20,
    dataLoader: {
      getItem: (itemId) => data[itemId],
      getChildren: (itemId) => data[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      searchFeature,
      renamingFeature,
      expandAllFeature,
      reactNativeFeature,
    ],
  });

  return (
    <View>
      {tree.isSearchOpen() ? (
        <TextInput {...tree.getSearchInputElementProps()} />
      ) : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable onPress={() => tree.openSearch()}>
          <Text>Search items</Text>
        </Pressable>
        <Pressable
          onPress={() => tree.getItemInstance("fruit").startRenaming()}
        >
          <Text>Rename Fruit</Text>
        </Pressable>
        <Pressable onPress={() => tree.expandAll()}>
          <Text>Expand all</Text>
        </Pressable>
        <Pressable onPress={() => tree.collapseAll()}>
          <Text>Collapse all</Text>
        </Pressable>
      </View>

      <View {...tree.getContainerProps()}>
        {tree.getItems().map((item) => (
          <View
            key={item.getId()}
            style={{ paddingLeft: item.getItemMeta().level * 20 }}
          >
            {item.isRenaming() ? (
              <TextInput {...item.getRenameInputProps()} />
            ) : (
              <Pressable {...item.getProps()}>
                <Text>
                  {item.isFolder() ? (item.isExpanded() ? "[-] " : "[+] ") : ""}
                  {item.getItemName()}
                  {item.isSelected() ? " (selected)" : ""}
                  {item.isMatchingSearch() ? " (match)" : ""}
                  {item.isDragTarget() ? " (drop target)" : ""}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
        <View style={tree.getDragLineStyle() as any} />
      </View>
    </View>
  );
};
