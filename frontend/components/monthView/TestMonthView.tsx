import React, { useState } from "react";

import MonthGrid from "./MonthGrid";

const MONTH_NAMES: string[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TestMonthView(): React.ReactElement {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());

  function prev(): void {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function next(): void {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function goToday(): void {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  }

  return (
    <div className="test-month-view">
      <div className="test-month-view__nav">
        <button className="test-month-view__btn" onClick={prev}>‹</button>
        <button className="test-month-view__btn" onClick={goToday}>Today</button>
        <button className="test-month-view__btn" onClick={next}>›</button>
        <h2 className="test-month-view__title">
          {MONTH_NAMES[month]} {year}
        </h2>
      </div>
      <MonthGrid month={month} year={year} />
    </div>
  );
}
