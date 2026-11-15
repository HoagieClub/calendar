/**
 * @overview Message with a Retry button shown when a fetch fails.
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

type ErrorStateProps = {
	/** Re-runs the same fetch. Required: an error state without a way out is a dead end. */
	onRetry: () => void;
	title?: string;
	message?: string;
	/** Fill the nearest positioned ancestor, covering whatever is underneath. */
	overlay?: boolean;
	className?: string;
};

export function ErrorState({
	onRetry,
	title = "We couldn't load your events.",
	message = 'Check your connection and try again.',
	overlay = false,
	className,
}: ErrorStateProps) {
	return (
		<div
			role='alert'
			className={cn(
				'flex flex-col items-center justify-center gap-1 bg-white p-6 text-center text-sm text-gray-600',
				overlay ? 'absolute inset-0 z-20' : 'w-full py-12',
				className
			)}
		>
			<p className='text-base font-semibold text-gray-900'>{title}</p>
			<p>{message}</p>
			<button
				type='button'
				onClick={onRetry}
				className='mt-3 h-8 rounded-lg border border-gray-400 bg-white px-3.5 text-[13px] font-medium text-gray-800 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
			>
				Retry
			</button>
		</div>
	);
}

export default ErrorState;
