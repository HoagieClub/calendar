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

import {
	CrossIcon,
	Dialog,
	Heading,
	IconButton,
	Pane,
	Paragraph,
	Text,
	useTheme,
} from 'evergreen-ui';

import { getCategoryColor } from '@/lib/hoagie-ui/useEvents';
import type { CalendarEvent } from '@/types';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export type EventStatus = 'In progress' | 'Starting soon' | null;

// Decides which status label (if any) to show next to an event's time.
export function getEventStatus(start: Date, end: Date, now: Date): EventStatus {
	const startMs = start.getTime();
	const endMs = end.getTime();
	const nowMs = now.getTime();

	if (startMs <= nowMs && nowMs < endMs) {
		return 'In progress';
	}

	const msUntilStart = startMs - nowMs;
	if (msUntilStart > 0 && msUntilStart <= TWO_HOURS_MS) {
		return 'Starting soon';
	}

	return null;
}

// "2 PM" or "3:30 PM"
function formatTime(date: Date): string {
	const h = date.getHours();
	const min = date.getMinutes();
	const suffix = h >= 12 ? 'PM' : 'AM';
	const hour = h % 12 === 0 ? 12 : h % 12;
	return min === 0 ? `${hour} ${suffix}` : `${hour}:${String(min).padStart(2, '0')} ${suffix}`;
}

// "Sat, Oct 10 · 2 PM – 3:30 PM"
function formatDateTime(start: Date, end: Date): string {
	const day = start.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
	return `${day} · ${formatTime(start)} – ${formatTime(end)}`;
}

type EventDetailProps = {
	event: CalendarEvent | null;
	onClose: () => void;
};

export function EventDetail({ event, onClose }: EventDetailProps) {
	const { colors } = useTheme();

	if (!event) {
		return null;
	}

	const start = new Date(event.start);
	const end = new Date(event.end);
	const status = getEventStatus(start, end, new Date());
	const categoryColor = getCategoryColor(event.category);

	return (
		<Dialog
			isShown
			onCloseComplete={onClose}
			hasFooter={false}
			header={({ close }) => (
				<Pane display='flex' alignItems='flex-start' width='100%'>
					<Pane flex={1}>
						<Pane
							display='inline-block'
							background={categoryColor.bg}
							borderRadius={999}
							paddingX={10}
							paddingY={2}
							marginBottom={8}
						>
							<Text
								fontSize={11}
								fontWeight={700}
								color={categoryColor.border}
								textTransform='uppercase'
								letterSpacing='0.04em'
							>
								{event.category}
							</Text>
						</Pane>
						<Heading size={700}>{event.name}</Heading>
					</Pane>
					<IconButton appearance='minimal' icon={CrossIcon} onClick={() => close()} />
				</Pane>
			)}
		>
			<Text display='block' color={colors.gray700} marginBottom={16}>
				{formatDateTime(start, end)}
				{status && ` · ${status}`}
			</Text>
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
