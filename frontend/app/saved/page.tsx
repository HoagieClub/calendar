import Link from 'next/link';

export default function Page() {
	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold'>Saved Events</h1>
			<p className='mt-4'>Saving events is not available yet.</p>
			<Link href='/calendar' className='mt-4 inline-block underline'>
				Browse Calendar
			</Link>
		</div>
	);
}
