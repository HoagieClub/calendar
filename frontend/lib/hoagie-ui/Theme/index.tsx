/**
 * @overview Theme component for the calendar app.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */

'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from 'evergreen-ui';

import { hoagieTemplate, hoagieUI } from './themes';

type ThemeProps = {
	// Options: "calendar")
	palette?: string;

	// React children (child components)
	children?: ReactNode;
};

/**
 * Theme is a theme provider meant for use throughout
 * different Hoagie applications.
 */
export function Theme({ palette = 'calendar', children }: ThemeProps) {
	const colorTheme = (() => {
		switch (palette) {
			case 'calendar':
				return hoagieTemplate;
			default:
				return hoagieUI;
		}
	})();

	return <ThemeProvider value={colorTheme}>{children}</ThemeProvider>;
}

export default Theme;
