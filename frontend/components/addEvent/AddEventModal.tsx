/**
 * @overview Create-event modal (CALR-1).
 *
 * Two-column layout at desktop width (~880px), single column below 1024px.
 * Left: name, start row, end row, location, description. Right: organizer, category grid, submit.
 * Submits `POST /event/` through `apiFetch` with local-offset ISO datetimes.
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

import { useEffect, useState, type FormEvent } from 'react';

import { toast } from 'sonner';

import { apiFetch } from '@/lib/apiFetch';

export interface Category {
	id: number;
	name: string;
}

/** Body sent to `POST /event/`. `owner` and `from_mail` are set by the backend. */
export interface NewEventPayload {
	name: string;
	start: string;
	end: string;
	location: string;
	description: string;
	host: string;
	category: number[];
}

/** Shape returned by `POST /event/` (see `EventSerializer` in the backend). */
export interface CreatedEvent extends NewEventPayload {
	id: number;
	owner: number;
	from_mail: boolean;
	ordering?: number;
}

export interface AddEventModalProps {
	open: boolean;
	onClose: () => void;
	/** Called with the created event so the calendar can render it without a reload. */
	onCreated?: (event: CreatedEvent) => void;
}

interface FormState {
	name: string;
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	location: string;
	host: string;
	description: string;
	category: number[];
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const MAX_TEXT = 100;
const MAX_DESCRIPTION = 10000;

/**
 * Emoji shown before each category tile, keyed by the category name returned by `GET /category/`.
 * Matches the "Create individual event" Figma frame. Unknown names render without an emoji.
 */
const CATEGORY_EMOJI: Record<string, string> = {
	'Social Events': '🎉',
	Academic: '📚',
	'Free Food': '🍕',
	'Arts & Culture': '🎭',
	'Sports & Fitness': '⚽',
	Career: '💼',
	'Housing & Sales': '🏠',
	Other: '📌',
};

// Brand colours are written inline as Tailwind arbitrary values because Tailwind only detects
// class names that appear literally in source. They come from the hoagieCalendar palette in
// lib/hoagie-ui/Theme/themes.tsx: teal #1EA7AE, dark #1F7578, ink #0F5156, tint #E9FAFB,
// focus ring #D3F5F7.

const pad = (n: number): string => n.toString().padStart(2, '0');

/** `YYYY-MM-DD` in the user's local time zone (not `toISOString`, which is UTC). */
export function toDateInput(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** `HH:MM` in the user's local time zone. */
export function toTimeInput(d: Date): string {
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Combine a date input and a time input into an ISO 8601 string that keeps the local offset,
 * e.g. `2026-10-23T20:30:00-04:00`. `Date.toISOString()` is deliberately avoided because it
 * converts to UTC and can move an evening event onto the next calendar day.
 */
export function toLocalISO(date: string, time: string): string | null {
	if (!date || !time) {
		return null;
	}
	const [y, m, d] = date.split('-').map(Number);
	const [hh, mm] = time.split(':').map(Number);
	if ([y, m, d, hh, mm].some(Number.isNaN)) {
		return null;
	}
	const local = new Date(y, m - 1, d, hh, mm, 0, 0);
	if (Number.isNaN(local.getTime())) {
		return null;
	}
	const offset = -local.getTimezoneOffset();
	const sign = offset >= 0 ? '+' : '-';
	const abs = Math.abs(offset);
	return `${date}T${pad(hh)}:${pad(mm)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** "Thursday, April 16, 2026" for the modal subtitle, from a `YYYY-MM-DD` input value. */
function formatSubtitleDate(date: string): string {
	const [y, m, d] = date.split('-').map(Number);
	if ([y, m, d].some(Number.isNaN)) {
		return '';
	}
	return new Date(y, m - 1, d).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function roundToNextHour(d: Date): Date {
	const next = new Date(d);
	next.setMinutes(0, 0, 0);
	next.setHours(next.getHours() + 1);
	return next;
}

function defaultForm(): FormState {
	const start = roundToNextHour(new Date());
	const end = new Date(start.getTime() + 60 * 60 * 1000);
	return {
		name: '',
		startDate: toDateInput(start),
		startTime: toTimeInput(start),
		endDate: toDateInput(end),
		endTime: toTimeInput(end),
		location: '',
		host: '',
		description: '',
		category: [],
	};
}

function validate(form: FormState): FieldErrors {
	const errors: FieldErrors = {};
	const name = form.name.trim();
	const location = form.location.trim();
	const description = form.description.trim();
	const host = form.host.trim();

	if (!name) {
		errors.name = 'Event name is required.';
	} else if (name.length > MAX_TEXT) {
		errors.name = `Maximum ${MAX_TEXT} characters.`;
	}

	if (!form.startDate) {
		errors.startDate = 'Required.';
	}
	if (!form.startTime) {
		errors.startTime = 'Required.';
	}
	if (!form.endDate) {
		errors.endDate = 'Required.';
	}
	if (!form.endTime) {
		errors.endTime = 'Required.';
	}

	const start = toLocalISO(form.startDate, form.startTime);
	const end = toLocalISO(form.endDate, form.endTime);
	if (start && end && new Date(end).getTime() <= new Date(start).getTime()) {
		errors.endTime = 'End must be after start.';
	}

	if (!location) {
		errors.location = 'Location is required.';
	} else if (location.length < 3) {
		errors.location = 'Minimum 3 characters.';
	} else if (location.length > MAX_TEXT) {
		errors.location = `Maximum ${MAX_TEXT} characters.`;
	}

	if (!description) {
		errors.description = 'Description is required.';
	} else if (description.length > MAX_DESCRIPTION) {
		errors.description = `Maximum ${MAX_DESCRIPTION.toLocaleString()} characters.`;
	}

	if (!host) {
		errors.host = 'Organizer is required.';
	} else if (host.length > MAX_TEXT) {
		errors.host = `Maximum ${MAX_TEXT} characters.`;
	}

	if (form.category.length === 0) {
		errors.category = 'Select at least one category.';
	}

	return errors;
}

function inputClass(hasError?: string): string {
	return [
		'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
		'transition focus:outline-none focus:ring-2',
		hasError
			? 'border-red-400 focus:border-red-400 focus:ring-red-100'
			: 'border-slate-300 focus:border-[#1EA7AE] focus:ring-[#D3F5F7]',
	].join(' ');
}

function FieldError({ text }: { text?: string }) {
	if (!text) {
		return null;
	}
	return <p className='mt-1 text-xs text-red-500'>{text}</p>;
}

function Label({
	htmlFor,
	children,
	required,
	hint,
}: {
	htmlFor: string;
	children: string;
	required?: boolean;
	hint?: string;
}) {
	return (
		<label htmlFor={htmlFor} className='mb-1.5 block text-xs font-bold text-slate-800'>
			{children}
			{required && <span className='ml-0.5 text-red-500'>*</span>}
			{hint && <span className='ml-1 font-normal text-slate-400'>({hint})</span>}
		</label>
	);
}

export function AddEventModal({ open, onClose, onCreated }: AddEventModalProps) {
	const [form, setForm] = useState<FormState>(defaultForm);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoriesLoading, setCategoriesLoading] = useState(false);
	const [categoriesError, setCategoriesError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// Reset the form each time the modal opens.
	useEffect(() => {
		if (open) {
			setForm(defaultForm());
			setErrors({});
		}
	}, [open]);

	// Load categories when the modal opens.
	useEffect(() => {
		if (!open) {
			return;
		}
		let cancelled = false;
		setCategoriesLoading(true);
		setCategoriesError(null);
		apiFetch<Category[]>('/category/')
			.then((data) => {
				if (!cancelled) {
					setCategories(Array.isArray(data) ? data : []);
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					const message =
						error instanceof Error ? error.message : 'Could not load categories.';
					setCategoriesError(message);
					toast.error('Could not load categories', { description: message });
				}
			})
			.finally(() => {
				if (!cancelled) {
					setCategoriesLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [open]);

	// Close on Escape.
	useEffect(() => {
		if (!open) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !submitting) {
				onClose();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, submitting, onClose]);

	if (!open) {
		return null;
	}

	function update<K extends keyof FormState>(field: K, value: FormState[K]) {
		setForm((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	}

	function toggleCategory(id: number) {
		const next = form.category.includes(id)
			? form.category.filter((c) => c !== id)
			: [...form.category, id];
		update('category', next);
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (submitting) {
			return;
		}

		const nextErrors = validate(form);
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const start = toLocalISO(form.startDate, form.startTime);
		const end = toLocalISO(form.endDate, form.endTime);
		if (!start || !end) {
			setErrors({ startDate: 'Invalid date or time.' });
			return;
		}

		const payload: NewEventPayload = {
			name: form.name.trim(),
			start,
			end,
			location: form.location.trim(),
			description: form.description.trim(),
			host: form.host.trim(),
			category: form.category,
		};

		setSubmitting(true);
		try {
			const created = await apiFetch<CreatedEvent>('/event/', {
				method: 'POST',
				body: payload,
			});
			toast.success('Event created', { description: payload.name });
			onCreated?.(created);
			onClose();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : 'Something went wrong. Please try again.';
			toast.error('Could not create event', { description: message });
		} finally {
			setSubmitting(false);
		}
	}

	const subtitle = formatSubtitleDate(form.startDate);

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center p-4'
			role='dialog'
			aria-modal='true'
			aria-labelledby='add-event-title'
		>
			<div
				className='absolute inset-0 bg-slate-900/40'
				onClick={() => !submitting && onClose()}
			/>

			<div className='relative flex max-h-[92vh] w-full max-w-[880px] flex-col rounded-xl bg-white shadow-2xl'>
				<form onSubmit={handleSubmit} noValidate className='flex min-h-0 flex-col'>
					{/* ── Header ── */}
					<div className='shrink-0 px-6 pb-4 pt-5'>
						<h2 id='add-event-title' className='text-base font-bold text-slate-900'>
							Event Details
						</h2>
						{subtitle && <p className='mt-0.5 text-sm text-slate-500'>{subtitle}</p>}
					</div>

					{/* ── Body ── */}
					<div className='grid min-h-0 grid-cols-1 gap-x-8 gap-y-4 overflow-y-auto px-6 pb-5 lg:grid-cols-2'>
						{/* Left column */}
						<div className='flex flex-col gap-4'>
							<div>
								<Label htmlFor='event-name' required>
									Event Name
								</Label>
								<input
									id='event-name'
									className={inputClass(errors.name)}
									placeholder="What's the event?"
									maxLength={MAX_TEXT}
									value={form.name}
									onChange={(e) => update('name', e.target.value)}
									autoFocus
								/>
								<FieldError text={errors.name} />
							</div>

							<div className='grid grid-cols-2 gap-3'>
								<div>
									<Label htmlFor='start-date' required>
										Start Date
									</Label>
									<input
										id='start-date'
										type='date'
										className={inputClass(errors.startDate)}
										value={form.startDate}
										onChange={(e) => update('startDate', e.target.value)}
									/>
									<FieldError text={errors.startDate} />
								</div>
								<div>
									<Label htmlFor='start-time' required>
										Start Time
									</Label>
									<input
										id='start-time'
										type='time'
										className={inputClass(errors.startTime)}
										value={form.startTime}
										onChange={(e) => update('startTime', e.target.value)}
									/>
									<FieldError text={errors.startTime} />
								</div>
							</div>

							<div className='grid grid-cols-2 gap-3'>
								<div>
									<Label htmlFor='end-date' required>
										End Date
									</Label>
									<input
										id='end-date'
										type='date'
										className={inputClass(errors.endDate)}
										min={form.startDate || undefined}
										value={form.endDate}
										onChange={(e) => update('endDate', e.target.value)}
									/>
									<FieldError text={errors.endDate} />
								</div>
								<div>
									<Label htmlFor='end-time' required>
										End Time
									</Label>
									<input
										id='end-time'
										type='time'
										className={inputClass(errors.endTime)}
										value={form.endTime}
										onChange={(e) => update('endTime', e.target.value)}
									/>
									<FieldError text={errors.endTime} />
								</div>
							</div>

							<div>
								<Label htmlFor='event-location' required>
									Location
								</Label>
								<input
									id='event-location'
									className={inputClass(errors.location)}
									placeholder='McCosh 50, Frist Campus Center, etc.'
									maxLength={MAX_TEXT}
									value={form.location}
									onChange={(e) => update('location', e.target.value)}
								/>
								<FieldError text={errors.location} />
							</div>

							<div>
								<Label htmlFor='event-description' required>
									Description
								</Label>
								<textarea
									id='event-description'
									className={`${inputClass(errors.description)} min-h-24 resize-y`}
									placeholder='Details about the event...'
									maxLength={MAX_DESCRIPTION}
									rows={4}
									value={form.description}
									onChange={(e) => update('description', e.target.value)}
								/>
								<div className='flex justify-between'>
									<FieldError text={errors.description} />
									<span className='ml-auto text-xs text-slate-400'>
										{form.description.trim().length.toLocaleString()}/
										{MAX_DESCRIPTION.toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						{/* Right column */}
						<div className='flex flex-col gap-4'>
							<div>
								<Label htmlFor='event-host' required>
									Organizer/Club
								</Label>
								<input
									id='event-host'
									className={inputClass(errors.host)}
									placeholder='e.g., Princeton Coding Club'
									maxLength={MAX_TEXT}
									value={form.host}
									onChange={(e) => update('host', e.target.value)}
								/>
								<FieldError text={errors.host} />
							</div>

							<div>
								<Label
									htmlFor='event-categories'
									required
									hint='select one or more'
								>
									Category
								</Label>
								{categoriesLoading && (
									<p className='text-sm text-slate-400'>Loading categories…</p>
								)}
								{categoriesError && !categoriesLoading && (
									<p className='text-sm text-red-500'>{categoriesError}</p>
								)}
								{!categoriesLoading &&
									!categoriesError &&
									categories.length === 0 && (
										<p className='text-sm text-slate-400'>
											No categories available.
										</p>
									)}
								<div
									id='event-categories'
									role='group'
									aria-label='Categories'
									className='grid grid-cols-2 gap-2'
								>
									{categories.map((cat) => {
										const selected = form.category.includes(cat.id);
										return (
											<button
												key={cat.id}
												type='button'
												aria-pressed={selected}
												onClick={() => toggleCategory(cat.id)}
												className={[
													'rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors',
													selected
														? 'border-[#1EA7AE] bg-[#E9FAFB] text-[#0F5156]'
														: 'border-slate-300 bg-white text-slate-700 hover:border-[#1EA7AE]',
												].join(' ')}
											>
												{CATEGORY_EMOJI[cat.name] && (
													<span aria-hidden='true' className='mr-1.5'>
														{CATEGORY_EMOJI[cat.name]}
													</span>
												)}
												{cat.name}
											</button>
										);
									})}
								</div>
								<FieldError text={errors.category} />
							</div>
						</div>
					</div>

					{/* ── Footer ── */}
					<div className='flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-3'>
						<button
							type='button'
							onClick={onClose}
							disabled={submitting}
							className='rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={submitting || categoriesLoading}
							className='rounded-md bg-[#1EA7AE] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1F7578] disabled:cursor-not-allowed disabled:opacity-60'
						>
							{submitting ? 'Adding…' : 'Add Event'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default AddEventModal;
