#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ts = require("typescript");
var rollup_1 = require("rollup");
var fs = require("fs");
var path = require("path");
var root = process.cwd();
var tempDir = path.join(root, "thrafe_temp");
var typeDef = "DefineThread";
function tryDeleteDirectory(dir) {
    if (!fs.existsSync(dir))
        return true;
    try {
        fs.rmSync(dir, { recursive: true, force: true });
        return true;
    }
    catch (_a) {
        console.error("Unable to delete directory: ", dir);
        return false;
    }
}
var removeJsTsExtension = function (file) { return file.replace(".ts", "").replace(".js", ""); };
var fileNameNoExtension = function (file) { return removeJsTsExtension(path.parse(file).base); };
function getAllFilesFromDirectory(fullPathToDir) {
    var files = [];
    fs.readdirSync(fullPathToDir).forEach(function (file) {
        var fullPath = path.join(fullPathToDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files.push.apply(files, getAllFilesFromDirectory(fullPath));
        }
        else {
            files.push(fullPath);
        }
    });
    return files;
}
function getFileWithSameNameInDirectory(fullPathToDir, file) {
    var fileNameChecked = fileNameNoExtension(file);
    var matching = getAllFilesFromDirectory(fullPathToDir).filter(function (filePath) { return fileNameNoExtension(filePath) === fileNameChecked; });
    if (matching.length === 1)
        return matching[0];
    if (matching.length === 0)
        throw Error("Could not find any file with name '".concat(fileNameChecked, "' inside of ").concat(fullPathToDir));
    throw Error("More than one file with name '".concat(fileNameChecked, "' found inside of ").concat(fullPathToDir));
}
var getThreadNameForType = function (type) { return type.mapper.targets[0].value; };
function tryRetrieveNameForBundle(program, workerFile) {
    var workerName = undefined;
    var typeChecker = program.getTypeChecker();
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var source = _a[_i];
        ts.forEachChild(source, function (node) {
            var _a, _b;
            var type = typeChecker.getTypeAtLocation(node);
            var name = (_b = (_a = type.target) === null || _a === void 0 ? void 0 : _a.aliasSymbol) === null || _b === void 0 ? void 0 : _b.name;
            var isThreadDefinition = name === typeDef;
            if (!isThreadDefinition)
                return;
            if (workerName === undefined) {
                workerName = getThreadNameForType(type);
                return;
            }
            workerFile = undefined;
            throw new Error("Attempt to double define thread for worker file: ".concat(workerFile));
        });
    }
    return workerName;
}
function logDiagnostics(program, result) {
    ts.getPreEmitDiagnostics(program)
        .concat(result.diagnostics)
        .forEach(function (diagnostic) {
        var flattenedMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (!diagnostic.file)
            return console.log(flattenedMessage);
        var _a = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start), line = _a.line, character = _a.character;
        console.log("".concat(diagnostic.file.fileName, " (").concat(line + 1, ",").concat(character + 1, "): ").concat(flattenedMessage));
    });
}
function bundleWorker(entry, outputName) {
    return __awaiter(this, void 0, void 0, function () {
        var input, outputFile, build;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = getFileWithSameNameInDirectory(tempDir, entry);
                    outputFile = path.join(process.cwd(), "".concat(outputName, ".js"));
                    return [4 /*yield*/, (0, rollup_1.rollup)({ input: input })];
                case 1:
                    build = _a.sent();
                    return [4 /*yield*/, build.write({
                            sourcemap: 'inline',
                            file: outputFile,
                            format: 'iife'
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function compile(workerFiles, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, workerFiles_1, workerFile, program, name_1, emitResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!tryDeleteDirectory(tempDir))
                        return [2 /*return*/];
                    _i = 0, workerFiles_1 = workerFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < workerFiles_1.length)) return [3 /*break*/, 4];
                    workerFile = workerFiles_1[_i];
                    program = ts.createProgram([workerFile], options);
                    name_1 = tryRetrieveNameForBundle(program, workerFile);
                    if (name_1 === undefined)
                        return [2 /*return*/];
                    emitResult = program.emit();
                    logDiagnostics(program, emitResult);
                    if (emitResult.emitSkipped)
                        return [2 /*return*/];
                    return [4 /*yield*/, bundleWorker(workerFile, name_1)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
compile(process.argv.slice(2), {
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
        ]
    }
});
