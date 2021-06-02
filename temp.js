const {
    durationEngStrToMsDuration,
    strIntervalsToDurations,
    msDurationToApproxDurationObj,
    durationObjToEngStr,
} = require("./ts_out/src/Ystd/YTimeIntervals.js");

const MilliSeconds = 1;
const Seconds = 1000;
const Minutes = 60000;
const Hours = 3600000;
const Days = 86400000;
const Weeks = 604800000;
const ApproxMonths = 30 * Days;
const ApproxYears = 365 * Days;
const luxon = require("luxon");
const { Duration } = require("luxon");

const dur = Duration.fromObject(msDurationToApproxDurationObj(123000005001)).toObject();
console.log(dur);
const durStr = durationObjToEngStr(dur, 0);
console.log(durStr);

const dur2ms = durationEngStrToMsDuration(durStr);
console.log(dur2ms);
const dur2 = Duration.fromObject(msDurationToApproxDurationObj(dur2ms)).toObject();
console.log(dur2);

//toFormat(fmt: string, opts: Object): string
// const s = `,assignee, reporter,isAcceptedByAssignee,isInProgress,isFinished,isWaiting,isAcceptedByManager,isAcceptedByReporter,isSucceded,labels,workDaysDuration,calendarDaysDuration,remainingEstimate,createdDate,startDate,dueDate,expectedStartDate,expectedEndDate,epicLink,jiraKey,waitType,waitDate,`
//     .split(",")
//     .map((s) => s.trim())
//     .filter((s) => s.length);
//
// console.log(s.map((s) => `${s}: t.${s}.get(),\n`).join(""));
