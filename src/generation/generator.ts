import * as ts from "typescript";
import { rollup } from "rollup";
import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import { getFileWithSameBaseNameInOtherDirectory, tryDeleteDirectory } from "./fileSystemHelper";
import { EFailure, TAttempt, reportFailure } from "./errorHandling";

const root = process.cwd();
const tempDir = path.join(root, "thrafe_temp");
const typeDef = "DefineThreadArchitecture";

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

function tryEmitProgram(program: ts.Program): TAttempt<never> {
  let result = program.emit();
  ts.getPreEmitDiagnostics(program)
    .concat(result.diagnostics)
    .forEach(diagnostic => {
      const flattenedMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      if (!diagnostic.file) return console.log(flattenedMessage);
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${flattenedMessage}`);
    });
  return {
    success: !result.emitSkipped,
    failure: !result.emitSkipped ? EFailure.None : EFailure.TranspilationError
  };
}

async function tryBundleThreadAsWorker(entry: string, outputName: string, outputDir: string): Promise<TAttempt<never>> {
  if (!fs.existsSync(outputDir)) return { success: false, failure: EFailure.UnableToLocateOutputDir };
  const input = getFileWithSameBaseNameInOtherDirectory(tempDir, entry);
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
  if (!identifier.success) return reportFailure(identifier.failure, entryTsFile);
  const emit = tryEmitProgram(program);
  if (!emit.success) return reportFailure(emit.failure, entryTsFile);
  const bundling = await tryBundleThreadAsWorker(entryTsFile, identifier.value, outDir);
  if (!bundling.success) return reportFailure(bundling.failure, entryTsFile);
  return true;
}

export type Options = Omit<ts.CompilerOptions, "outDir" | "noEmitOnError" | "inlineSourceMap">;

export async function generateWorkerThreadAssets(workerFiles: string[], options: Options, assetDir: string) {
  if (!tryDeleteDirectory(tempDir)) return;

  const combinedOptions: ts.CompilerOptions = {
    ...options,
    outDir: tempDir,
    noEmitOnError: true,
    inlineSourceMap: true,
  };

  for (const workerFile of workerFiles) {
    const result = await tryTranspileAndBundle(workerFile, assetDir, combinedOptions);
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

export async function generateAssetsForGlob(globPattern: string, options: Options, assetDir: string) {
  glob(globPattern, (err, files) => {
    if (err) return console.error("Supplied glob pattern resulted in the following error: ", err);
    generateWorkerThreadAssets(files, options, assetDir);
  });
}

/*
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
});*/