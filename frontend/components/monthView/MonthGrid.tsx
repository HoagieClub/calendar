import "./MonthGrid.css";

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

interface MonthGridProps {
  month?: number; // 0-indexed (0 = January)
  year?: number;
}

interface CalendarCell {
  day: number;
  type: "prev" | "current" | "next";
  isToday?: boolean;
}

export default function MonthGrid({ month, year }: MonthGridProps) {
  const today = new Date();
  const displayMonth = month !== undefined ? month : today.getMonth();
  const displayYear = year !== undefined ? year : today.getFullYear();

  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();

  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDayOfMonth) {
      cells.push({
        day: daysInPrevMonth - firstDayOfMonth + 1 + i,
        type: "prev",
      });
    } else if (i < firstDayOfMonth + daysInMonth) {
      const day = i - firstDayOfMonth + 1;
      const isToday =
        day === today.getDate() &&
        displayMonth === today.getMonth() &&
        displayYear === today.getFullYear();
      cells.push({ day, type: "current", isToday });
    } else {
      cells.push({ day: i - firstDayOfMonth - daysInMonth + 1, type: "next" });
    }
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="month-grid">
      <div className="month-grid__header">
        {DAY_NAMES.map((name) => (
          <div key={name} className="month-grid__day-name">
            {name}
          </div>
        ))}
      </div>

      <div className="month-grid__body">
        {weeks.map((week, wi) => (
          <div key={wi} className="month-grid__week">
            {week.map((cell, di) => (
              <div
                key={di}
                className={[
                  "month-grid__cell",
                  cell.type !== "current" ? "month-grid__cell--overflow" : "",
                  cell.isToday ? "month-grid__cell--today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="month-grid__date-number">{cell.day}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
