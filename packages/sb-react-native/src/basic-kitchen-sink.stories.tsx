import type { Meta } from "@storybook/react";
import {
  reactNativeFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Pressable, Text, View } from "react-native";
import React from "react";

const meta = {
  title: "React Native/Kitchen Sink/Basic",
  tags: ["react-native", "basic"],
} satisfies Meta;

export default meta;

type DemoItem = {
  name: string;
  children?: string[];
};

const data: Record<string, DemoItem> = {
  root: { name: "Root", children: ["fruit", "vegetables", "drinks"] },
  fruit: { name: "Fruit", children: ["apple", "banana", "orange"] },
  apple: { name: "Apple" },
  banana: { name: "Banana" },
  orange: { name: "Orange" },
  vegetables: { name: "Vegetables", children: ["carrot", "potato"] },
  carrot: { name: "Carrot" },
  potato: { name: "Potato" },
  drinks: { name: "Drinks", children: ["water", "juice"] },
  water: { name: "Water" },
  juice: { name: "Juice" },
};

export const BasicKitchenSink = () => {
  const tree = useTree<DemoItem>({
    initialState: {
      expandedItems: ["fruit"],
      selectedItems: ["banana"],
    },
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: {
      getItem: (itemId) => data[itemId],
      getChildren: (itemId) => data[itemId]?.children ?? [],
    },
    features: [syncDataLoaderFeature, selectionFeature, reactNativeFeature],
  });

  return (
    <View {...tree.getContainerProps()}>
      {tree.getItems().map((item) => (
        <Pressable
          {...item.getProps()}
          key={item.getId()}
          style={{ paddingLeft: item.getItemMeta().level * 20 }}
        >
          <Text>
            {item.isFolder() ? (item.isExpanded() ? "[-] " : "[+] ") : ""}
            {item.getItemName()}
            {item.isSelected() ? " (selected)" : ""}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
