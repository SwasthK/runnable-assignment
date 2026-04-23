import { parse } from "@babel/parser";

export function parseJSX(code: string) {
  return parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  })
}
