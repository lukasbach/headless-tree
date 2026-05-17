import { FeatureImplementation, TreeInstance } from "../../types/core";
import { HotkeysCoreDataRef } from "../hotkeys-core/types";
import { hotkeysCoreController } from "../hotkeys-core/shared";

type AccessibilityState = {
  selected?: boolean;
  expanded?: boolean;
};

type KeyboardEventLike = Partial<KeyboardEvent> & {
  nativeEvent?: {
    code?: string;
    key?: string;
  };
};

const getHotkeysDataRef = (tree: TreeInstance<any>) =>
  tree.getDataRef<HotkeysCoreDataRef>();

const clearPressedKeys = (tree: TreeInstance<any>) => {
  hotkeysCoreController.clearPressedKeys(getHotkeysDataRef(tree));
};

const bindEventMethod =
  (
    event: KeyboardEventLike,
    methodName: "preventDefault" | "stopPropagation",
  ) =>
  () => {
    const method = event[methodName];
    if (typeof method === "function") {
      Reflect.apply(method, event, []);
    }
  };

const toHotkeyEvent = (event: KeyboardEventLike) => ({
  ...event,
  code: event.nativeEvent?.code ?? event.code ?? "",
  key: event.nativeEvent?.key ?? event.key ?? "",
  preventDefault: bindEventMethod(event, "preventDefault"),
  stopPropagation: bindEventMethod(event, "stopPropagation"),
});

const dispatchReactNativeKeyDown = (
  tree: TreeInstance<any>,
  eventLike: KeyboardEventLike,
  isInputFocused = false,
  releaseAfterDispatch = false,
) => {
  hotkeysCoreController.dispatchKeyDown(
    tree,
    getHotkeysDataRef(tree),
    toHotkeyEvent(eventLike),
    { isInputFocused, releaseAfterDispatch },
  );
};

const dispatchReactNativeKeyUp = (
  tree: TreeInstance<any>,
  eventLike: KeyboardEventLike,
) => {
  hotkeysCoreController.dispatchKeyUp(
    getHotkeysDataRef(tree),
    toHotkeyEvent(eventLike),
  );
};

const buildAccessibilityState = (props: Record<string, any>) => {
  const accessibilityState: AccessibilityState = {
    ...(props.accessibilityState ?? {}),
  };

  if (props["aria-selected"] !== undefined) {
    accessibilityState.selected = props["aria-selected"] === "true";
  }

  if (props["aria-expanded"] !== undefined) {
    accessibilityState.expanded = Boolean(props["aria-expanded"]);
  }

  return Object.keys(accessibilityState).length > 0
    ? accessibilityState
    : undefined;
};

const omitProps = (
  props: Record<string, any>,
  keys: string[],
  predicates: ((key: string) => boolean)[] = [],
) => {
  const omittedKeys = new Set(keys);
  return Object.entries(props).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      if (
        omittedKeys.has(key) ||
        predicates.some((predicate) => predicate(key))
      ) {
        return acc;
      }

      acc[key] = value;
      return acc;
    },
    {},
  );
};

const stripDomAccessibilityProps = (props: Record<string, any>) =>
  omitProps(props, ["role", "tabIndex"], [(key) => key.startsWith("aria-")]);

const mapSharedProps = (props: Record<string, any>) => {
  const accessibilityState = buildAccessibilityState(props);
  return stripDomAccessibilityProps({
    ...props,
    accessibilityLabel: props.accessibilityLabel ?? props["aria-label"],
    accessibilityRole: props.accessibilityRole ?? props.role,
    accessibilityState,
  });
};

const toClickEvent = (event: any) => ({
  ...event,
  ctrlKey: event?.ctrlKey ?? event?.nativeEvent?.ctrlKey ?? false,
  shiftKey: event?.shiftKey ?? event?.nativeEvent?.shiftKey ?? false,
  metaKey: event?.metaKey ?? event?.nativeEvent?.metaKey ?? false,
  preventDefault: event?.preventDefault ?? (() => {}),
  stopPropagation: event?.stopPropagation ?? (() => {}),
});

const getTextValue = (valueOrEvent: any) => {
  if (typeof valueOrEvent === "string") {
    return valueOrEvent;
  }

  return valueOrEvent?.nativeEvent?.text ?? valueOrEvent?.target?.value ?? "";
};

