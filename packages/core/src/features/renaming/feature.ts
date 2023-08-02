import { FeatureImplementation, ItemInstance } from "../../types/core";
import { RenamingFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { makeStateUpdater } from "../../utils";

export const renamingFeature: FeatureImplementation<
  any,
  RenamingFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | RenamingFeatureDef<any>
> = {
  key: "renaming",

  getDefaultConfig: (defaultConfig, tree) => ({
    setRenamingItem: makeStateUpdater("renamingItem", tree),
    setRenamingValue: makeStateUpdater("renamingValue", tree),
    canRename: () => true,
    ...defaultConfig,
  }),

  stateHandlerNames: {
    renamingItem: "setRenamingItem",
    renamingValue: "setRenamingValue",
  },

  createTreeInstance: (prev, instance) => ({
    ...prev,

    startRenamingItem: (itemId) => {
      const config = instance.getConfig();
      const item = instance.getItemInstance(itemId);

      if (!item.canRename()) {
        return;
      }

      instance.applySubStateUpdate("renamingItem", itemId);
      instance.applySubStateUpdate("renamingValue", item.getItemName());
    },

    getRenamingItem: () => {
      const itemId = instance.getState().renamingItem;
      return itemId ? instance.getItemInstance(itemId) : null;
    },

    getRenamingValue: () => instance.getState().renamingValue || "",

    abortRenaming: () => {
      instance.applySubStateUpdate("renamingItem", null);
    },

    completeRenaming: () => {
      const config = instance.getConfig();
      const item = instance.getRenamingItem();
      if (item) {
        config.onRename?.(item, instance.getState().renamingValue || "");
      }
      instance.applySubStateUpdate("renamingItem", null);
    },

    isRenamingItem: () => !!instance.getState().renamingItem,
  }),

  createItemInstance: (prev, instance, tree) => ({
    ...prev,
    getRenameInputProps: () => ({
      onBlur: () => tree.abortRenaming(),
      value: tree.getRenamingValue(),
      onChange: (e) => {
        tree.applySubStateUpdate("renamingValue", e.target.value);
      },
    }),

    canRename: () =>
      tree.getConfig().canRename?.(instance as ItemInstance<any>) ?? true,

    isRenaming: () => instance.getId() === tree.getState().renamingItem,
  }),

  hotkeys: {
    renameItem: {
      hotkey: "F2",
      handler: (e, tree) => {
        tree.startRenamingItem(tree.getFocusedItem().getId());
      },
    },

    abortRenaming: {
      hotkey: "Escape",
      allowWhenInputFocused: true,
      isEnabled: (tree) => tree.isRenamingItem(),
      handler: (e, tree) => {
        tree.abortRenaming();
      },
    },

    completeRenaming: {
      hotkey: "Enter",
      allowWhenInputFocused: true,
      isEnabled: (tree) => tree.isRenamingItem(),
      handler: (e, tree) => {
        tree.completeRenaming();
      },
    },
  },
};
