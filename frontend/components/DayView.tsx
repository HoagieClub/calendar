'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Pane, Text, majorScale } from 'evergreen-ui';

import Event, { type CalendarEvent } from '@/components/Event';

const HOUR_HEIGHT = 88;
const TIME_LABEL_WIDTH = 72;
const INITIAL_SCROLL_PADDING = 160;
const TOUCHING_EVENT_GAP = 4;
const EVENT_LANES = 5;

const SAMPLE_EVENTS: CalendarEvent[] = [
	{
		id: 1,
		name: 'Dissertation Writing Workshop',
		startHour: 9,
		endHour: 20,
		location: 'Graduate College Common Room',
		host: 'Graduate School',
		attendees: 22,
		category: 'Other',
	},
	{
		id: 2,
		name: 'Annual Princeton Arts Invitational Showcase',
		startHour: 12,
		endHour: 20,
		location: '185 Nassau Street Gallery',
		host: 'Princeton Arts Council',
		attendees: 73,
		category: 'Arts & Culture',
	},
	{
		id: 3,
		name: 'Inclusive Guest Lecture: Dr. Priya Mehta',
		startHour: 12,
		endHour: 13.5,
		location: 'Robertson Hall 016',
		host: 'Woodrow Wilson School',
		attendees: 47,
		category: 'Academic',
	},
	{
		id: 4,
		name: 'Preview Day Farmers Market Lunch Giveaway',
		startHour: 12,
		endHour: 13,
		location: 'Frist South Lawn',
		host: 'Campus Dining',
		attendees: 15,
		category: 'Free Food',
	},
	{
		id: 5,
		name: 'Quantum Computing Seminar',
		startHour: 15,
		endHour: 16.5,
		location: 'Jadwin Hall A10',
		host: 'Physics Department',
		attendees: 17,
		category: 'Academic',
	},
	{
		id: 6,
		name: 'Model UN Committee Session',
		startHour: 16.5,
		endHour: 18.5,
		location: 'Whig Hall Senate Chamber',
		host: 'Princeton Model UN',
		attendees: 21,
		category: 'Career',
	},
	{
		id: 7,
		name: 'Debate Club Practice',
		startHour: 16.5,
		endHour: 18,
		location: '1879 Hall',
		host: 'Debate Panel',
		attendees: 18,
		category: 'Other',
	},
	{
		id: 8,
		name: 'Campus YMCA Yoga',
		startHour: 16.5,
		endHour: 17.5,
		location: 'Dillon Gym',
		host: 'Campus YMCA',
		attendees: 45,
		category: 'Sports & Fitness',
	},
	{
		id: 9,
		name: 'Graduate Student Happy Hour',
		startHour: 17,
		endHour: 18,
		location: 'Graduate College',
		host: 'Grad School',
		attendees: 53,
		category: 'Social Events',
	},
	{
		id: 10,
		name: 'Princeton International Friends Mixer',
		startHour: 18,
		endHour: 20,
		location: 'Friend Center',
		host: 'International Students Association',
		attendees: 52,
		category: 'Social Events',
	},
	{
		id: 11,
		name: 'African Students Assoc Meetup',
		startHour: 17.5,
		endHour: 19,
		location: 'Third World Center',
		host: 'Princeton African Students Association',
		attendees: 29,
		category: 'Social Events',
	},
	{
		id: 12,
		name: 'Take-Back the Night Rally',
		startHour: 19,
		endHour: 21,
		location: 'Cannon Green',
		host: 'Women Center',
		attendees: 87,
		category: 'Housing & Sales',
	},
	{
		id: 13,
		name: 'Tiger Investments General Meeting',
		startHour: 19,
		endHour: 20.5,
		location: 'Bendheim Hall 103',
		host: 'Tiger Investments',
		attendees: 24,
		category: 'Career',
	},
	{
		id: 14,
		name: 'USG Town Hall: Campus Dining',
		startHour: 19,
		endHour: 20.5,
		location: 'Whig Hall Senate Chamber',
		host: 'Undergraduate Student Government',
		attendees: 24,
		category: 'Other',
	},
	{
		id: 15,
		name: 'dilisa Dance Company Workshop',
		startHour: 20,
		endHour: 21.5,
		location: 'New South Dance Studio',
		host: 'dilisa Dance Company',
		attendees: 31,
		category: 'Arts & Culture',
	},
];

function formatHour(hour: number): string {
	const period = hour < 12 ? 'AM' : 'PM';
	const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${normalizedHour} ${period}`;
}

export function DayView() {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const hasAutoScrolledRef = useRef(false);
	const [now, setNow] = useState(() => new Date());
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

		const targetScroll = Math.max(
			0,
			currentTimePosition - container.clientHeight / 2 + INITIAL_SCROLL_PADDING
		);
		container.scrollTop = targetScroll;
		hasAutoScrolledRef.current = true;
	}, [currentTimePosition]);

	const hours = Array.from({ length: 24 }, (_, hour) => hour);

	return (
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
							background={
								hour % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(248,250,252,0.2)'
							}
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

					<Pane
						position='absolute'
						top={0}
						bottom={0}
						left={TIME_LABEL_WIDTH}
						right={majorScale(2)}
					>
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
									top={top + 2 + topGap}
									left={`calc(${lane * (100 / EVENT_LANES)}% + 8px)`}
									width={laneWidth}
									height={Math.max(height - 4 - topGap - bottomGap, 52)}
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
	);
}

export default DayView;
