/**
 * @overview Landing page for the calendar app.
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

import { Pane, majorScale, minorScale, Heading, ArrowLeftIcon, Button } from 'evergreen-ui';
import Link from 'next/link';

import AuthButton from '@/lib/hoagie-ui/AuthButton';

export function Home() {
	return (
		<Pane
			display='flex'
			justifyContent='center'
			alignItems='center'
			marginX={majorScale(1)}
			paddingBottom={majorScale(4)}
			paddingTop={majorScale(8)}
		>
			<Pane
				borderRadius={8}
				textAlign='center'
				elevation={1}
				background='white'
				marginX={20}
				maxWidth='600px'
				width='100%'
				paddingX='10px'
				paddingTop={majorScale(5)}
				paddingBottom={majorScale(7)}
			>
				<ArrowLeftIcon size={48} color='gray800' />
				<Heading size={900} className='hoagie'>
					Hoagie Calendar App
					<br />
					What will <b>you</b> build?
				</Heading>
				<div>
					<Pane
						display='flex'
						flexDirection='column'
						alignItems='center'
						marginTop='30px'
					>
						<AuthButton />
						<Link href='https://hoagie.io'>
							<Button
								height={56}
								width={majorScale(35)}
								appearance='default'
								marginTop={20}
								iconBefore={ArrowLeftIcon}
							>
								<Pane display='flex'>
									Back to
									<Pane marginLeft={minorScale(1)} className='hoagie'>
										hoagie<b>platform</b>
									</Pane>
								</Pane>
							</Button>
						</Link>
						<br />
					</Pane>
				</div>
				<div>© 2026 Hoagie Club.</div>
			</Pane>
		</Pane>
	);
}

export default Home;
