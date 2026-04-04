'use client';

import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import { CalendarIcon, CrossIcon, Heading, IconButton, Pane, Paragraph, Text, majorScale } from 'evergreen-ui';

import Event, { formatEventTime, type CalendarEvent } from '@/components/Event';

const HOUR_HEIGHT = 88;
const TIME_LABEL_WIDTH = 72;
const INITIAL_SCROLL_PADDING = 160;
const TOUCHING_EVENT_GAP = 30;
const EVENT_LANES = 5;
const MODAL_ANIMATION_MS = 180;

const SAMPLE_EVENTS: CalendarEvent[] = [
	{
		id: 1,
		title: 'Dissertation Writing Workshop',
		startHour: 9,
		endHour: 20,
		color: '#eef1f5',
		accent: '#718096',
		location: 'Graduate College Common Room',
		organizer: 'Graduate School',
		attendees: 22,
		category: 'Other',
	},
	{
		id: 2,
		title: 'Annual Princeton Arts Invitational Showcase',
		startHour: 12,
		endHour: 20,
		color: '#efe8fb',
		accent: '#8b5cf6',
		location: '185 Nassau Street Gallery',
		organizer: 'Princeton Arts Council',
		attendees: 73,
		category: 'Arts & Culture',
	},
	{
		id: 3,
		title: 'Inclusive Guest Lecture: Dr. Priya Mehta',
		startHour: 12,
		endHour: 13.5,
		color: '#eaf0fb',
		accent: '#5b7cfa',
		location: 'Robertson Hall 016',
		organizer: 'Woodrow Wilson School',
		attendees: 47,
		category: 'Academic',
	},
	{
		id: 4,
		title: 'Preview Day Farmers Market Lunch Giveaway',
		startHour: 12,
		endHour: 13,
		color: '#f5eddc',
		accent: '#d59b1a',
		location: 'Frist South Lawn',
		organizer: 'Campus Dining',
		attendees: 15,
		category: 'Free Food',
	},
	{
		id: 5,
		title: 'Quantum Computing Seminar',
		startHour: 15,
		endHour: 16.5,
		color: '#dfe7fb',
		accent: '#5876f7',
		location: 'Jadwin Hall A10',
		organizer: 'Physics Department',
		attendees: 17,
		category: 'Academic',
	},
	{
		id: 6,
		title: 'Model UN Committee Session',
		startHour: 16.5,
		endHour: 18.5,
		color: '#e7ebf9',
		accent: '#5b7cfa',
		location: 'Whig Hall Senate Chamber',
		organizer: 'Princeton Model UN',
		attendees: 21,
		category: 'Career',
	},
	{
		id: 7,
		title: 'Debate Club Practice',
		startHour: 16.5,
		endHour: 18,
		color: '#dfe5f7',
		accent: '#4f6bd8',
		location: '1879 Hall',
		organizer: 'Debate Panel',
		attendees: 18,
		category: 'Other',
	},
	{
		id: 8,
		title: 'Campus YMCA Yoga',
		startHour: 16.5,
		endHour: 17.5,
		color: '#e3f4ec',
		accent: '#56a77f',
		location: 'Dillon Gym',
		organizer: 'Campus YMCA',
		attendees: 45,
		category: 'Sports & Fitness',
	},
	{
		id: 9,
		title: 'Graduate Student Happy Hour',
		startHour: 17,
		endHour: 18,
		color: '#f6e7ea',
		accent: '#d96b85',
		location: 'Graduate College',
		organizer: 'Grad School',
		attendees: 53,
		category: 'Social Events',
	},
	{
		id: 10,
		title: 'Princeton International Friends Mixer',
		startHour: 18,
		endHour: 20,
		color: '#f6e9e6',
		accent: '#d46e54',
		location: 'Friend Center',
		organizer: 'International Students Association',
		attendees: 52,
		category: 'Social Events',
	},
	{
		id: 11,
		title: 'African Students Assoc Meetup',
		startHour: 17.5,
		endHour: 19,
		color: '#f6e6ea',
		accent: '#d46d8c',
		location: 'Third World Center',
		organizer: 'Princeton African Students Association',
		attendees: 29,
		category: 'Social Events',
	},
	{
		id: 12,
		title: 'Take-Back the Night Rally',
		startHour: 19,
		endHour: 21,
		color: '#f6e7eb',
		accent: '#cd5d6d',
		location: 'Cannon Green',
		organizer: 'Women Center',
		attendees: 87,
		category: 'Housing & Sales',
	},
	{
		id: 13,
		title: 'Tiger Investments General Meeting',
		startHour: 19,
		endHour: 20.5,
		color: '#eee7fb',
		accent: '#9161f2',
		location: 'Bendheim Hall 103',
		organizer: 'Tiger Investments',
		attendees: 24,
		category: 'Career',
	},
	{
		id: 14,
		title: 'USG Town Hall: Campus Dining',
		startHour: 19,
		endHour: 20.5,
		color: '#eff2fb',
		accent: '#6a7fe8',
		location: 'Whig Hall Senate Chamber',
		organizer: 'Undergraduate Student Government',
		attendees: 24,
		category: 'Other',
	},
	{
		id: 15,
		title: 'dilisa Dance Company Workshop',
		startHour: 20,
		endHour: 21.5,
		color: '#ece5fb',
		accent: '#8b5cf6',
		location: 'New South Dance Studio',
		organizer: 'dilisa Dance Company',
		attendees: 31,
		category: 'Arts & Culture',
	},
];

