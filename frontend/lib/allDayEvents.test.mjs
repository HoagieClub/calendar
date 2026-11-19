import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(
	readFileSync(new URL('./allDayEvents.ts', import.meta.url), 'utf8'),
	{
		compilerOptions: { module: ts.ModuleKind.CommonJS },
	}
).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { isAllDayEvent, layoutAllDayEvents, dayNumber } = context.exports;
const event = (id, start, end) => ({ id, start, end, name: id });
const dates = (start, count) =>
	Array.from({ length: count }, (_, i) => {
		const date = new Date(`${start}T00:00:00`);
		date.setDate(date.getDate() + i);
		return date;
	});

await test('classifies multi-day and legacy all-day events, leaving timed events alone', () => {
	assert.ok(isAllDayEvent(event('a', '2026-11-20T18:00:00', '2026-11-22T17:00:00')));
	assert.ok(isAllDayEvent(event('b', '2026-11-20T00:00:00', '2026-11-20T23:59:00')));
	assert.equal(isAllDayEvent(event('c', '2026-11-20T10:00:00', '2026-11-20T11:00:00')), false);
});
await test('Fri–Sun clips across Sunday week boundaries and occupies midnight end date', () => {
	const item = event('a', '2026-11-20T18:00:00', '2026-11-22T00:00:00');
	const first = layoutAllDayEvents([item], dates('2026-11-15', 7)).bars[0];
	assert.equal(first.start, 5);
	assert.equal(first.end, 6);
	assert.equal(first.continuesAfter, true);
	assert.equal(first.continuesBefore, false);
	const next = layoutAllDayEvents([item], dates('2026-11-22', 7)).bars[0];
	assert.equal(next.start, 0);
	assert.equal(next.end, 0);
	assert.equal(next.continuesBefore, true);
	const middle = layoutAllDayEvents([item], dates('2026-11-21', 1)).bars[0];
	assert.ok(middle.continuesBefore && middle.continuesAfter);
});
await test('uses two lanes, counts hidden spans per day and reuses free lanes', () => {
	const items = [
		event('a', '2026-11-20T00:00:00', '2026-11-22T12:00:00'),
		event('b', '2026-11-20T01:00:00', '2026-11-21T12:00:00'),
		event('c', '2026-11-20T02:00:00', '2026-11-21T12:00:00'),
		event('d', '2026-11-22T00:00:00', '2026-11-22T23:59:00'),
	];
	const result = layoutAllDayEvents(items, dates('2026-11-20', 3));
	assert.equal(result.bars.length, 3);
	assert.equal(result.hidden[0][0].id, 'c');
	assert.equal(result.hidden[1].length, 1);
	assert.equal(result.hidden[2].length, 0);
	assert.equal(result.bars.find((bar) => bar.event.id === 'd').lane, 1);
	assert.equal(
		JSON.stringify(result),
		JSON.stringify(layoutAllDayEvents([...items].reverse(), dates('2026-11-20', 3)))
	);
});
await test('sorts numeric and string IDs consistently when event dates tie', () => {
	const items = [2, '3', 1].map((id) => event(id, '2026-11-20T18:00:00', '2026-11-22T17:00:00'));
	const result = layoutAllDayEvents(items, dates('2026-11-20', 3));
	assert.equal(result.bars[0].event.id, 1);
	assert.equal(result.bars[1].event.id, 2);
	assert.equal(result.hidden[0][0].id, '3');
	assert.equal(
		JSON.stringify(result),
		JSON.stringify(layoutAllDayEvents([...items].reverse(), dates('2026-11-20', 3)))
	);
});
await test('handles year boundaries, DST and events outside the range', () => {
	assert.equal(dayNumber('2026-03-09T00:00:00') - dayNumber('2026-03-08T00:00:00'), 1);
	const result = layoutAllDayEvents(
		[
			event('a', '2026-12-31T18:00:00', '2027-01-02T12:00:00'),
			event('b', '2026-12-01T00:00:00', '2026-12-02T12:00:00'),
		],
		dates('2027-01-01', 3)
	);
	assert.equal(result.bars.length, 1);
	assert.equal(result.bars[0].end, 1);
	assert.ok(result.bars[0].continuesBefore);
});
