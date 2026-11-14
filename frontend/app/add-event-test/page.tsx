/**
 * @overview Temporary test page for the Add Event modal (CALR-1).
 *
 * Opens the modal from a "+ New Event" button, lists events created in this session, and can
 * re-query `GET /event/` to confirm the backend persisted them. Remove once the modal is mounted
 * on the real calendar page.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 */

'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { AddEventModal, type CreatedEvent } from '@/components/addEvent/AddEventModal';
import { apiFetch } from '@/lib/apiFetch';

function formatRange(start: string, end: string): string {
	const s = new Date(start);
	const e = new Date(end);
	const opts: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	};
	return `${s.toLocaleString('en-US', opts)} → ${e.toLocaleString('en-US', opts)}`;
}

export default function AddEventTestPage() {
	const [open, setOpen] = useState(false);
	const [created, setCreated] = useState<CreatedEvent[]>([]);
	const [serverEvents, setServerEvents] = useState<CreatedEvent[] | null>(null);
	const [loading, setLoading] = useState(false);

	async function reloadFromServer() {
		setLoading(true);
		try {
			const start = new Date();
			start.setDate(start.getDate() - 7);
			const end = new Date();
			end.setDate(end.getDate() + 60);
			const params = new URLSearchParams({
				start_time: start.toISOString(),
				end_time: end.toISOString(),
			});
			const data = await apiFetch<CreatedEvent[]>(`/event/?${params.toString()}`);
			setServerEvents(data);
		} catch (error: unknown) {
			toast.error('Could not load events', {
				description: error instanceof Error ? error.message : undefined,
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className='mx-auto max-w-5xl px-4 py-10'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-bold text-slate-900'>Add Event modal test</h1>
				<button
					type='button'
					onClick={() => setOpen(true)}
					className='rounded-md bg-[#1EA7AE] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#1F7578]'
				>
					+ New Event
				</button>
			</div>

			<section className='mb-8'>
				<h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500'>
					Created this session
				</h2>
				{created.length === 0 ? (
					<p className='text-sm text-slate-400'>Nothing yet.</p>
				) : (
					<ul className='divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white'>
						{created.map((ev) => (
							<li key={ev.id} className='px-4 py-3 text-sm'>
								<span className='font-semibold text-slate-900'>{ev.name}</span>
								<span className='ml-2 text-slate-500'>
									{formatRange(ev.start, ev.end)}
								</span>
								<span className='ml-2 text-slate-400'>#{ev.id}</span>
							</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<div className='mb-2 flex items-center gap-3'>
					<h2 className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
						GET /event/ (last 7 days → next 60 days)
					</h2>
					<button
						type='button'
						onClick={reloadFromServer}
						disabled={loading}
						className='rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60'
					>
						{loading ? 'Loading…' : 'Reload from server'}
					</button>
				</div>
				{serverEvents === null && <p className='text-sm text-slate-400'>Not loaded.</p>}
				{serverEvents !== null && serverEvents.length === 0 && (
					<p className='text-sm text-slate-400'>No events returned.</p>
				)}
				{serverEvents !== null && serverEvents.length > 0 && (
					<ul className='divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white'>
						{serverEvents.map((ev) => (
							<li key={ev.id} className='px-4 py-3 text-sm'>
								<span className='font-semibold text-slate-900'>{ev.name}</span>
								<span className='ml-2 text-slate-500'>
									{formatRange(ev.start, ev.end)}
								</span>
								<span className='ml-2 text-slate-400'>#{ev.id}</span>
							</li>
						))}
					</ul>
				)}
			</section>

			<AddEventModal
				open={open}
				onClose={() => setOpen(false)}
				onCreated={(ev) => setCreated((prev) => [ev, ...prev])}
			/>
		</main>
	);
}
