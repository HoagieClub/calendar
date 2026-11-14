/**
 * @overview Friendly line shown when a fetch succeeds but there is nothing to list.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */

import Link from 'next/link';

import { cn } from '@/lib/utils';

type EmptyProps = {
	message: string;
	/** Optional follow-up, e.g. "Add an event." or "Back to the calendar". */
	action?: { label: string; href?: string; onClick?: () => void };
	/**
	 * Float over the nearest positioned ancestor without hiding it, so a grid
	 * keeps its hours and days with the message centered on top.
	 */
	overlay?: boolean;
	className?: string;
};

const ACTION =
	'font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700 ' +
	'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

export function Empty({ message, action, overlay = false, className }: EmptyProps) {
	return (
		<div
			role='status'
			className={cn(
				'flex flex-col items-center justify-center gap-1 p-6 text-center text-sm text-gray-600',
				overlay ? 'pointer-events-none absolute inset-0 z-10' : 'w-full py-12',
				className
			)}
		>
			<div
				className={cn(
					'flex flex-col items-center gap-1',
					overlay && 'rounded-lg bg-white/90 px-4 py-2'
				)}
			>
				<p>{message}</p>
				{action &&
					(action.href ? (
						<Link href={action.href} className={cn(ACTION, 'pointer-events-auto')}>
							{action.label}
						</Link>
					) : (
						<button
							type='button'
							onClick={action.onClick}
							className={cn(ACTION, 'pointer-events-auto')}
						>
							{action.label}
						</button>
					))}
			</div>
		</div>
	);
}

export default Empty;
