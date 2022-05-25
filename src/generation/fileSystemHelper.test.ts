import * as mocha from 'mocha'; // unused, but makes it clear mocha is testing framework
import * as chai from 'chai';
import * as fs from "fs";
import { nameOfFile, nameOfFunc } from "../testing/testingUtility";

import { tryDeleteDirectory, getAllFilesFromDirectory, getFileWithSameBaseNameInOtherDirectory } from './fileSystemHelper';
import * as path from "path";

const expect = chai.expect;

const makeTestDir = () => {
  const dirName = `test-${Date.now()}`;
  fs.mkdirSync(dirName);
  return dirName;
}

describe(nameOfFile(__filename), () => {
  describe(nameOfFunc(getFileWithSameBaseNameInOtherDirectory), () => {
    it('should identify file with same name', () => {
      const testFileName = 'test';
      const sourceDir = 'dummy';
      const testFilePath = path.resolve(sourceDir, testFileName);
      const targetDir = makeTestDir();
      const expected = path.resolve(targetDir, testFileName);
      fs.writeFileSync(expected, "");
      const actual = getFileWithSameBaseNameInOtherDirectory(path.resolve(targetDir), testFilePath);
      expect(actual).to.equal(expected);
      expect(tryDeleteDirectory(targetDir)).equal(true);
    });

    it('should handle cases when multiple files have the same name at different levels', () => {
      const subDirs = ['1', '2', '3'];
      const testFileNames = ['test', ...subDirs.map((_, index) => path.join(...subDirs.slice(0, index + 1), 'test'))];
      const sourceDir = 'dummy';
      const testFilePaths = testFileNames.map(name => path.resolve(sourceDir, name));
      const targetDir = makeTestDir();

      subDirs.reduce((previous, current) => {
        const pathToDir = path.join(previous, current);
        fs.mkdirSync(path.resolve(targetDir, pathToDir));
        return pathToDir;
      }, "");

      const targetFilePaths = testFileNames.map(name => {
        const absolute = path.resolve(targetDir, name);
        fs.writeFileSync(absolute, "");
        return absolute;
      });

      const testCases = testFilePaths.reduce((arr, val, index) => {
        arr.push({ input: val, expected: targetFilePaths[index] });
        return arr;
      }, new Array<{ input: string, expected: string }>());

      for (const { input, expected } of testCases) {
        const actual = getFileWithSameBaseNameInOtherDirectory(targetDir, input);
        expect(actual).to.equal(expected);
      }

      expect(tryDeleteDirectory(targetDir)).equal(true);
    });
  })

  describe(nameOfFunc(getAllFilesFromDirectory), () => {

    it('should collect all files at root', () => {
      const dirName = makeTestDir();
      const fileCount = 4;
      const fileNames = Array.from(new Array(fileCount).keys()).map(i => `file-${i}`);
      fileNames.forEach(file => fs.writeFileSync(path.join(dirName, file), ""));
      const expected = fileNames.map(file => path.resolve(path.join(dirName, file)));
      const actual = getAllFilesFromDirectory(path.resolve(dirName));
      expect(actual).to.eql(expected);
      expect(tryDeleteDirectory(dirName)).equal(true);
    });

    it('should collect nested files', () => {
      const dirName = makeTestDir();
      const childDirCount = 4;
      const childDirs = Array.from(new Array(childDirCount).keys()).map(i => `dir-${i}`);
      childDirs.forEach(dir => fs.mkdirSync(path.join(dirName, dir)));
      const fileCount = 4;
      const fileNames = Array.from(new Array(fileCount).keys()).map(i => `file-${i}`);
      childDirs.forEach(nested => fileNames.forEach(file => fs.writeFileSync(path.join(dirName, nested, file), "")));
      const expected = childDirs.map(childDir => fileNames.map(fileName => path.resolve(dirName, childDir, fileName))).flat();
      const actual = getAllFilesFromDirectory(path.resolve(dirName));
      expect(actual).to.eql(expected);
      expect(tryDeleteDirectory(dirName)).equal(true);
    });
  });
});