function formatHour(hour: number): string {
	const period = hour < 12 ? 'AM' : 'PM';
	const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${normalizedHour} ${period}`;
}

function getEventDescription(event: CalendarEvent): string {
	return `${event.organizer} is hosting this ${event.category?.toLowerCase() ?? 'community'} event at ${event.location}.`;
}

export function DayView() {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const hasAutoScrolledRef = useRef(false);
	const [now, setNow] = useState(() => new Date());
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
	const totalHeight = HOUR_HEIGHT * 24;
	const currentTimePosition = useMemo(
		() => (now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600) * HOUR_HEIGHT,
		[now]
	);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setNow(new Date());
		}, 60000);

		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		const container = scrollRef.current;
		if (!container || hasAutoScrolledRef.current) {
			return;
		}

		const targetScroll = Math.max(0, currentTimePosition - container.clientHeight / 2 + INITIAL_SCROLL_PADDING);
		container.scrollTop = targetScroll;
		hasAutoScrolledRef.current = true;
	}, [currentTimePosition]);

	const hours = Array.from({ length: 24 }, (_, hour) => hour);

	return (
		<>
			<Pane paddingX={majorScale(2)} paddingY={majorScale(2)} width='100%'>
				<Pane
					ref={scrollRef}
					background='#f8fafc'
					border='1px solid rgba(148, 163, 184, 0.18)'
					borderRadius={16}
					boxShadow='0 8px 24px rgba(15, 23, 42, 0.06)'
					height='calc(100vh - 170px)'
					minHeight={560}
					overflowY='auto'
					position='relative'
				>
					<Pane position='relative' minHeight={totalHeight}>
						<Pane
							position='sticky'
							top={0}
							zIndex={3}
							height={1}
							background='transparent'
						/>

						{hours.map((hour) => (
							<Pane
								key={hour}
								position='absolute'
								top={hour * HOUR_HEIGHT}
								left={0}
								right={0}
								height={HOUR_HEIGHT}
								borderBottom='1px solid rgba(203, 213, 225, 0.45)'
								background={hour % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(248,250,252,0.2)'}
							>
								<Text
									size={300}
									color='#6b7280'
									position='absolute'
									top={10}
									left={0}
									width={TIME_LABEL_WIDTH}
									textAlign='center'
									fontWeight={500}
								>
									{formatHour(hour)}
								</Text>
								<Pane
									position='absolute'
									left={TIME_LABEL_WIDTH}
									right={0}
									top={0}
									bottom={0}
									borderLeft='1px solid rgba(203, 213, 225, 0.65)'
								/>
							</Pane>
						))}

						<Pane position='absolute' top={0} bottom={0} left={TIME_LABEL_WIDTH} right={majorScale(2)}>
							{SAMPLE_EVENTS.map((event, index) => {
								const duration = event.endHour - event.startHour;
								const top = event.startHour * HOUR_HEIGHT;
								const height = Math.max(duration * HOUR_HEIGHT, 56);
								const lane = index % EVENT_LANES;
								const laneWidth = `calc(${100 / EVENT_LANES}% - 10px)`;
								const halfGap = TOUCHING_EVENT_GAP / 2;
								const hasEventEndingAtStart = SAMPLE_EVENTS.some(
									(otherEvent, otherIndex) =>
										otherEvent.id !== event.id &&
										otherIndex % EVENT_LANES === lane &&
										otherEvent.endHour === event.startHour
								);
								const hasEventStartingAtEnd = SAMPLE_EVENTS.some(
									(otherEvent, otherIndex) =>
										otherEvent.id !== event.id &&
										otherIndex % EVENT_LANES === lane &&
										otherEvent.startHour === event.endHour
								);
								const topGap = hasEventEndingAtStart ? halfGap : 0;
								const bottomGap = hasEventStartingAtEnd ? halfGap : 0;

								return (
									<Event
										key={event.id}
										event={event}
										top={top + 8 + topGap}
										left={`calc(${lane * (100 / EVENT_LANES)}% + 8px)`}
										width={laneWidth}
										height={Math.max(height - 12 - topGap - bottomGap, 52)}
										onSelect={setSelectedEvent}
									/>
								);
							})}
						</Pane>

						<Pane
							position='absolute'
							top={currentTimePosition}
							left={TIME_LABEL_WIDTH}
							right={majorScale(2)}
							height={2}
							background='#e5484d'
							zIndex={4}
							boxShadow='0 1px 6px rgba(229, 72, 77, 0.28)'
						>
							<Pane
								position='absolute'
								left={-7}
								top={-5}
								width={12}
								height={12}
								borderRadius='50%'
								background='#e5484d'
								boxShadow='0 0 0 4px rgba(229, 72, 77, 0.16)'
							/>
						</Pane>
					</Pane>
				</Pane>
			</Pane>

			{selectedEvent ? (
				<Pane
					position='fixed'
					top={0}
					right={0}
					bottom={0}
					left={0}
					display='flex'
					alignItems='center'
					justifyContent='center'
					padding={majorScale(2)}
					background='rgba(15, 23, 42, 0.28)'
					zIndex={20}
					onClick={() => setSelectedEvent(null)}
					style={{
						animation: `fade-in ${MODAL_ANIMATION_MS}ms ease`,
					}}
				>
					<Pane
						role='dialog'
						aria-modal='true'
						background='white'
						borderRadius={18}
						boxShadow='0 24px 64px rgba(15, 23, 42, 0.18)'
						width='min(680px, 100%)'
						maxHeight='calc(100vh - 48px)'
						overflowY='auto'
						padding={majorScale(3)}
						onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
						style={{
							animation: `modal-pop ${MODAL_ANIMATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
							transformOrigin: 'center center',
						}}
					>
						<Pane display='flex' justifyContent='space-between' alignItems='flex-start' gap={majorScale(2)}>
							<Pane flex={1}>
								<Heading size={800} color='#111827'>
									{selectedEvent.title}
								</Heading>
								<Pane display='flex' alignItems='center' gap={8} marginTop={majorScale(2)}>
									<Pane
										width={12}
										height={12}
										borderRadius='50%'
										background={selectedEvent.accent}
										flexShrink={0}
									/>
									<Text size={300} color='#4b5563' fontWeight={600}>
										{selectedEvent.category ?? 'General Event'}
									</Text>
								</Pane>
							</Pane>
							<IconButton
								icon={CrossIcon}
								appearance='minimal'
								intent='none'
								onClick={() => setSelectedEvent(null)}
								aria-label='Close event details'
							/>
						</Pane>

						<Pane marginTop={majorScale(3)} border='1px solid rgba(226, 232, 240, 0.9)' borderRadius={14} padding={majorScale(2)}>
							<Pane display='flex' alignItems='center' gap={10} marginBottom={majorScale(2)}>
								<CalendarIcon color='muted' />
								<Text size={400} color='#1f2937' fontWeight={600}>
									{formatEventTime(selectedEvent.startHour, selectedEvent.endHour)}
								</Text>
							</Pane>
							<Paragraph size={400} color='#4b5563' lineHeight='22px' marginBottom={majorScale(2)}>
								{selectedEvent.description ?? getEventDescription(selectedEvent)}
							</Paragraph>
							<Text display='block' size={300} color='#4b5563' marginBottom={6}>
								{`Location: ${selectedEvent.location}`}
							</Text>
							<Text display='block' size={300} color='#4b5563' marginBottom={6}>
								{`Organizer: ${selectedEvent.organizer}`}
							</Text>
							<Text display='block' size={300} color='#4b5563'>
								{`Attendees: ${selectedEvent.attendees}`}
							</Text>
						</Pane>
					</Pane>
				</Pane>
			) : null}
			<style jsx>{`
				@keyframes fade-in {
					from {
						background: rgba(15, 23, 42, 0);
					}
					to {
						background: rgba(15, 23, 42, 0.28);
					}
				}

				@keyframes modal-pop {
					from {
						opacity: 0;
						transform: translateY(18px) scale(0.96);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
			`}</style>
		</>
	);
}

export default DayView;
