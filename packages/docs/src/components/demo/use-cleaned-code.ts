import { useMemo } from "react";

export const useCleanedCode = (original: string) =>
  useMemo(() => {
    const lines = original.split("\n");
    if (lines.some((line) => line.includes("// story-start"))) {
      const start = lines.findIndex((line) => line.includes("// story-start"));
      lines.splice(0, start + 1);
    }

    if (lines.some((line) => line.includes("// story-end"))) {
      const end = lines.findIndex((line) => line.includes("// story-end"));
      lines.splice(end);
    }

    for (let i = 0; i < lines.length; i++) {
      if (/action\(".*",.*\)/.test(lines[i])) {
        lines.splice(i, 1);
      }
    }

    return lines.join("\n");
  }, [original]);
