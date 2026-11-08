/**
 * @overview Type definitions for the calendar app.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */

import 'evergreen-ui';

declare module 'evergreen-ui' {
	interface DefaultTheme {
		title: string;
	}
}

export type HoagieUser = {
	name?: string;
	email?: string;
};

export type CalendarEvent = {
	id: string;
	start: string; // ISO datetime string
	end: string; // ISO datetime string
	name: string;
	location: string;
	description: string;
	host: string;
	owner: string;
	owner_netid?: string; // Not sent by the backend yet (added in CALR-24)
	owner_email?: string; // Not sent by the backend yet (added in CALR-24)
	category: string;
	is_saved?: boolean; // Whether the logged-in user saved this event (not sent by the backend yet)
	from_mail: boolean;
	ordering: number;
};
