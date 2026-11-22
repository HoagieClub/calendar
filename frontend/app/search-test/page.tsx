'use client';

import { useState } from 'react';

import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';

// Temporary: replace with a fetch once the backend has a category endpoint.
const categories = [
	{ id: 1, name: 'Academic' },
	{ id: 3, name: 'Social' },
];

export default function SearchTestPage() {
	const [submitted, setSubmitted] = useState<string | null>(null);

	return (
		<div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
			<SearchBar onSearch={setSubmitted} onClear={() => setSubmitted(null)} />

			{submitted === null ? (
				<p>Calendar goes here.</p>
			) : (
				<SearchResults
					key={submitted}
					query={submitted}
					categories={categories}
					onSelectEvent={(ev) => console.log('open popup for', ev)}
				/>
			)}
		</div>
	);
}
