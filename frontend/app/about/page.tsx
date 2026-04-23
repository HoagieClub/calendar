'use client';

import React, { useState } from 'react';

import { Heading, majorScale, Pane, Text, useTheme } from 'evergreen-ui';

// --- Helper Components & Data ---
interface member {
	name: string;
	role: string;
	imgSrc: string;
	socials: {
		linkedin: string;
		github: string;
	};
}

// Icon for social media links
const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => {
	const theme = useTheme();
	const [hovered, setHovered] = useState(false);
	return (
		<a
			href={href}
			target='_blank'
			rel='noopener noreferrer'
			style={{
				color: hovered ? theme.colors.selected : '#9ca3af',
				transition: 'color 300ms',
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{children}
		</a>
	);
};

// SVG components for icons
const LinkedinIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
		<rect x='2' y='9' width='4' height='12' />
		<circle cx='4' cy='4' r='2' />
	</svg>
);

const GitHubIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 16 16'
		fill='currentColor'
	>
		<path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8' />
	</svg>
);

const LeadCard = ({ lead }: { lead: member }) => {
	const theme = useTheme();
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className='bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 ease-in-out'
		>
			<div className='p-8 flex flex-col sm:flex-row items-center'>
				{/* Intentionally using img so direct Imgur URLs work without Next image domain config. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={lead.imgSrc}
					alt={lead.name}
					className='w-32 h-32 rounded-full flex-shrink-0 mb-6 sm:mb-0 sm:mr-8'
					height={128}
					width={128}
					style={{
						objectFit: 'cover',
						border: `4px solid ${hovered ? theme.colors.blue500 : theme.colors.blue200}`,
						transition: 'border-color 300ms',
					}}
				/>
				<div className='text-center sm:text-left'>
					<h3 className='text-2xl font-bold text-slate-900'>{lead.name}</h3>
					<p className='text-md font-bold mb-2' style={{ color: theme.colors.blue500 }}>
						{lead.role}
					</p>
					<div className='flex justify-center sm:justify-start space-x-4'>
						<SocialIcon href={lead.socials.github}>
							<GitHubIcon />
						</SocialIcon>
						<SocialIcon href={lead.socials.linkedin}>
							<LinkedinIcon />
						</SocialIcon>
					</div>
				</div>
			</div>
		</div>
	);
};

const MemberCard = ({ member }: { member: member }) => {
	const theme = useTheme();
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className='bg-white rounded-xl shadow-md p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 ease-in-out'
		>
			{/* Intentionally using img so direct Imgur URLs work without Next image domain config. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={member.imgSrc}
				alt={member.name}
				className='w-24 h-24 rounded-full mx-auto mb-4'
				height={128}
				width={128}
				style={{
					objectFit: 'cover',
					border: `4px solid ${hovered ? theme.colors.blue500 : theme.colors.blue100}`,
					transition: 'border-color 300ms',
				}}
			/>
			<h4 className='font-bold text-slate-800 text-lg'>{member.name}</h4>
			<p className='text-sm font-semibold mb-2' style={{ color: theme.colors.blue500 }}>
				{member.role}
			</p>
			<div className='flex mx-auto w-min mt-2 justify-center sm:justify-start space-x-4'>
				<SocialIcon href={member.socials.github}>
					<GitHubIcon />
				</SocialIcon>
				<SocialIcon href={member.socials.linkedin}>
					<LinkedinIcon />
				</SocialIcon>
			</div>
		</div>
	);
};

// Team data organized for easier management
const teamLeads: member[] = [
	{
		name: 'Zhao Song Zhou',
		role: 'Team Lead',
		imgSrc: 'https://i.imgur.com/JeUh9dc.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/zhao-song-zhou/',
			github: 'https://github.com/ZhaoSongZh7',
		},
	},
	{
		name: 'Alvin Sze',
		role: 'Team Lead',
		imgSrc: 'https://i.imgur.com/mZy9kzp.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/alvinsze/',
			github: 'https://github.com/asze17',
		},
	},
];

const pastLeads: member[] = [
	{
		name: 'Jenny Fan',
		role: 'Team Lead (2025 - 2026)',
		imgSrc: 'https://i.imgur.com/grwgWFZ.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/jennyfan04/',
			github: 'https://github.com/jfmath04',
		},
	},
];

const teamMembers = [
	{
		name: 'Chloe Lau',
		role: 'Product Manager',
		imgSrc: 'https://i.imgur.com/BVrnu64.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/chloe-hc-lau/',
			github: 'https://github.com/lauechlo',
		},
	},
	{
		name: 'Allison Lee',
		role: 'Product Manager',
		imgSrc: 'https://i.imgur.com/3SPqM7z.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/allisonelee/',
			github: 'https://github.com/allisonelee',
		},
	},
	{
		name: 'Helen Hui',
		role: 'Product Manager',
		imgSrc: 'https://i.imgur.com/kc4WIyv.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/helen-hui-7125b929b/',
			github: 'https://github.com/ilovehhhyn',
		},
	},
	{
		name: 'Erica Lee',
		role: 'Software Engineer',
		imgSrc: 'https://i.imgur.com/1nXfGV4.png',
		socials: {
			linkedin: 'https://www.linkedin.com/in/ericayrlee/',
			github: 'https://github.com/ericayrlee',
		},
	},
	{
		name: 'Angela Cai',
		role: 'Software Engineer',
		imgSrc: 'https://i.imgur.com/NASRtwq.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/angcai/',
			github: 'https://github.com/Ang-cai',
		},
	},
	{
		name: 'Karen Gao',
		role: 'Software Engineer',
		imgSrc: 'https://i.imgur.com/dBnfnGt.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/karen-a-gao/',
			github: 'https://github.com/karengao6',
		},
	},
	{
		name: 'Chloe Chen',
		role: 'Software Engineer',
		imgSrc: 'https://i.imgur.com/HoM0S1V.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/chloe-chen-7388243b2/',
			github: 'https://github.com/celloii',
		},
	},
	{
		name: 'Niv Levy',
		role: 'Software Engineer',
		imgSrc: 'https://i.imgur.com/XbLGo6d.jpeg',
		socials: {
			linkedin: 'https://www.linkedin.com/in/niv-levy-012685258/',
			github: 'https://github.com/NivLevy-gh',
		},
	},
];

/**
 * Modern "Meet the Team" page component.
 * Features a clean, professional design with interactive cards.
 */
export function App() {
	const theme = useTheme();
	return (
		<div className='min-h-screen font-sans text-slate-800'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				{/* Header */}
				<Pane textAlign='center' marginBottom={majorScale(6)}>
					<Heading
						size={900}
						fontSize='3rem'
						fontWeight={700}
						marginBottom={majorScale(4)}
					>
						Meet the{' '}
						<Text size={900} fontSize='3rem' color={theme.colors.blue500}>
							HoagieCalendar
						</Text>{' '}
						Team
					</Heading>
					<Text size={500} display='block' maxWidth={672} marginX='auto'>
						We&apos;re a passionate group of developers and designers dedicated to
						improving your Princeton experience.
					</Text>
				</Pane>

				{/* Team Leadership Section */}
				<section className='mb-16'>
					<h2 className='text-3xl font-bold text-slate-900 mb-12 text-center'>
						Team Leadership
					</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-5xl mx-auto'>
						{teamLeads.map((lead) => (
							<LeadCard key={lead.name} lead={lead} />
						))}
					</div>
				</section>

				{/* Team Members Section */}
				<section>
					<h2 className='text-3xl font-bold text-slate-900 mb-12 text-center'>
						Our Amazing Team
					</h2>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8'>
						{teamMembers.map((member) => (
							<MemberCard key={member.name} member={member} />
						))}
					</div>
				</section>

				{/* Past Leads Section */}
				<section className='mt-16'>
					<h2 className='text-3xl font-bold text-slate-900 mb-12 text-center'>
						Past Leads
					</h2>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8'>
						{pastLeads.map((lead) => (
							<MemberCard key={lead.name} member={lead} />
						))}
					</div>
				</section>
			</div>
		</div>
	);
}

export default App;
