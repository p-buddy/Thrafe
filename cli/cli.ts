#! /usr/bin/env node
import * as ts from "typescript";
import { rollup } from "rollup";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

//^export[\n\r\s]*type[\n\r\s]*[a-zA-Z$_][a-zA-Z0-9_$]*[\n\r\s]*=[\n\r\s]*DefineThread<"([a-zA-Z0-9_$\-\.]*)"[\n\r\s]*.
const matchExport = "export";
const matchType = "type";
const matchStartOfLine = "^";
const matchAnyWhiteSpace = "\s*";
const matchEquals = "=";
const matchAnyWhiteSpaceOrNewLine = "[\n\r\s]*";
const matchVariableStart = "[a-zA-Z$_]";
const matchVaraibleRemainder = "[a-zA-Z0-9_$]*";
const matchAndGroupWorkerName = "\"([a-zA-Z0-9_$\-\.]*)\"";
const matchVariableName = matchVariableStart + matchVaraibleRemainder;
const matchDefineThread = "DefineThread" + matchAnyWhiteSpace + "<";

const regex = matchStartOfLine
  + matchAnyWhiteSpace
  + matchExport
  + matchAnyWhiteSpaceOrNewLine
  + matchType
  + matchAnyWhiteSpaceOrNewLine
  + matchVariableName
  + matchAnyWhiteSpaceOrNewLine
  + matchEquals
  + matchAnyWhiteSpaceOrNewLine
  + matchDefineThread
  + matchAnyWhiteSpaceOrNewLine
  + matchAndGroupWorkerName
  + matchAnyWhiteSpaceOrNewLine
  + ",";

compile(process.argv.slice(2), {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.ES2020,
});

console.log('gu');