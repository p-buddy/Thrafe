import * as fs from "fs";
import * as path from "path";

export function tryDeleteDirectory(dir: string, succeedIfDirDoesNotExist: boolean = true): boolean {
  if (!fs.existsSync(dir)) return succeedIfDirDoesNotExist;
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  }
  catch {
    console.error("Unable to delete directory: ", dir);
    return false;
  }
}

export function getAllFilesFromDirectory(fullPathToDir: string): string[] {
  let files = [];
  fs.readdirSync(fullPathToDir).forEach(file => {
    const fullPath = path.join(fullPathToDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllFilesFromDirectory(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

const tsExt = ".ts";
const jsExt = ".js";
const removeJsTsExtension = (file: string): string => file.replace(tsExt, "").replace(jsExt, "");
const fileNameWithoutCodeExtension = (file: string): string => removeJsTsExtension(path.parse(file).base);

export function getFileWithSameNameInOtherDirectory(fullPathToDir: string, fullPathToFile: string): string | undefined {
  const fileName = fileNameWithoutCodeExtension(fullPathToFile);
  const matching = getAllFilesFromDirectory(fullPathToDir).filter(filePath => fileNameWithoutCodeExtension(filePath) === fileName);
  if (matching.length === 1) return matching[0];
  if (matching.length === 0) return undefined;
  for (const match of matching) {
    const relative = path.relative(fullPathToDir, match);
    if (fullPathToFile.includes(relative)) return match; // this needs testing
  }
  return undefined;
}