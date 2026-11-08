/**
 * @overview Popup that shows the details of a single calendar event.
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

import { Dialog, Paragraph, useTheme } from 'evergreen-ui';

import type { CalendarEvent } from '@/types';

type EventDetailProps = {
	event: CalendarEvent | null;
	onClose: () => void;
};

export function EventDetail({ event, onClose }: EventDetailProps) {
	const { colors } = useTheme();

	if (!event) {
		return null;
	}

	return (
		<Dialog isShown title={event.name} onCloseComplete={onClose} hasFooter={false}>
			<Paragraph
				color={event.description ? colors.gray800 : colors.muted}
				whiteSpace='pre-wrap'
			>
				{event.description || 'No description provided.'}
			</Paragraph>
		</Dialog>
	);
}

export default EventDetail;
