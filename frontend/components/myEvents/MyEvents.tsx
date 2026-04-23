'use client';

import { useState } from 'react';

import { useTheme } from 'evergreen-ui';

// ── Types ─────────────────────────────────────────────────────

type Tab = 'All' | 'Saved' | 'Created';
type SortOption = 'Date (soonest)' | 'Date (latest)' | 'Recently added';

type Category =
  | 'SPORTS'
  | 'ACADEMIC'
  | 'SOCIAL'
  | 'FOOD'
  | 'ARTS'
  | 'CAREER'
  | 'HOUSING'
  | 'OTHER';

interface Event {
  id: string;
  title: string;
  dateISO: string;
  displayDate: string;
  timeRange: string;
  location: string;
  description: string;
  interested: number;
  category: Category;
  tab: Tab[];
  isStarred?: boolean;
  isOwned?: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────

const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Campus YMCA Yoga',
    dateISO: '2026-04-01',
    displayDate: 'WED, APR 1',
    timeRange: '4:30 PM – 5:30 PM',
    location: 'Dillon Gymnasium',
    description: 'All-level yoga class.',
    interested: 45,
    category: 'SPORTS',
    tab: ['All', 'Saved'],
    isStarred: true,
  },
  {
    id: '2',
    title: 'Debate Club Practice',
    dateISO: '2026-04-01',
    displayDate: 'WED, APR 1',
    timeRange: '4:30 PM – 6 PM',
    location: '1879 Hall',
    description: 'Weekly debate practice.',
    interested: 18,
    category: 'ACADEMIC',
    tab: ['All', 'Saved'],
    isStarred: true,
  },
  {
    id: '3',
    title: 'Midnight Coding Marathon',
    dateISO: '2026-04-02',
    displayDate: 'THU, APR 2',
    timeRange: '11 PM – 2 AM',
    location: 'CS Building',
    description: 'Build something cool!',
    interested: 42,
    category: 'ACADEMIC',
    tab: ['All'],
  },
  {
    id: '4',
    title: 'My Private Event',
    dateISO: '2026-04-03',
    displayDate: 'FRI, APR 3',
    timeRange: '12 PM – 1 PM',
    location: '',
    description: '',
    interested: 0,
    category: 'SOCIAL',
    tab: ['All', 'Created'],
    isOwned: true,
  },
];

// ── Sort Options ──────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
  'Date (soonest)',
  'Date (latest)',
  'Recently added',
];

// ── Component ─────────────────────────────────────────────────

export default function MyEvents() {
  const { colors } = useTheme();
  const themeColors = colors as any;

  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('Date (soonest)');
  const [sortOpen, setSortOpen] = useState(false);

  const tabCounts = {
    All: EVENTS.length,
    Saved: EVENTS.filter((e) => e.tab.includes('Saved')).length,
    Created: EVENTS.filter((e) => e.tab.includes('Created')).length,
  };

  const query = search.trim().toLowerCase();

  const filtered = EVENTS
    .filter((e) => {
      const matchesTab = e.tab.includes(activeTab);
      const matchesSearch =
        query === '' || e.title.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === 'Date (soonest)') {
        return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
      }
      if (sort === 'Date (latest)') {
        return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
      }
      if (sort === 'Recently added') {
        return Number(b.id) - Number(a.id);
      }
      return 0;
    });

  return (
    <div
      style={{
        padding: 32,
        background: colors.white,
        minHeight: '100%',
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: themeColors.gray900,
        }}
      >
        My Events
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        {(['All', 'Saved', 'Created'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              color:
                activeTab === tab
                  ? themeColors['hoagie-teal']
                  : themeColors.gray600,
              borderBottom:
                activeTab === tab
                  ? `2px solid ${themeColors['hoagie-teal']}`
                  : '2px solid transparent',
              paddingBottom: 6,
            }}
          >
            {tab} ({tabCounts[tab]})
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <input
          placeholder='Search events by title...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            border: `1px solid ${themeColors.gray300}`,
            borderRadius: 6,
            background: colors.white,
            color: themeColors.gray800,
          }}
        />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${themeColors.gray300}`,
              borderRadius: 6,
              background: colors.white,
              cursor: 'pointer',
              color: themeColors.gray800,
            }}
          >
            {sort} ▼
          </button>

          {sortOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                background: colors.white,
                border: `1px solid ${themeColors.gray300}`,
                borderRadius: 6,
                minWidth: 160,
                zIndex: 10,
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setSort(opt);
                    setSortOpen(false);
                  }}
                  style={{
                    padding: 10,
                    cursor: 'pointer',
                    color: themeColors.gray800,
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            themeColors={themeColors}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────

function EventCard({
  event,
  themeColors,
  colors,
}: {
  event: Event;
  themeColors: any;
  colors: any;
}) {
  return (
    <div
      style={{
        border: `1px solid ${themeColors.gray200}`,
        borderRadius: 10,
        overflow: 'hidden',
        background: colors.white,
      }}
    >
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: themeColors.gray600 }}>
          {event.displayDate}
        </div>

        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
            color: themeColors.gray900,
          }}
        >
          {event.title}
        </div>

        {(event.timeRange || event.location) && (
          <div
            style={{
              fontSize: 12,
              color: themeColors.gray600,
              marginTop: 4,
            }}
          >
            {event.timeRange}
            {event.location && ` • ${event.location}`}
          </div>
        )}

        {event.description && (
          <div
            style={{
              fontSize: 13,
              marginTop: 6,
              color: themeColors.gray600,
            }}
          >
            {event.description}
          </div>
        )}

        {event.isOwned && (
          <button
            style={{
              marginTop: 8,
              fontSize: 12,
              padding: '4px 8px',
              border: `1px solid ${themeColors.gray300}`,
              borderRadius: 4,
              background: colors.white,
              cursor: 'pointer',
              color: themeColors.gray800,
            }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}