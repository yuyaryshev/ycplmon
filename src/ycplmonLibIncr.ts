// TODO Бесконечно заменяет файл снова и снова. При использовании watch соместно с Webstorm теряются данные.

export const unused91023=0;
//
// import { join as joinPath, sep as pathSep } from "path";
// import Database from "better-sqlite3";
// import { Dirent, readFileSync, Stats, writeFileSync } from "fs";
// import { IntIdManagerForSqlite } from "ystd";
// import watch, { FileOrFiles } from "watch";
//
// import { readDirRecursive } from "ystd_server";
// interface Settings {
//     dbPath: string;
//     srcPath: string;
//     rebuildDb: boolean;
//     watch: boolean;
//     interval?: number; // seconds before notification
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
// const cplStr = (cplValue: number): string => {
//     const x = CPL_PADDER + cplValue;
//     return "CODE" + x.substr(x.length - CPL_VALUE_LEN);
// };
//
// interface CplCacheItem {
//     cpl: number;
//     filePath: string;
//     lastUse: Date;
// }
//
// export const startup = (settings: Settings) => {
//     const db = new Database(settings.dbPath, {});
//     if (settings.rebuildDb) {
//         try {
//             db.exec("drop table free_cpl");
//         } catch (e) {}
//         try {
//             db.exec("drop table cpl");
//         } catch (e) {}
//         try {
//             db.exec("drop table changed_files");
//         } catch (e) {}
//     }
//
//     try {
//         db.exec("create table cpl(cpl,path)");
//         db.exec("create unique index ix_cpl on cpl(cpl)");
//         db.exec("create table changed_files(path)");
//     } catch (e) {}
//
//     const freeCplManager = new IntIdManagerForSqlite(db, "free_cpl", { a: 1, b: 100000000 }, "select cpl from cpl");
//
//     try {
//         db.exec("PRAGMA synchronous = OFF");
//     } catch (e) {}
//
//     try {
//         db.exec("PRAGMA journal_mode = OFF");
//     } catch (e) {}
//
//     const changedFiles = new Set<string>(
//         db
//             .prepare("select path from changed_files")
//             .all([])
//             .map((f) => f.path),
//     );
//     const clearChangedFilesSql = db.prepare("delete changed_files where 1=1");
//     const insertIntoChangedFilesSql = db.prepare("insert into changed_files(path) values (?)");
//
//     const getCplSql = db.prepare("select cpl, path from cpl where cpl = ?");
//     const deleteCplsSql = db.prepare("delete from cpl where path = ?");
//     const insertCplSql = db.prepare("insert into cpl (cpl, path) values (?,?)");
//     const deleteCplSql = db.prepare("delete from cpl where cpl = ?");
//
//     const insertedCpls: any[] = [];
//
//     const cplMap = new Map<number, CplCacheItem>();
//     const getCpl = (cpl: number): CplCacheItem | null => {
//         const r = cplMap.get(cpl);
//         if (!r) {
//             const rows = getCplSql.all([cpl]);
//             const filePath = rows.length && rows[0].filePath;
//             if (filePath) {
//                 const r = { cpl, filePath, lastUse: new Date() };
//                 cplMap.set(cpl, r);
//             } else return null;
//         } else {
//             r.lastUse = new Date();
//         }
//         return r || null;
//     };
//
//     const setCpl = (cpl: number, filePath: string) => {
//         freeCplManager.removeId(cpl);
//         let r = cplMap.get(cpl);
//         if (r && r.filePath === filePath) return;
//
//         insertedCpls.push([cpl, filePath]);
//         r = { cpl, filePath, lastUse: new Date() };
//         cplMap.set(cpl, r);
//     };
//
//     let closingApp = false;
//
//     const regular = () => {
//         freeCplManager.save();
//         if (insertedCpls.length) {
//             for (const p of insertedCpls)
//                 try {
//                     insertCplSql.run(p);
//                 } catch (e) {
//                     deleteCplSql.run(p[0]);
//                     insertCplSql.run(p);
//                 }
//             insertedCpls.length = 0;
//         }
//
//         if (!closingApp) setTimeout(regular, 300);
//     };
//     regular();
//
//     const onFileDeleted = (filePath: string) => {
//         deleteCplsSql.run([filePath]);
//     };
//
//     const fileFilter = (filePath: string): boolean => {
//         if (!filePath.endsWith(".ts") && !filePath.endsWith(".js")) return false;
//         const parts = filePath.split(pathSep);
//         if (parts.includes("node_modules") || parts.includes(".git")) return false;
//         return true;
//     };
//
//     const onFile = (filePath: string): void => {
//         const startedFileWrite = false;
//         let hasChanges = false;
//         hasChanges = false;
//
//         const oldCode = readFileSync(filePath, "utf-8");
//         let code = oldCode;
//
//         try {
//             const codeParts = code.split("CODE");
//             const newCodeParts = [codeParts[0]];
//             const codePartsLn = codeParts.length;
//
//             for (let i = 1; i < codePartsLn; i++) {
//                 const codePart = codeParts[i];
//                 let cplStrValue = codePart.substr(0, 8);
//                 const restString = codePart.substr(8);
//                 if (CPL_NUM_REGEXP.test(cplStrValue)) {
//                     let cplValue = Number(cplStrValue);
//                     const cplItem = getCpl(cplValue);
//
//                     if (!cplValue || cplItem) {
//                         // && cplItem.filePath !== filePath) {
//                         hasChanges = true;
//                         cplValue = freeCplManager.newId();
//                         cplStrValue = cplStr(cplValue).substr(4);
//                     }
//                     setCpl(cplValue, filePath);
//                 }
//
//                 newCodeParts.push("CODE");
//                 newCodeParts.push(cplStrValue);
//                 newCodeParts.push(restString);
//             }
//
//             code = newCodeParts.join("");
//         } catch (e) {
//             console.error(filePath, " - error processing file ", e);
//         }
//
//         if (code.trim().length !== oldCode.trim().length)
//             console.error(filePath, " - error processing file - generated length differs from original length");
//         else if (hasChanges && code && code.length)
//             try {
//                 writeFileSync(filePath, code, "utf-8");
//             } catch (e) {
//                 console.error(filePath, " - error processing file ", e);
//                 try {
//                     writeFileSync(filePath, oldCode, "utf-8");
//                 } catch (e2) {
//                     console.error("Failed to revert file to original code!");
//                 }
//             }
//     };
//
//     console.log(`CplMon started!`);
//     if (settings.watch) {
//         console.log(`Starting file watch for ${settings.srcPath}`);
//
//         const onWatchItem = (f: string, action: string) => {
//             if (!changedFiles.has(f)) {
//                 changedFiles.add(f);
//                 insertIntoChangedFilesSql.run([f]);
//             }
//         };
//         watch.createMonitor(
//             settings.srcPath,
//             {
//                 //        filter: fileFilter,
//                 interval: settings.interval || 10,
//             },
//             function (monitor) {
//                 // monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
//                 monitor.on("created", function (files: FileOrFiles, stat: Stats) {
//                     for (const f of Array.isArray(files) ? files : [files]) onWatchItem(f, "created");
//                 });
//                 monitor.on("changed", function (files: FileOrFiles, curr: Stats, prev: Stats) {
//                     for (const f of Array.isArray(files) ? files : [files]) onWatchItem(f, "changed");
//                 });
//                 monitor.on("removed", function (files: FileOrFiles, stat: Stats) {
//                     for (const f of Array.isArray(files) ? files : [files]) onWatchItem(f, "removed");
//                 });
//                 // monitor.stop(); // Stop watching
//             },
//         );
//     }
//
//     console.log(`Parsing files in ${settings.srcPath}... `);
//     readDirRecursive(settings.srcPath, (dirPath: string, dirent: Dirent): boolean => {
//         const filePath = joinPath(dirPath, dirent.name);
//         if (dirent.isDirectory()) return true;
//
//         if (!fileFilter(filePath)) return false;
//         onFile(filePath);
//         return false;
//     });
//     console.log(`Done parsing files in ${settings.srcPath}`);
//     closingApp = closingApp || !settings.watch;
// };
//
// // startup({
// //     dbPath: `D:\\b\\Mine\\GIT_Work\\testDir\\cpl.db`,
// //     srcPath: `D:\\b\\Mine\\GIT_Work\\testDir\\src\\Unused`,
// //     rebuildDb: false,
// // });
