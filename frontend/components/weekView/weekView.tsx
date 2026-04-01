"use client";

import { useEffect, useRef } from "react";

const HOUR_HEIGHT = 60; // px per hour
const TIME_COL_WIDTH = 56; // px for the time label column
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(date: Date): Date[] {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  sunday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export default function WeekView() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const weekDates = getWeekDates(now);

  const todayIndex = now.getDay(); // 0 = Sun
  const currentMinuteOffset =
    (now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = Math.max(0, currentMinuteOffset - 200);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [currentMinuteOffset]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "#fff",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        fontSize: 13,
      }}
    >
      {/* ── Day header row ── */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Corner spacer */}
        <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />

        {weekDates.map((date, i) => {
          const isToday = i === todayIndex;
          const dayNum = date.getDate();
          const monthShort = date.toLocaleString("en-US", { month: "short" });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0 8px",
                borderLeft: "1px solid #e5e7eb",
              }}
            >
              {/* Day name */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: isToday ? "#1a8a72" : "#6b7280",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {DAYS[i]}
              </div>
              {/* Date number */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isToday ? "#1a8a72" : "transparent",
                  color: isToday ? "#fff" : "#111827",
                  fontSize: 15,
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {dayNum}
              </div>
              {/* Month label for first day or month boundary */}
              {(i === 0 || date.getDate() === 1) && (
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    marginTop: 2,
                    letterSpacing: "0.03em",
                  }}
                >
                  {monthShort}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Scrollable grid body ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "scroll",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Grid container */}
        <div
          style={{
            display: "flex",
            position: "relative",
            height: 24 * HOUR_HEIGHT,
          }}
        >
          {/* ── Time labels column ── */}
          <div
            style={{
              width: TIME_COL_WIDTH,
              flexShrink: 0,
              position: "relative",
            }}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                style={{
                  position: "absolute",
                  top: hour * HOUR_HEIGHT - 7,
                  right: 8,
                  height: HOUR_HEIGHT,
                  display: "flex",
                  alignItems: "flex-start",
                  color: "#9ca3af",
                  fontSize: 11,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {hour === 0 ? "" : formatHour(hour)}
              </div>
            ))}
          </div>

          {/* ── Day columns ── */}
          <div style={{ flex: 1, display: "flex", position: "relative" }}>
            {weekDates.map((_, colIdx) => (
              <div
                key={colIdx}
                style={{
                  flex: 1,
                  borderLeft: "1px solid #e5e7eb",
                  position: "relative",
                }}
              >
                {/* Hour lines */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    style={{
                      position: "absolute",
                      top: hour * HOUR_HEIGHT,
                      left: 0,
                      right: 0,
                      borderTop: hour === 0 ? "none" : "1px solid #f3f4f6",
                    }}
                  />
                ))}
                {/* Half-hour lines (lighter) */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={`half-${hour}`}
                    style={{
                      position: "absolute",
                      top: hour * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                      left: 0,
                      right: 0,
                      borderTop: "1px dashed #f3f4f6",
                    }}
                  />
                ))}
              </div>
            ))}

            {/* ── Current time indicator ── */}
            <div
              style={{
                position: "absolute",
                top: currentMinuteOffset,
                left: `calc(${(100 / 7) * todayIndex}%)`,
                width: `calc(${100 / 7}%)`,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              {/* Red dot on left edge */}
              <div
                style={{
                  position: "absolute",
                  left: -4,
                  top: -4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
              {/* Red line */}
              <div
                style={{
                  height: 2,
                  background: "#ef4444",
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
