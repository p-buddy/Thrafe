#! /usr/bin/env node
import * as ts from "typescript";
import { rollup } from "rollup";
import * as fs from "fs";
import * as path from "path";
import * as string_similiarity from "string-similarity";

const root = process.cwd();
const tempDir = path.join(root, "thrafe_temp");
const typeDef = "DefineThread";

const enum EFailure {
  None,
  NoDefineThread,
  MultipleDefineThread,
  TranspilationError,
  BundlingError,
  UnableToLocateTranspiledFile,
  UnableToLocateOutputDir,
  UnableToLocateOutputBundledFile,
}

type TAttempt<TValue> = {
  success: boolean,
  failure?: EFailure,
  value?: TValue
}

function reportError(failure: EFailure, workerFile: string): boolean {
  switch (failure) {
    case EFailure.NoDefineThread:
      break;
    case EFailure.MultipleDefineThread:
      break;
  }
  return false;
}

function tryDeleteDirectory(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  }
  catch {
    console.error("Unable to delete directory: ", dir);
    return false;
  }
}

const removeJsTsExtension = (file: string): string => file.replace(".ts", "").replace(".js", "");
const fileNameNoExtension = (file: string): string => removeJsTsExtension(path.parse(file).base);

function getAllFilesFromDirectory(fullPathToDir: string): string[] {
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

function getFileWithSameNameInDirectory(fullPathToDir: string, file: string): string | undefined {
  const fileNameChecked = fileNameNoExtension(file);
  const matching = getAllFilesFromDirectory(fullPathToDir).filter(filePath => fileNameNoExtension(filePath) === fileNameChecked);
  if (matching.length === 1) return matching[0];
  if (matching.length === 0) return undefined;
  const pathToFileName = path.join(path.parse(file).dir, fileNameChecked);
  const { bestMatchIndex } = string_similiarity.findBestMatch(pathToFileName, matching);
  return bestMatchIndex >= 0 && bestMatchIndex < matching.length ? matching[bestMatchIndex] : undefined;
}

const isDefineThreadType = (type: ts.Type) => (type as ts.TypeReference).target?.aliasSymbol?.name === typeDef;
const getThreadNameForType = (type: ts.Type) => (type as any).mapper.targets[0].value;

function tryRetrieveThreadIdentifier(program: ts.Program): TAttempt<string> {
  let attempt: TAttempt<string> = {
    success: false,
    failure: EFailure.NoDefineThread,
    value: undefined
  };
  const typeChecker = program.getTypeChecker();
  for (const source of program.getSourceFiles()) {
    ts.forEachChild(source, node => {
      const type = typeChecker.getTypeAtLocation(node);
      if (!isDefineThreadType(type)) return;
      attempt = attempt.value === undefined
        ? {
          success: true,
          failure: EFailure.None,
          value: getThreadNameForType(type)
        }
        : {
          success: false,
          failure: EFailure.MultipleDefineThread,
        }
    });
  }

  return attempt;
}

function logDiagnostics(program: ts.Program, result: ts.EmitResult) {
  ts.getPreEmitDiagnostics(program)
    .concat(result.diagnostics)
    .forEach(diagnostic => {
      const flattenedMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      if (!diagnostic.file) return console.log(flattenedMessage);
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${flattenedMessage}`);
    });
}

function tryEmitProgram(program: ts.Program): TAttempt<never> {
  let result = program.emit();
  logDiagnostics(program, result);
  return {
    success: !result.emitSkipped,
    failure: !result.emitSkipped ? EFailure.None : EFailure.TranspilationError
  };
}

async function tryBundleThreadAsWorker(entry: string, outputName: string, outputDir: string): Promise<TAttempt<never>> {
  if (!fs.existsSync(outputDir)) return { success: false, failure: EFailure.UnableToLocateOutputDir };
  const input = getFileWithSameNameInDirectory(tempDir, entry);
  if (input === undefined) return { success: false, failure: EFailure.UnableToLocateTranspiledFile };
  const outputFile = path.join(outputDir, `${outputName}.js`);
  try {
    const build = await rollup({ input });
    await build.write({
      sourcemap: 'inline',
      file: outputFile,
      format: 'iife'
    });
    return fs.existsSync(outputFile) ? { success: true } : { success: false, failure: EFailure.UnableToLocateOutputBundledFile };
  }
  catch (e) {
    console.error(e);
    return { success: false, failure: EFailure.BundlingError };
  }
}

async function tryTranspileAndBundle(entryTsFile: string, outDir: string, options: ts.CompilerOptions): Promise<boolean> {
  const program = ts.createProgram([entryTsFile], options);
  const identifier = tryRetrieveThreadIdentifier(program);
  if (!identifier.success) return reportError(identifier.failure, entryTsFile);
  const emit = tryEmitProgram(program);
  if (!emit.success) return reportError(emit.failure, entryTsFile);
  const bundling = await tryBundleThreadAsWorker(entryTsFile, identifier.value, outDir);
  if (!bundling.success) return reportError(bundling.failure, entryTsFile);
  return true;
}

async function compile(workerFiles: string[], outDir: string, options: ts.CompilerOptions) {
  if (!tryDeleteDirectory(tempDir)) return;
  for (const workerFile of workerFiles) {
    const result = tryTranspileAndBundle(workerFile, outDir, options);
    if (result && !tryDeleteDirectory(tempDir)) {
      console.error(`Unable to clear out temp directory: ${tempDir}. Exiting early.`);
      return;
    }
    else if (!result) {
      console.error(`Failed to transpile and bundle ${workerFile}. Exiting early.`);
      return;
    }
  }
}

compile(process.argv.slice(2), root, {
  outDir: tempDir,
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.ES2020,
  inlineSourceMap: true,
  paths: {
    "$lib": [
      "./testSite/src/lib"
    ],
    "$lib/*": [
      "./testSite/src/lib/*"
    ],
  }
});