export const unused91023=0;
//
// import { join as joinPath, resolve as resolvePath, sep as pathSep } from "path";
// import { Dirent, readFileSync, writeFileSync } from "fs";
// import { IntIdManager, Lexer, makeTokenWriter } from "ystd";
//
//
// import { readDirRecursive } from "ystd_server";
// interface Settings {
//     srcPath: string;
//     logEachFixedFile?: boolean;
//
//     // Not used
//     dbPath: string;
//     rebuildDb: boolean;
//     watch: boolean;
//     interval?: number; // seconds before notification
//     noDb?: boolean;
// }
//
// interface FileCplData {
//     cpls: Set<string>;
// }
//
// const MAX_CPL_VALUE = 99999999;
// const CPL_VALUE_LEN = (MAX_CPL_VALUE + "").length;
// const CPL_FULL_LEN = CPL_VALUE_LEN + 4;
// const CPL_PADDER = "00000000000000000000000000000000000000000000000000000000000000000000".substr(CPL_VALUE_LEN);
// const CPL_NUM_REGEXP = (() => {
//     let r = "";
//     for (let i = 0; i < CPL_VALUE_LEN; i++) r += "[0-9]";
//     return RegExp(r);
// })();
//
// const cplToNum = (cplStr: string): number => {
//     return Number(cplStr.substr(4, 8));
// };
// const cplToStr = (cplValue: number): string => {
//     const x = CPL_PADDER + cplValue;
//     return "CODE" + x.substr(x.length - CPL_VALUE_LEN);
// };
//
// interface CplItem {
//     cplNum: number;
//     filePath: string;
//     pos: number;
// }
//
// export interface CompilationContext {
//     unused: any;
// }
//
// export const startup = (settings: Settings) => {
//     throw new Error(`Lexer не работает на DomainCompiler\\\\types\\\\ItemType.ts`);
//     console.log(`ycplmonLib3`);
//     console.time(`Finished in`);
//     const freeCplManager = new IntIdManager({ a: 1, b: 100000000 });
//     const cplJsonPath = resolvePath(settings.srcPath, "cpl.json");
//     let oldSavedCpls;
//
//     const oldCpl = new Map<number, CplItem>();
//     try {
//         oldSavedCpls = readFileSync(cplJsonPath, "utf-8");
//         const f = JSON.parse(oldSavedCpls);
//         for (const cplItem of f) oldCpl.set(cplItem.cplNum, cplItem);
//         console.log(`Reading cpls from ${cplJsonPath}`);
//     } catch (e) {
//         console.error(`Failed to read cpls from ${cplJsonPath}`, e);
//         oldCpl.clear();
//     }
//
//     const newCpls = new Map<number, CplItem[]>();
//     const badCplFiles = new Map<string, Set<number>>();
//     const badCpls: Set<CplItem[]> = new Set<CplItem[]>();
//     let totalFixes = 0;
//
//     const fileFilter = (filePath: string): boolean => {
//         if (!filePath.endsWith(".ts") && !filePath.endsWith(".js")) return false;
//         const parts = filePath.split(pathSep);
//         if (parts.includes("node_modules") || parts.includes(".git")) return false;
//         return true;
//     };
//
//     const saveToBadCplFiles = (badCplItem: CplItem) => {
//         const badCplFileSet = badCplFiles.get(badCplItem.filePath) || new Set();
//         if (!badCplFileSet.size) badCplFiles.set(badCplItem.filePath, badCplFileSet);
//         badCplFileSet.add(badCplItem.pos);
//     };
//
//     const onFile = (filePath: string, readMode: boolean, poses?: Set<number>): void => {
//         const startedFileWrite = false;
//
//         if (!readMode) {
//             if (!poses) throw new Error(`CODE00000010 'poses' should be set if readMode === false`);
//             else totalFixes += poses!.size;
//         }
//
//         const oldCode = readFileSync(filePath, "utf-8");
//         let code = oldCode;
//         const context: CompilationContext = {} as any;
//
//         //=================== FIX CODExxxxxxxx start =============================
//         try {
//             const lexer = new Lexer(code, filePath, context);
//             const { parts, replace, keep, generateWithOutSourcemap } = makeTokenWriter(lexer);
//             const cplMatcher = /[C][O][D][E][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]/;
//             const normalMatchers = [cplMatcher];
//
//             while (!lexer.done()) {
//                 const { prefix, matched } = lexer.read_till(normalMatchers);
//                 if (!readMode) keep(prefix);
//
//                 if (matched)
//                     switch (matched.matchedWith) {
//                         case cplMatcher: {
//                             const cplStr = matched.v;
//                             const cplNum = cplToNum(matched.v);
//                             const cplItem = { cplNum, filePath, pos: matched.p };
//
//                             const r: CplItem[] = newCpls.get(cplNum) || [];
//
//                             if (readMode) {
//                                 if (r.length || !cplNum) {
//                                     saveToBadCplFiles(cplItem);
//                                     badCpls.add(r);
//                                 } else newCpls.set(cplNum, r);
//                                 r.push(cplItem);
//                                 freeCplManager.removeId(cplItem.cplNum);
//                             } else {
//                                 if (poses!.has(cplItem.pos)) {
//                                     cplItem.cplNum = freeCplManager.newId();
//                                     newCpls.set(cplNum, [cplItem]);
//                                     replace(matched, cplToStr(cplItem.cplNum));
//                                 }
//                             }
//                             break;
//                         }
//                     }
//             }
//
//             if (!readMode) code = generateWithOutSourcemap();
//         } catch (e) {
//             console.error(filePath, " - error processing file ", e);
//         }
//         //=================== FIX CODExxxxxxxx end =============================
//
//         if (!readMode) {
//             if (code.trim().length !== oldCode.trim().length)
//                 console.error(
//                     `${filePath} - ERROR processing file - generated length (${code.trim().length}) differs from original length (${
//                         oldCode.trim().length
//                     })`,
//                 );
//             else if (code !== oldCode)
//                 try {
//                     writeFileSync(filePath, code, "utf-8");
//                     if (settings.logEachFixedFile) console.log(`${filePath} - fixed ${poses!.size} cpls `);
//                 } catch (e) {
//                     console.error(`${filePath} - ERROR FAILED TO WRITE fix for ${poses!.size} cpls `, e);
//                     try {
//                         writeFileSync(filePath, oldCode, "utf-8");
//                     } catch (e2) {
//                         console.error("Failed to revert file to original code!");
//                     }
//                 }
//         }
//     };
//
//     readDirRecursive(settings.srcPath, (dirPath: string, dirent: Dirent): boolean => {
//         const filePath = joinPath(dirPath, dirent.name);
//         if (dirent.isDirectory()) return true;
//
//         if (!fileFilter(filePath)) return false;
//         onFile(filePath, true);
//         return false;
//     });
//
//     for (const cplItems of badCpls) {
//         const cplNum = cplItems[0].cplNum;
//         const oldCplItem = oldCpl.get(cplNum) || (({} as any) as CplItem);
//         let maxScope = 0;
//         let maxScoreIndex = 0;
//         for (let i = 0; i < cplItems.length; i++) {
//             const newCplItem = cplItems[i];
//             const score = newCplItem.filePath === oldCplItem.filePath ? 1000000000 - Math.abs(newCplItem.pos - oldCplItem.pos) : 0;
//             if (score < maxScope) {
//                 maxScope = score;
//                 maxScoreIndex = i;
//             }
//         }
//
//         newCpls.set(cplNum, cplItems.splice(maxScoreIndex, 0));
//         for (const badCplItem of cplItems) saveToBadCplFiles(badCplItem);
//     }
//
//     for (const [filePath, poses] of badCplFiles) onFile(filePath, false, poses);
//
//     const cplItemsForSaving: CplItem[] = [];
//     for (const p of newCpls) cplItemsForSaving.push(p[1][0]);
//
//     const newSavedCpls = JSON.stringify(cplItemsForSaving, undefined, " ");
//     if (oldSavedCpls !== newSavedCpls) {
//         console.log(`Writing cpls to ${cplJsonPath}`);
//         writeFileSync(cplJsonPath, newSavedCpls, "utf-8");
//     }
//
//     console.log(`Fixed ${totalFixes} cpls in ${badCplFiles.size} files`);
//     console.timeEnd(`Finished in`);
// };
