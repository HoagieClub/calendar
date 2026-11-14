'use client';

import Link from 'next/link';

import styles from './AsyncState.module.css';

export function Loading({
	label = 'Getting your events ready.',
	columns = 1,
	rows = 3,
}: {
	label?: string;
	columns?: number;
	rows?: number;
}) {
	return (
		<div className={styles.state} role='status' aria-label={label} aria-busy='true'>
			<span className={styles.srOnly}>{label}</span>
			<div
				className={styles.grid}
				aria-hidden='true'
				style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
			>
				{Array.from({ length: columns * rows }, (_, index) => (
					<div key={index} className={styles.skeleton}>
						<div />
						<div />
						<div />
					</div>
				))}
			</div>
		</div>
	);
}

export function Empty({
	message,
	calendarLink = false,
}: {
	message: string;
	calendarLink?: boolean;
}) {
	return (
		<div className={styles.state} role='status'>
			<p>{message}</p>
			{calendarLink && (
				<Link className={styles.action} href='/calendar'>
					Back to calendar
				</Link>
			)}
		</div>
	);
}

export function ErrorState({
	message = 'We couldn’t get your events. Please try again.',
	onRetry,
}: {
	message?: string;
	onRetry: () => void;
}) {
	return (
		<div className={styles.state} role='alert'>
			<p>{message}</p>
			<button type='button' className={styles.action} onClick={onRetry}>
				Retry
			</button>
		</div>
	);
}
