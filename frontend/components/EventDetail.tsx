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

import { useState, type ReactNode } from 'react';

import {
	Button,
	CalendarIcon,
	CrossIcon,
	Dialog,
	EditIcon,
	FlagIcon,
	Heading,
	IconButton,
	Link,
	MapMarkerIcon,
	Pane,
	Paragraph,
	PersonIcon,
	StarEmptyIcon,
	StarIcon,
	Text,
	TimeIcon,
	TrashIcon,
	UserIcon,
	useTheme,
} from 'evergreen-ui';

import { getCategoryColor } from '@/lib/hoagie-ui/useEvents';
import type { CalendarEvent } from '@/types';

import styles from './EventDetail.module.css';

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

const REPORT_EMAIL = 'hoagie@princeton.edu';

const ICON_COLORS = {
	clock: '#374151', // dark gray
	person: '#7C3AED', // purple
	pin: '#EC4899', // pink
};

function getMapsUrl(location: string): string {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function getReportMailto(event: CalendarEvent): string {
	const subject = `Report event #${event.id}: ${event.name}`;
	return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

// Turns an ISO date string into Google Calendar's UTC format.
// "2026-11-07T21:00:00.000Z" -> "20261107T210000Z"
function toGoogleCalendarDate(iso: string): string {
	return new Date(iso)
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
}

function getGoogleCalendarUrl(event: CalendarEvent): string {
	const start = encodeURIComponent(toGoogleCalendarDate(event.start));
	const end = encodeURIComponent(toGoogleCalendarDate(event.end));
	return (
		'https://calendar.google.com/calendar/render?action=TEMPLATE' +
		`&text=${encodeURIComponent(event.name)}` +
		`&dates=${start}/${end}` +
		`&details=${encodeURIComponent(event.description)}` +
		`&location=${encodeURIComponent(event.location)}`
	);
}

// TODO: call POST/DELETE /event/<id>/save/ once saved-events endpoints merge
function syncSavedEvent(_eventId: string, _isSaved: boolean): void {
	// For now, saving only changes what the popup shows. Nothing is sent to the backend.
}

// The Save and Add to Calendar buttons.
function EventActions({ event }: { event: CalendarEvent }) {
	const { colors } = useTheme();
	const [isSaved, setIsSaved] = useState(event.is_saved ?? false);

	function handleSaveClick() {
		const nextIsSaved = !isSaved;
		setIsSaved(nextIsSaved);
		syncSavedEvent(event.id, nextIsSaved);
	}

	const buttonStyle = {
		height: 36,
		paddingX: 14,
		borderRadius: 10,
		border: `1px solid ${colors.gray300}`,
		color: colors.gray800,
		fontSize: 13,
		fontWeight: 500,
		className: styles.actionButton,
	};

	return (
		<Pane display='flex' gap={8}>
			<Button
				{...buttonStyle}
				background={isSaved ? colors.gray200 : 'white'}
				iconBefore={
					isSaved ? (
						<StarIcon color={colors.gray800} />
					) : (
						<StarEmptyIcon color={colors.gray600} />
					)
				}
				aria-pressed={isSaved}
				onClick={handleSaveClick}
			>
				{isSaved ? 'Saved' : 'Save'}
			</Button>
			<Button
				{...buttonStyle}
				is='a'
				href={getGoogleCalendarUrl(event)}
				target='_blank'
				rel='noopener noreferrer'
				background='white'
				iconBefore={<CalendarIcon color='#3B82F6' />}
			>
				Add to Calendar
			</Button>
		</Pane>
	);
}

// One line in the popup: a small icon followed by text.
function DetailRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
	const { colors } = useTheme();
	return (
		<Pane display='flex' alignItems='center' gap={8} marginBottom={8}>
			{icon}
			<Text color={colors.gray700}>{children}</Text>
		</Pane>
	);
}

type EventDetailProps = {
	event: CalendarEvent | null;
	onClose: () => void;
	// The logged-in user's netid. Used to show Edit/Delete only to the event's creator.
	currentUserNetid?: string;
};

export function EventDetail({ event, onClose, currentUserNetid }: EventDetailProps) {
	const { colors } = useTheme();

	if (!event) {
		return null;
	}

	const isOwner = Boolean(event.owner_netid) && event.owner_netid === currentUserNetid;

	const start = new Date(event.start);
	const end = new Date(event.end);
	const status = getEventStatus(start, end, new Date());
	const categoryColor = getCategoryColor(event.category);

	return (
		<Dialog
			isShown
			onCloseComplete={onClose}
			hasHeader={false}
			hasFooter={false}
			width={420}
			overlayProps={{ className: styles.overlay }}
			containerProps={{
				borderRadius: 16,
				boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.08)',
				tabIndex: -1,
				outline: 'none',
			}}
			contentContainerProps={{ paddingX: 24, paddingY: 24 }}
		>
			{({ close }) => (
				<>
					<Pane display='flex' alignItems='flex-start'>
						<Pane flex={1}>
							<Pane
								display='inline-block'
								background={categoryColor.bg}
								borderRadius={999}
								paddingX={10}
								paddingY={3}
								marginBottom={10}
							>
								<Text
									display='block'
									fontSize={10}
									lineHeight='14px'
									fontWeight={700}
									color={categoryColor.border}
									textTransform='uppercase'
									letterSpacing='0.08em'
								>
									{event.category}
								</Text>
							</Pane>
							<Heading
								fontFamily="'Poppins', sans-serif"
								fontWeight={700}
								fontSize={22}
								lineHeight='28px'
								color={colors.gray900}
							>
								{event.name}
							</Heading>
						</Pane>
						{isOwner && (
							<>
								{/* TODO: wired up by the edit/delete ticket */}
								<IconButton
									appearance='minimal'
									size='small'
									icon={<EditIcon color={colors.gray600} />}
									aria-label='Edit event'
									title='Edit event'
									className={styles.actionButton}
									marginLeft={8}
									marginTop={4}
								/>
								{/* TODO: wired up by the edit/delete ticket */}
								<IconButton
									appearance='minimal'
									size='small'
									icon={<TrashIcon color={colors.gray600} />}
									aria-label='Delete event'
									title='Delete event'
									className={styles.actionButton}
									marginLeft={2}
									marginTop={4}
								/>
							</>
						)}
						<IconButton
							appearance='minimal'
							icon={<CrossIcon color={colors.gray600} />}
							onClick={() => close()}
							marginLeft={isOwner ? 2 : 8}
						/>
					</Pane>

					<Pane marginTop={8}>
						<DetailRow icon={<TimeIcon size={14} color={ICON_COLORS.clock} />}>
							{formatDateTime(start, end)}
							{status && ` · ${status}`}
						</DetailRow>
						<DetailRow icon={<PersonIcon size={14} color={ICON_COLORS.person} />}>
							Hosted by {event.host}
						</DetailRow>
						{event.owner_netid && event.owner_email && (
							<DetailRow icon={<UserIcon size={14} color={ICON_COLORS.person} />}>
								Added by{' '}
								<Link href={`mailto:${event.owner_email}`}>
									{event.owner_netid}
								</Link>
							</DetailRow>
						)}
						<DetailRow icon={<MapMarkerIcon size={14} color={ICON_COLORS.pin} />}>
							<Link
								href={getMapsUrl(event.location)}
								target='_blank'
								rel='noopener noreferrer'
							>
								{event.location}
							</Link>
						</DetailRow>
					</Pane>

					<Pane borderTop={`1px solid ${colors.gray300}`} marginTop={16} paddingTop={16}>
						<EventActions key={event.id} event={event} />
					</Pane>

					<Pane borderTop={`1px solid ${colors.gray300}`} marginTop={16} paddingTop={16}>
						<Paragraph
							color={event.description ? colors.gray700 : colors.muted}
							fontSize={13}
							lineHeight='20px'
							whiteSpace='pre-wrap'
						>
							{event.description || 'No description provided.'}
						</Paragraph>
					</Pane>

					<Pane
						borderTop={`1px solid ${colors.gray300}`}
						marginTop={16}
						paddingTop={16}
						display='flex'
						justifyContent='center'
					>
						<Link
							href={getReportMailto(event)}
							display='flex'
							alignItems='center'
							gap={6}
							style={{ color: colors.red500 }}
						>
							<FlagIcon size={12} color={colors.red500} />
							Report this event
						</Link>
					</Pane>
				</>
			)}
		</Dialog>
	);
}

export default EventDetail;
