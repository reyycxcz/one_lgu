import type { FC } from "react";
import { isValidElement } from "react";

export function isReactComponent(node: unknown): node is FC<{ className?: string }> {
    return typeof node === "function" && !isValidElement(node);
}
