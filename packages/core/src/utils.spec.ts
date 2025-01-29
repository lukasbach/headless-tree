import { describe, expect, it, vi } from "vitest";
import { makeStateUpdater, memo, poll } from "./utils";

vi.useFakeTimers({ shouldAdvanceTime: true });

describe("utilities", () => {
  describe("memo", () => {
    it("returns same value for same arguments", () => {
      const fn = vi.fn(
        (a: number, b: number, c: number, d: number) => a + b + c + d,
      );
      const memoized = memo((c: number, d: number) => [1, 1, c, d], fn);
      expect(memoized(1, 1)).toBe(4);
      expect(memoized(1, 1)).toBe(4);
      expect(memoized(1, 1)).toBe(4);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("returns different values for different arguments", () => {
      const fn = vi.fn(
        (a: number, b: number, c: number, d: number) => a + b + c + d,
      );
      const memoized = memo((c: number, d: number) => [1, 1, c, d], fn);
      expect(memoized(1, 1)).toBe(4);
      expect(memoized(1, 2)).toBe(5);
      expect(memoized(1, 2)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("makeStateUpdater", () => {
    it("updates the state correctly", () => {
      const instance = {
        setState: vi.fn((updater) => {
          const oldState = { focusedItem: "oldValue" };
          const newState = updater(oldState);
          return newState;
        }),
      };

      const updater = makeStateUpdater("focusedItem", instance);
      updater("newValue");

      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith(expect.any(Function));
      const stateUpdateFn = instance.setState.mock.calls[0][0];
      expect(stateUpdateFn({ focusedItem: "oldValue" })).toEqual({
        focusedItem: "newValue",
      });
    });

    it("updates the state using a function updater", () => {
      const instance = {
        setState: vi.fn((updater) => {
          const oldState = { focusedItem: "oldValue" };
          const newState = updater(oldState);
          return newState;
        }),
      };

      const updater = makeStateUpdater("focusedItem", instance);
      updater((prev) => `${prev}Updated`);

      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith(expect.any(Function));
      const stateUpdateFn = instance.setState.mock.calls[0][0];
      expect(stateUpdateFn({ focusedItem: "oldValue" })).toEqual({
        focusedItem: "oldValueUpdated",
      });
    });
  });

  describe("poll", () => {
    it("resolves when the condition is met within the timeout", async () => {
      const condition = vi
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      await expect(poll(condition, 50, 200)).resolves.toBeUndefined();
      expect(condition).toHaveBeenCalledTimes(2);
    });

    it("resolves immediately if the condition is already met", async () => {
      const condition = vi.fn().mockReturnValue(true);
      await expect(poll(condition, 50, 200)).resolves.toBeUndefined();
      expect(condition).toHaveBeenCalledTimes(1);
    });
  });
});
