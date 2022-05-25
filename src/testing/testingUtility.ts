import * as path from "path";

export const nameOfFile = (_filename: string) => path.parse(_filename).base.replace(".test", "");
export const nameOfFunc = (func: Function) => `${func.name}()`;