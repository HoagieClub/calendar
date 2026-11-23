import type { CalendarEvent } from '@/types';

/** Calendar-day ordinal, independent of daylight saving time. */
export function dayNumber(value: string | Date): number {
	const date = new Date(value);
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

/** Last covered day; an exclusive midnight ending belongs to the preceding day. */
export function endDayNumber(value: string | Date): number {
	return dayNumber(new Date(new Date(value).getTime() - 1));
}

/** Timed grid end position relative to the start date; next midnight is 24:00. */
export function endMinutes(event: CalendarEvent): number {
	const end = new Date(event.end);
	return (
		(dayNumber(end) - dayNumber(event.start)) * 1440 + end.getHours() * 60 + end.getMinutes()
	);
}

export function isAllDayEvent(event: CalendarEvent): boolean {
	const start = new Date(event.start);
	const end = new Date(event.end);
	return (
		endDayNumber(end) > dayNumber(start) ||
		(dayNumber(start) === endDayNumber(end) &&
			start.getHours() === 0 &&
			start.getMinutes() === 0 &&
			((end.getHours() === 23 && end.getMinutes() === 59) || endMinutes(event) === 1440))
	);
}

export function layoutAllDayEvents(events: CalendarEvent[], dates: Date[]) {
	const first = dayNumber(dates[0]);
	const last = dayNumber(dates[dates.length - 1]);
	const candidates = events
		.filter(isAllDayEvent)
		.map((event) => ({
			event,
			start: dayNumber(event.start),
			end: endDayNumber(event.end),
		}))
		.filter(({ start, end }) => start <= last && end >= first)
		.sort(
			(a, b) =>
				a.start - b.start ||
				b.end - b.start - (a.end - a.start) ||
				String(a.event.id).localeCompare(String(b.event.id))
		);
	const occupied = [new Set<number>(), new Set<number>()];
	const hidden: CalendarEvent[][] = dates.map(() => []);
	const bars = [];
	for (const candidate of candidates) {
		const start = Math.max(candidate.start, first) - first;
		const end = Math.min(candidate.end, last) - first;
		const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);
		const lane = occupied.findIndex((used) => days.every((day) => !used.has(day)));
		if (lane < 0) {
			for (const day of days) hidden[day].push(candidate.event);
		} else {
			for (const day of days) occupied[lane].add(day);
			bars.push({
				...candidate,
				start,
				end,
				lane,
				continuesBefore: candidate.start < first,
				continuesAfter: candidate.end > last,
			});
		}
	}
	return { bars, hidden };
}
