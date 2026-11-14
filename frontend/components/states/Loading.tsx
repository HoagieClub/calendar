/**
 * @overview Skeleton shown while a page or list is fetching from the backend.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */

import { cn } from '@/lib/utils';

type LoadingProps = {
	/**
	 * `list`: stacked cards (My Events, Saved, search results).
	 * `columns`: side-by-side columns of staggered bars (Day and Week view).
	 * `grid`: a rows x columns grid of cells (Month view).
	 */
	variant?: 'list' | 'columns' | 'grid';
	/** Rows for `list` and `grid`. */
	rows?: number;
	/** Columns for `columns` and `grid`. */
	columns?: number;
	/** Announced to screen readers; never rendered as visible text. */
	label?: string;
	/** Fill the nearest positioned ancestor, covering whatever is underneath. */
	overlay?: boolean;
	className?: string;
};

const BLOCK = 'rounded-md bg-gray-200 animate-pulse motion-reduce:animate-none';

// Bar heights (%) for each column, offset per column so they don't line up.
const BAR_HEIGHTS = [
	[18, 30, 14],
	[26, 12, 24],
	[14, 22, 30],
];

export function Loading({
	variant = 'list',
	rows = 4,
	columns = 7,
	label = 'Loading events',
	overlay = false,
	className,
}: LoadingProps) {
	return (
		<div
			role='status'
			aria-live='polite'
			aria-busy='true'
			className={cn(
				'bg-white p-4',
				overlay ? 'absolute inset-0 z-20 overflow-hidden' : 'w-full',
				className
			)}
		>
			<span className='sr-only'>{label}</span>

			{variant === 'list' && (
				<div aria-hidden='true' className='flex flex-col gap-3'>
					{Array.from({ length: rows }, (_, i) => (
						<div key={i} className={cn(BLOCK, 'h-16')} />
					))}
				</div>
			)}

			{variant === 'columns' && (
				<div aria-hidden='true' className='flex h-full gap-3'>
					{Array.from({ length: columns }, (_, c) => (
						<div key={c} className='flex flex-1 flex-col gap-3'>
							{BAR_HEIGHTS[c % BAR_HEIGHTS.length].map((height, b) => (
								<div key={b} className={BLOCK} style={{ height: `${height}%` }} />
							))}
						</div>
					))}
				</div>
			)}

			{variant === 'grid' && (
				<div
					aria-hidden='true'
					className='grid h-full gap-2'
					style={{
						gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
					}}
				>
					{Array.from({ length: rows * columns }, (_, i) => (
						<div key={i} className={BLOCK} />
					))}
				</div>
			)}
		</div>
	);
}

export default Loading;