const createChangeEvent = (valueOrEvent: any) => ({
  target: { value: getTextValue(valueOrEvent) },
});

export const reactNativeFeature: FeatureImplementation = {
  key: "react-native-feature",
  overwrites: [
    "selection",
    "drag-and-drop",
    "search",
    "renaming",
    "checkboxes",
  ],

  treeInstance: {
    updateDomFocus: ({ tree }) => {
      setTimeout(() => {
        const focusedItem = tree.getFocusedItem();
        tree.getConfig().scrollToItem?.(focusedItem);
        (focusedItem.getElement() as any)?.focus?.();
      });
    },

    getContainerProps: ({ prev, tree }, treeLabel) => {
      const prevProps = prev?.(treeLabel) ?? {};
      return mapSharedProps({
        ...prevProps,
        focusable: prevProps.focusable ?? true,
        onBlur: (event: any) => {
          prevProps.onBlur?.(event);
          clearPressedKeys(tree);
        },
        onKeyDown: (event: KeyboardEventLike) => {
          prevProps.onKeyDown?.(event);
          dispatchReactNativeKeyDown(tree, event);
        },
        onKeyUp: (event: KeyboardEventLike) => {
          prevProps.onKeyUp?.(event);
          dispatchReactNativeKeyUp(tree, event);
        },
      });
    },

    getSearchInputElementProps: ({ prev, tree }) => {
      const prevProps = prev?.() ?? {};
      return omitProps(
        mapSharedProps({
          ...prevProps,
          autoFocus: true,
          onBlur: (event: any) => {
            prevProps.onBlur?.(event);
            clearPressedKeys(tree);
          },
          onChangeText: (valueOrEvent: any) => {
            prevProps.onChange?.(createChangeEvent(valueOrEvent));
          },
          onKeyPress: (event: KeyboardEventLike) => {
            prevProps.onKeyPress?.(event);
            dispatchReactNativeKeyDown(tree, event, true, true);
          },
          onSubmitEditing: (event: any) => {
            prevProps.onSubmitEditing?.(event);
            dispatchReactNativeKeyDown(
              tree,
              { nativeEvent: { code: "Enter", key: "Enter" } },
              true,
              true,
            );
          },
        }),
        ["onChange"],
      );
    },
  },

  itemInstance: {
    getProps: ({ item, prev }) => {
      const prevProps = prev?.() ?? {};
      return omitProps(
        mapSharedProps({
          ...prevProps,
          focusable: prevProps.focusable ?? true,
          onFocus: (event: any) => {
            prevProps.onFocus?.(event);
            item.setFocused();
          },
          onPress: (event: any) => {
            prevProps.onPress?.(event);
            prevProps.onClick?.(toClickEvent(event));
          },
        }),
        ["onClick"],
      );
    },

    getCheckboxProps: ({ prev }) => {
      const prevProps = prev?.() ?? {};
      return omitProps(
        {
          ...prevProps,
          onValueChange: (value: boolean) => {
            prevProps.onValueChange?.(value);
            prevProps.onChange?.(value);
          },
          value: prevProps.value ?? prevProps.checked,
        },
        ["checked", "onChange", "ref"],
      );
    },

    getRenameInputProps: ({ prev, tree }) => {
      const prevProps = prev?.() ?? {};
      return omitProps(
        mapSharedProps({
          ...prevProps,
          autoFocus: true,
          onBlur: (event: any) => {
            prevProps.onBlur?.(event);
            clearPressedKeys(tree);
          },
          onChangeText: (valueOrEvent: any) => {
            prevProps.onChange?.(createChangeEvent(valueOrEvent));
          },
          onKeyPress: (event: KeyboardEventLike) => {
            prevProps.onKeyPress?.(event);
            dispatchReactNativeKeyDown(tree, event, true, true);
          },
          onSubmitEditing: (event: any) => {
            prevProps.onSubmitEditing?.(event);
            dispatchReactNativeKeyDown(
              tree,
              { nativeEvent: { code: "Enter", key: "Enter" } },
              true,
              true,
            );
          },
        }),
        ["onChange"],
      );
    },
  },
};
