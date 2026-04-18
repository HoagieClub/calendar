/**
 * @overview Hook for fetching calendar events.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */
import { useMemo } from 'react';

import type { CalendarEvent } from '@/types';

const y = new Date().getFullYear();
const m = new Date().getMonth();

const d = (day: number, hour: number, min = 0) =>
	new Date(y, m, day, hour, min).toISOString();

// Get this week's Thursday and Friday dates
const now = new Date();
const sunday = new Date(now);
sunday.setDate(now.getDate() - now.getDay());
const THU = sunday.getDate() + 4;
const FRI = sunday.getDate() + 5;

// Placeholder events for development — replace with real API call when ready
const PLACEHOLDER_EVENTS: CalendarEvent[] = [
	{ id: '1',  name: 'Campus Pickup Basketball', start: d(1, 10), end: d(1, 11), location: 'Dillon Gym', description: '', host: 'Athletics', owner: '', category: 'sports', from_mail: false, ordering: 0 },
	{ id: '2',  name: 'Housing Info Session',     start: d(1, 14), end: d(1, 15), location: 'Rocky Common Room', description: '', host: 'Housing Office', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '3',  name: 'Free Bagels',              start: d(2, 10), end: d(2, 11), location: 'CS Building', description: '', host: 'CS Dept', owner: '', category: 'food', from_mail: false, ordering: 0 },
	{ id: '4',  name: 'Dance Team Practice',      start: d(2, 16), end: d(2, 18), location: 'Dillon Dance Studio', description: '', host: 'Dance Team', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '5',  name: 'Film Club Screening',      start: d(3, 17), end: d(3, 20), location: 'McCosh 50', description: '', host: 'Film Club', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '6',  name: 'CS Department Seminar',    start: d(3, 19), end: d(3, 20), location: 'Friend 101', description: '', host: 'CS Dept', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '7',  name: 'Sunday Movie Night',       start: d(5, 19), end: d(5, 22), location: 'Whitman Common Room', description: '', host: 'Whitman', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '8',  name: 'Quantum Computing Seminar',start: d(6, 10), end: d(6, 11, 30), location: 'Friend 101', description: '', host: 'CS Dept', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '9',  name: 'Pickup Basketball',        start: d(6, 16), end: d(6, 17), location: 'Dillon Gym', description: '', host: 'Athletics', owner: '', category: 'sports', from_mail: false, ordering: 0 },
	{ id: '10', name: 'Study Hall',               start: d(6, 18), end: d(6, 20), location: 'Firestone Library', description: '', host: 'Library', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '11', name: 'Acapella Rehearsal',       start: d(6, 20), end: d(6, 21), location: 'Richardson Auditorium', description: '', host: 'Acapella', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '12', name: 'Mock Interview Night',     start: d(6, 21), end: d(6, 22), location: 'Frist Campus Center', description: '', host: 'Career Services', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '13', name: 'CS Workshop',              start: d(7, 9),  end: d(7, 11), location: 'Friend 008', description: '', host: 'CS Dept', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '14', name: 'Free Pizza: CS Dept',      start: d(8, 12), end: d(8, 13), location: 'CS Building Lobby', description: '', host: 'CS Dept', owner: '', category: 'food', from_mail: false, ordering: 0 },
	{ id: '15', name: 'Trivia Night',             start: d(8, 15), end: d(8, 17), location: 'Frist Campus Center', description: '', host: 'Student Gov', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '16', name: 'Mock Interview',           start: d(8, 17), end: d(8, 18), location: 'Career Services', description: '', host: 'Career Services', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '17', name: 'Networking Dinner',        start: d(8, 19), end: d(8, 21), location: 'Prospect House', description: '', host: 'Alumni Office', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '18', name: 'Volleyball Practice',      start: d(9, 16), end: d(9, 18), location: 'Dillon Gym', description: '', host: 'Athletics', owner: '', category: 'sports', from_mail: false, ordering: 0 },
	{ id: '19', name: 'Hack Princeton',           start: d(10, 18), end: d(11, 18), location: 'Friend Center', description: '', host: 'HackPrinceton', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '20', name: 'Acapella Concert',         start: d(12, 19), end: d(12, 21), location: 'Richardson Auditorium', description: '', host: 'Acapella Groups', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '21', name: 'Career Fair',              start: d(13, 11), end: d(13, 16), location: 'Jadwin Gym', description: '', host: 'Career Services', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '22', name: 'Free Lunch',               start: d(13, 13), end: d(13, 14), location: 'Frist Food Court', description: '', host: 'Student Gov', owner: '', category: 'food', from_mail: false, ordering: 0 },
	{ id: '23', name: 'Chess Club',               start: d(13, 17), end: d(13, 19), location: 'Marx Hall', description: '', host: 'Chess Club', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '24', name: 'Investment Banking Info',  start: d(13, 18), end: d(13, 19), location: 'Robertson Hall', description: '', host: 'Finance Club', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '25', name: 'Robotics Showcase',        start: d(13, 19), end: d(13, 21), location: 'Engineering Quad', description: '', host: 'Robotics Club', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '26', name: 'Thesis Chapter Due',       start: d(14, 23, 59), end: d(14, 23, 59), location: 'Online', description: '', host: 'Academic Affairs', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '27', name: 'Free Pizza',               start: d(15, 12), end: d(15, 13), location: 'CS Building', description: '', host: 'CS Dept', owner: '', category: 'food', from_mail: false, ordering: 0 },
	{ id: '28', name: 'Fringe Festival Preview',  start: d(15, 17), end: d(15, 19), location: 'Lewis Center', description: '', host: 'Arts Council', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '29', name: 'BSU Weekly Meeting',       start: d(now.getDate(), 10), end: d(now.getDate(), 11), location: '3rd floor Frist', description: '', host: 'BSU', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '30', name: 'Mental Health Workshop',   start: d(now.getDate(), 16), end: d(now.getDate(), 17), location: 'McCosh Health Center', description: '', host: 'UHS', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '31', name: 'Mock Interview Night',     start: d(now.getDate(), 18), end: d(now.getDate(), 19), location: 'Career Services', description: '', host: 'Career Services', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '32', name: 'African Students Assoc.',  start: d(now.getDate(), 17), end: d(now.getDate(), 18), location: 'Carl Icahn Lab', description: '', host: 'PASA', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '33', name: 'Debate Club',              start: d(now.getDate(), 19), end: d(now.getDate(), 20), location: 'Robertson Hall', description: '', host: 'Debate Club', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '34', name: 'Housing Application Deadline', start: d(25, 23, 59), end: d(25, 23, 59), location: 'Online', description: '', host: 'Housing Office', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '35', name: 'Senior Thesis Concert',    start: d(26, 19), end: d(26, 21), location: 'Richardson Auditorium', description: '', host: 'Music Dept', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '36', name: 'Late Night Pancakes',      start: d(28, 23), end: d(29, 0), location: 'Frist Campus Center', description: '', host: 'Student Gov', owner: '', category: 'food', from_mail: false, ordering: 0 },

	// ── Thursday: 4 overlapping events 2–6 PM ──
	{ id: '40', name: 'Dance Team Practice',      start: d(THU, 14), end: d(THU, 18), location: 'Dillon Studio', description: '', host: 'Dance Team', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '41', name: 'CS Junior Seminar',        start: d(THU, 14), end: d(THU, 17), location: 'Friend 101', description: '', host: 'CS Dept', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '42', name: 'Volleyball Practice',      start: d(THU, 14, 30), end: d(THU, 16, 30), location: 'Dillon Gym', description: '', host: 'Athletics', owner: '', category: 'sports', from_mail: false, ordering: 0 },
	{ id: '43', name: 'Finance Club Meeting',     start: d(THU, 15), end: d(THU, 16), location: 'Robertson Hall', description: '', host: 'Finance Club', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '44', name: 'Music Ensemble',           start: d(THU, 16), end: d(THU, 18), location: 'Woolworth Center', description: '', host: 'Music Dept', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '45', name: 'Rocky Formal Planning',    start: d(THU, 17), end: d(THU, 19), location: 'Rocky Common Room', description: '', host: 'Rocky College', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '46', name: 'Hack Princeton Kickoff',   start: d(THU, 18), end: d(THU, 22), location: 'Friend Center', description: '', host: 'HackPrinceton', owner: '', category: 'academic', from_mail: false, ordering: 0 },

	// ── Friday: 4 overlapping events 3–8 PM ──
	{ id: '50', name: 'Chemistry Lab',            start: d(FRI, 13), end: d(FRI, 16), location: 'Frick Chemistry', description: '', host: 'Chemistry Dept', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '51', name: 'Film Club Screening',      start: d(FRI, 15), end: d(FRI, 18), location: 'McCosh 50', description: '', host: 'Film Club', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '52', name: 'Free Food at Whitman',     start: d(FRI, 15, 30), end: d(FRI, 16, 30), location: 'Whitman Dining', description: '', host: 'Whitman College', owner: '', category: 'food', from_mail: false, ordering: 0 },
	{ id: '53', name: 'Fringe Festival',          start: d(FRI, 16), end: d(FRI, 20), location: 'Lewis Center', description: '', host: 'Arts Council', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '54', name: 'Senior Bar Night',         start: d(FRI, 22), end: d(FRI, 23, 59), location: 'Terrace Club', description: '', host: 'Senior Class', owner: '', category: 'social', from_mail: false, ordering: 0 },
	{ id: '55', name: 'Hack Princeton Check-in',  start: d(FRI, 14), end: d(FRI, 17), location: 'Friend Center', description: '', host: 'HackPrinceton', owner: '', category: 'academic', from_mail: false, ordering: 0 },
	{ id: '56', name: 'Robotics Club',            start: d(FRI, 15), end: d(FRI, 17), location: 'Engineering Quad', description: '', host: 'Robotics Club', owner: '', category: 'academic', from_mail: false, ordering: 0 },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
	sports:   { bg: '#bfdbfe', text: '#0C447C' },
	academic: { bg: '#ddd6fe', text: '#3C3489' },
	food:     { bg: '#fed7aa', text: '#633806' },
	social:   { bg: '#bbf7d0', text: '#27500A' },
	default:  { bg: '#e5e7eb', text: '#374151' },
};

export function getCategoryColor(category: string): { bg: string; text: string } {
	return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;
}

type UseEventsResult = {
	events: CalendarEvent[];
	isLoading: boolean;
	error: string | null;
};

export function useEvents(startTime: Date, endTime: Date): UseEventsResult {
	const events = useMemo(
		() =>
			PLACEHOLDER_EVENTS.filter(
				(e) => new Date(e.start) <= endTime && new Date(e.end) >= startTime
			),
		[startTime, endTime]
	);

	return { events, isLoading: false, error: null };
}
