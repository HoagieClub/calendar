'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Pane, Text, majorScale } from 'evergreen-ui';

import { Loading, Empty, ErrorState } from '@/components/AsyncState';
import Event, { type CalendarEvent, type EventCategory } from '@/components/Event';
import { useEvents } from '@/lib/hoagie-ui/useEvents';
import type { CalendarEvent as ApiEvent } from '@/types';

const HOUR_HEIGHT = 88;
const TIME_LABEL_WIDTH = 72;
const INITIAL_SCROLL_PADDING = 160;
const TOUCHING_EVENT_GAP = 4;
const EVENT_LANES = 5;

const CATEGORY_MAP: Record<string, EventCategory> = {
	sports: 'Sports & Fitness',
	academic: 'Academic',
	food: 'Free Food',
	social: 'Social Events',
};

function toCardEvent(e: ApiEvent): CalendarEvent {
	const s = new Date(e.start);
	const en = new Date(e.end);
	return {
		id: e.id,
		name: e.name,
		startHour: s.getHours() + s.getMinutes() / 60,
		endHour: en.getHours() + en.getMinutes() / 60,
		location: e.location,
		host: e.host,
		category: CATEGORY_MAP[e.category] ?? 'Other',
	};
}

function formatHour(hour: number): string {
	const period = hour < 12 ? 'AM' : 'PM';
	const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${normalizedHour} ${period}`;
}

export function DayView({ date, onSelect }: { date: Date; onSelect?: (event: ApiEvent) => void }) {
	const startTime = new Date(date);
	startTime.setHours(0, 0, 0, 0);
	const endTime = new Date(date);
	endTime.setHours(23, 59, 59, 0);
	const { events, isLoading, error, retry } = useEvents(startTime, endTime);
	const cardEvents = events.map(toCardEvent);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const hasAutoScrolledRef = useRef(false);
	const [now, setNow] = useState(() => {
		const d = new Date();
		d.setSeconds(0, 0);
		return d;
	});
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
	}, [currentTimePosition, isLoading]);

	const hours = Array.from({ length: 24 }, (_, hour) => hour);

	if (isLoading) {
		return <Loading columns={1} rows={3} label='Getting your calendar ready.' />;
	}
	if (error) {
		return <ErrorState onRetry={retry} />;
	}

	return (
		<Pane paddingX={majorScale(2)} paddingY={majorScale(2)} width='100%'>
			{events.length === 0 && (
				<Empty message='Nothing on the calendar for this day. Add an event.' />
			)}
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
						{cardEvents.map((event, index) => {
							const duration = event.endHour - event.startHour;
							const top = event.startHour * HOUR_HEIGHT;
							const height = Math.max(duration * HOUR_HEIGHT, 56);
							const lane = index % EVENT_LANES;
							const laneWidth = `calc(${100 / EVENT_LANES}% - 10px)`;
							const halfGap = TOUCHING_EVENT_GAP / 2;
							const hasEventEndingAtStart = cardEvents.some(
								(otherEvent, otherIndex) =>
									otherEvent.id !== event.id &&
									otherIndex % EVENT_LANES === lane &&
									otherEvent.endHour === event.startHour
							);
							const hasEventStartingAtEnd = cardEvents.some(
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
									onClick={() => onSelect?.(events[index])}
								/>
							);
						})}
					</Pane>
					{date.toDateString() === now.toDateString() && (
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
					)}
				</Pane>
			</Pane>
		</Pane>
	);
}

export default DayView;
