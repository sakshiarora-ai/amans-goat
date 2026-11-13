'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Task = { id: number; title: string; done: boolean; sourceId?: string; sourceUrl?: string };
type Topic = { category: string; title: string; summary: string; read: string; source: string; url: string; angle: string };
type LiveReport = { id: string; title: string; source: string; url: string; imageUrl?: string; category: string; signal?: 'news' | 'creator' | 'event' | 'x' | 'video'; publishedAt: string; reachScore?: number; whyItCanTravel?: string; relatedTo?: string };
type CreatorProfile = { name: string; handle: string; url?: string; status: 'verified' | 'confirm'; lane: string; pattern: string; sourceSignals: string; opportunity: string };

const defaultTasks: Task[] = [
  { id: 1, title: 'Review morning brief', done: true },
  { id: 2, title: 'Outline one content idea', done: false },
  { id: 3, title: 'Research India–EU trade', done: false },
  { id: 4, title: 'Draft tomorrow’s priority list', done: true },
  { id: 5, title: 'Save three useful sources', done: false },
];

const topics: Topic[] = [
  { category: 'Geopolitics', title: 'COP31 puts climate equity back at the centre', summary: 'India is pressing developed economies on finance, adaptation and a just transition at the Antalya summit.', read: '7 min', source: 'Reuters diary', url: 'https://www.devdiscourse.com/article/international/4005225-diary-political-and-general-news-events-from-november-11', angle: 'Explain what climate equity means for India’s negotiating power.' },
  { category: 'Geopolitics', title: 'The world recalibrates after the U.S. midterms', summary: 'Allies and rivals are assessing what a political reset in Washington means for trade, security and predictability.', read: '8 min', source: 'AP', url: 'https://apnews.com/article/4b5932abf54c5f6dc70b1f8f2d1c5d07', angle: 'Map the three biggest implications for New Delhi.' },
  { category: 'Geopolitics', title: 'BRICS and India’s balancing act', summary: 'New Delhi continues to balance strategic autonomy, energy security and ties with competing power blocs.', read: '6 min', source: 'AP', url: 'https://apnews.com/article/f7735ac233c7e8db8ac021c53a3eef8a', angle: 'Build a visual explainer on strategic autonomy.' },
  { category: 'Indian politics', title: 'Election neutrality rules widen their reach', summary: 'The Election Commission’s model-code guidance now extends to retired officials re-engaged by states.', read: '5 min', source: 'Lighthouse Prep', url: 'https://lighthouseprep.in/current-affairs/month/2026-11', angle: 'Break down what the rule changes in practice.' },
  { category: 'Indian politics', title: 'Nandigram returns to Bengal’s political agenda', summary: 'The state government has announced fresh action around cases tied to the 2007 violence.', read: '6 min', source: 'Indian Opinion', url: 'https://indianopinion.org/today-in-india-11-november-2026/', angle: 'Create a timeline: Nandigram, 2007 to today.' },
  { category: 'Indian politics', title: 'Women’s representation meets delimitation', summary: 'The push for more women in Parliament remains intertwined with constituency redrawing and electoral strategy.', read: '9 min', source: 'AP', url: 'https://apnews.com/article/7c1746c2beeb9d069452afc647d0e59a', angle: 'Separate the constitutional process from party claims.' },
  { category: 'National', title: 'India protects battery-recycling raw material', summary: 'A ban on exports of specified lithium-ion black mass raises questions about domestic critical-mineral capacity.', read: '5 min', source: 'Bankers Adda', url: 'https://www.bankersadda.com/daily-current-affairs-and-gk-updates-11th-november-2026/', angle: 'Connect e-waste policy to India’s EV ambitions.' },
  { category: 'National', title: 'A green AI data-centre bet in Andhra Pradesh', summary: 'The state has cleared new investment frameworks and a major integrated green data-centre proposal.', read: '6 min', source: 'Lighthouse Prep', url: 'https://lighthouseprep.in/current-affairs/month/2026-11', angle: 'Ask whether AI infrastructure can really be green.' },
  { category: 'National', title: 'Patna enters the municipal bond market', summary: 'Bihar’s first municipal bond is intended to fund a pipeline of urban infrastructure projects.', read: '5 min', source: 'Indian Opinion', url: 'https://indianopinion.org/today-in-india-11-november-2026/', angle: 'Demystify how city bonds fund public infrastructure.' },
  { category: 'National', title: 'India–Norway circular-economy partnership', summary: 'The partnership focuses on turning industrial waste into inputs for cleaner construction and cement.', read: '4 min', source: 'Projects Pilot', url: 'https://projectspilot.com/current-affairs/today', angle: 'Profile three waste-to-value opportunities for India.' },
];

const filters = ['All', 'Geopolitics', 'Indian politics', 'National'];
const formats = ['Reel', 'Carousel', 'Caption', 'Stories'];
const channelHandle = '@aman.enlights';
const creatorWatchlist: CreatorProfile[] = [
  { name: 'Vivek Sehrawat', handle: '@vivekonpoint', url: 'https://www.instagram.com/vivekonpoint/', status: 'verified', lane: 'Geopolitics · finance · social debate', pattern: 'Fast topical reaction, provocative question, confident camera-led explanation.', sourceSignals: 'Breaking global developments, viral clips, public debate and finance/economy stories.', opportunity: 'Add a source ladder, India impact and a calm “what could change this?” ending.' },
  { name: 'Amit Kilhor', handle: '@amitkilhor', url: 'https://www.instagram.com/amitkilhor/', status: 'verified', lane: 'Governance · UPSC · institutions', pattern: 'Blunt thesis, lived-experience authority and a strong institutional critique.', sourceSignals: 'Current affairs, X conversations, UPSC/governance controversies and public frustration.', opportunity: 'Keep the directness, but separate allegation, evidence and inference on screen.' },
  { name: 'SimplifieD', handle: '@simplifiedsd', url: 'https://www.instagram.com/simplifiedsd/', status: 'verified', lane: 'Politics · economy · current affairs', pattern: 'Teacher-style explanation, structured reasoning and a clear conceptual takeaway.', sourceSignals: 'Newspaper explainers, policy changes, political statements and UPSC-oriented analysis.', opportunity: 'Use tighter visual storytelling and end with one decision-relevant insight.' },
  { name: 'Nirbhay Singh', handle: '@nirbhayonpoint', url: 'https://www.instagram.com/nirbhayonpoint/', status: 'verified', lane: 'Indian politics · protests · youth', pattern: 'Hindi-first urgency, regional relevance and an emotionally legible public-interest frame.', sourceSignals: 'Student issues, elections, protests, state news and fast-moving local reports.', opportunity: 'Connect the local event to the national system with a map, timeline and primary document.' },
  { name: 'Prafful Garg', handle: '@praffulgarg', url: 'https://www.instagram.com/praffulgarg/', status: 'verified', lane: 'National news · policy · social issues', pattern: 'Daily publishing habit, nation-first framing and simplified mass-audience delivery.', sourceSignals: 'Mainstream reports, policy announcements, viral debates and high-salience India stories.', opportunity: 'Win on balance: steelman both sides, cite the document and show what viewers should watch next.' },
  { name: 'Aditya Singh', handle: '@adityasaidwhat', url: 'https://www.instagram.com/adityasaidwhat/', status: 'verified', lane: 'Geopolitics · technology · economy', pattern: 'High-curiosity premise, modern references and blunt strategic interpretation.', sourceSignals: 'Defence technology, global power shifts, economic systems and emerging-tech stories.', opportunity: 'Pair the strong hook with a three-layer explainer: mechanism, India impact, counter-case.' },
  { name: 'Anikett Thakurr', handle: 'Exact profile needed', status: 'confirm', lane: 'Pending verification', pattern: 'The supplied name matches multiple unrelated accounts.', sourceSignals: 'Not monitored as a confirmed profile yet.', opportunity: 'Share the Instagram profile link to activate reliable monitoring.' },
  { name: 'Kumar Rishabh', handle: 'Rishabh on Point · exact profile needed', status: 'confirm', lane: 'Pending verification', pattern: 'Public search does not resolve one unique creator profile.', sourceSignals: 'Name-level signals are watched cautiously and labelled unverified.', opportunity: 'Share the profile link so alerts cannot confuse him with another Rishabh.' },
  { name: 'Anurag Pandey', handle: 'Exact profile needed', status: 'confirm', lane: 'Pending verification', pattern: 'Several creators and public figures share this name.', sourceSignals: 'Name-level signals are watched cautiously and labelled unverified.', opportunity: 'Share the profile link to complete the competitor map.' },
];
const worldSignals = [
  { region: 'India', level: 'HIGH', title: 'Strategic autonomy', note: 'Trade, defence and Global South leadership are converging into one strong creator narrative.', position: 'india' },
  { region: 'United States', level: 'RISING', title: 'Post-midterm reset', note: 'Allies are recalculating the reliability and direction of American power.', position: 'usa' },
  { region: 'Europe', level: 'WATCH', title: 'Trade + climate rules', note: 'European industrial and climate policy will shape India’s market access.', position: 'europe' },
  { region: 'West Asia', level: 'HIGH', title: 'A new balance of power', note: 'Security, energy and corridor diplomacy remain tightly connected.', position: 'west-asia' },
];
const creatorCopy: Record<string, { hook: string; body: string[]; cta: string }> = {
  Reel: { hook: 'India’s next power move isn’t what you think.', body: ['Start with the tension: a world split into rival blocs.', 'Show the shift: India is working with all sides without fully joining one.', 'Land the insight: strategic autonomy is becoming real leverage.'], cta: 'Follow for one clear geopolitical story every morning.' },
  Carousel: { hook: 'India’s middle-power moment — explained in 6 slides', body: ['01 · The world is becoming multipolar', '02 · India has options, not alliances', '03 · Trade is now a foreign-policy tool', '04 · The Global South wants a stronger voice', '05 · Strategic autonomy creates leverage', '06 · What to watch next'], cta: 'Save this for your next current-affairs conversation.' },
  Caption: { hook: 'India is no longer choosing between power blocs. It is building room to move.', body: ['That changes how New Delhi approaches trade, climate negotiations, defence, and the Global South. The interesting story is not neutrality—it is leverage.'], cta: 'What should India prioritise next: trade, security, or climate leadership?' },
  Stories: { hook: 'Quick poll: Is India already a global middle power?', body: ['Story 1 · The one-line context', 'Story 2 · Three signals to watch', 'Story 3 · Audience poll: Yes / Not yet', 'Story 4 · Reveal + tomorrow’s topic'], cta: 'Reply with the country relationship you want decoded next.' },
};

const topicStopWords = new Set(['about', 'after', 'against', 'breaking', 'current', 'explained', 'from', 'global', 'government', 'india', 'indian', 'into', 'latest', 'leader', 'national', 'news', 'over', 'performance', 'politics', 'president', 'questions', 'report', 'reports', 'that', 'their', 'this', 'today', 'video', 'viral', 'with']);
function topicWords(title: string) {
  return new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length > 4 && !topicStopWords.has(word)));
}
function isRelatedTopic(a: LiveReport, b: LiveReport) {
  const aWords = topicWords(a.title);
  const shared = [...topicWords(b.title)].filter((word) => aWords.has(word));
  return shared.length >= 2;
}
function isRelatedVideo(topic: LiveReport, video: LiveReport) {
  if (video.relatedTo === topic.id) return true;
  const topicSet = topicWords(topic.title);
  const videoSet = topicWords(video.title);
  const shared = [...videoSet].filter((word) => topicSet.has(word));
  if (shared.length < 2) return false;
  return shared.length / Math.max(1, Math.min(topicSet.size, videoSet.size)) >= 0.45;
}

function storyCopy(report: LiveReport, format: string) {
  const title = report.title.replace(/\s+/g, ' ').trim();
  const shortTitle = title.length > 92 ? `${title.slice(0, 89)}…` : title;
  const sharedCta = `What matters most here—the immediate headline or what happens next? Tell ${channelHandle}.`;
  if (format === 'Carousel') return { hook: `${shortTitle} — understood in 6 slides`, body: ['01 · What has been confirmed', '02 · Who is directly affected', '03 · The missing background', '04 · Why this matters for India', '05 · What remains uncertain', '06 · The next signal to watch'], cta: 'Save this explainer and share it with someone following the story.' };
  if (format === 'Caption') return { hook: `The headline: ${shortTitle}`, body: [`Start with the verified development, then explain the consequence without overstating what is known. Source the claim to ${report.source}, separate reporting from analysis, and end with the next question viewers should watch.`], cta: sharedCta };
  if (format === 'Stories') return { hook: `Have you seen this? ${shortTitle}`, body: ['Story 1 · State the confirmed development', 'Story 2 · Add one piece of missing context', 'Story 3 · Explain the India consequence', 'Story 4 · Poll: important shift or temporary noise?'], cta: 'Reply with the part you want decoded in the full Reel.' };
  return { hook: `${shortTitle}—but here’s what the headline leaves out.`, body: [`0–05 sec · Open with the verified development from ${report.source}.`, '05–15 sec · Explain the background in one plain-language sentence.', `15–30 sec · Show why this ${report.category.toLowerCase()} story matters for India or the audience.`, '30–40 sec · Separate what is confirmed from analysis and name the next signal to watch.'], cta: sharedCta };
}

export default function Home() {
  const [tab, setTab] = useState<'today' | 'tasks' | 'research' | 'watch' | 'studio'>('today');
  const [filter, setFilter] = useState('All');
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [newTask, setNewTask] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [miniMode, setMiniMode] = useState(false);
  const [toast, setToast] = useState('');
  const [dateLabel, setDateLabel] = useState('WEDNESDAY · 11 NOVEMBER');
  const [format, setFormat] = useState('Reel');
  const [selectedTopic, setSelectedTopic] = useState(2);
  const [selectedLiveTopic, setSelectedLiveTopic] = useState<LiveReport | null>(null);
  const [activeRegion, setActiveRegion] = useState(0);
  const [liveReports, setLiveReports] = useState<LiveReport[]>([]);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState('');
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(false);
  const [watchMode, setWatchMode] = useState<'mine' | 'creators' | 'events' | 'x'>('mine');
  const [opportunityCount, setOpportunityCount] = useState(10);
  const [reelsCreated, setReelsCreated] = useState(0);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'auto' | 'dark'>('auto');
  const [greeting, setGreeting] = useState('Welcome back, Aman.');

  useEffect(() => {
    const stored = localStorage.getItem('pulsedesk.tasks');
    if (stored) setTasks(JSON.parse(stored));
    const storedReels = Number(localStorage.getItem('pulsedesk.reelsCreated'));
    if (Number.isFinite(storedReels) && storedReels >= 0) setReelsCreated(storedReels);
    const storedTheme = localStorage.getItem('pulsedesk.theme');
    if (storedTheme === 'light' || storedTheme === 'auto' || storedTheme === 'dark') setTheme(storedTheme);
    setRailCollapsed(localStorage.getItem('pulsedesk.railCollapsed') === 'true');
    const requestedView = new URLSearchParams(window.location.search).get('view');
    if (requestedView === 'today' || requestedView === 'tasks' || requestedView === 'research' || requestedView === 'watch' || requestedView === 'studio') setTab(requestedView);

    function syncClock() {
      const now = new Date();
      setDateLabel(new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(now).toUpperCase());
      const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(now));
      setGreeting(hour < 12 ? 'Good morning, Aman.' : hour < 17 ? 'Good afternoon, Aman.' : 'Good evening, Aman.');
    }
    syncClock();
    const clock = window.setInterval(syncClock, 60 * 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => { localStorage.setItem('pulsedesk.tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('pulsedesk.reelsCreated', String(reelsCreated)); }, [reelsCreated]);
  useEffect(() => { localStorage.setItem('pulsedesk.railCollapsed', String(railCollapsed)); }, [railCollapsed]);
  useEffect(() => {
    localStorage.setItem('pulsedesk.theme', theme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => { document.documentElement.dataset.theme = theme === 'auto' ? (media.matches ? 'dark' : 'light') : theme; };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    loadLiveReports();
    const hourlyRefresh = window.setInterval(loadLiveReports, 60 * 60 * 1000);
    return () => window.clearInterval(hourlyRefresh);
  }, []);

  const visibleTopics = useMemo(() => filter === 'All' ? topics : topics.filter((topic) => topic.category === filter), [filter]);
  const myOpportunities = useMemo(() => liveReports.filter((report) => report.signal === 'news' || !report.signal).sort((a, b) => (b.reachScore || 0) - (a.reachScore || 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt)), [liveReports]);
  const creatorReports = useMemo(() => liveReports.filter((report) => report.signal === 'creator'), [liveReports]);
  const eventReports = useMemo(() => liveReports.filter((report) => report.signal === 'event'), [liveReports]);
  const xReports = useMemo(() => liveReports.filter((report) => report.signal === 'x'), [liveReports]);
  const videoReports = useMemo(() => liveReports.filter((report) => report.signal === 'video'), [liveReports]);
  const activeWatchReports = watchMode === 'creators' ? creatorReports : watchMode === 'events' ? eventReports : watchMode === 'x' ? xReports : myOpportunities;
  const radarReports = useMemo(() => filter === 'All' ? liveReports : liveReports.filter((report) => report.category === filter), [filter, liveReports]);
  const complete = tasks.filter((task) => task.done).length;
  const percent = tasks.length ? Math.round((complete / tasks.length) * 100) : 0;
  const activeStudioCopy = selectedLiveTopic ? storyCopy(selectedLiveTopic, format) : creatorCopy[format];
  const activeStudioTitle = selectedLiveTopic?.title || topics[selectedTopic].title;
  const activeStudioSource = selectedLiveTopic?.source || topics[selectedTopic].source;

  function toggleTask(id: number) { setTasks((all) => all.map((task) => task.id === id ? { ...task, done: !task.done } : task)); }
  function isSaved(report: LiveReport) { return tasks.some((task) => task.sourceId === report.id); }
  function toggleSavedReport(report: LiveReport) {
    if (isSaved(report)) {
      setTasks((all) => all.filter((task) => task.sourceId !== report.id));
      setToast('Removed from your To-Do planner');
    } else {
      setTasks((all) => [...all, { id: Date.now(), title: `Create content: ${report.title}`, done: false, sourceId: report.id, sourceUrl: report.url }]);
      setToast('Saved to your To-Do planner');
    }
    window.setTimeout(() => setToast(''), 2200);
  }
  function buildReel(report: LiveReport) {
    setSelectedLiveTopic(report);
    setFormat('Reel');
    setTab('studio');
    setAssistantOpen(false);
    setToast('Story-specific Reel ideas are ready');
    window.setTimeout(() => setToast(''), 2200);
  }
  async function loadLiveReports() {
    setLiveLoading(true);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/news.json?fresh=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data.reports) && data.reports.length) {
        setLiveReports(data.reports);
        setLiveError(false);
      } else {
        setLiveReports([]);
        setLiveError(true);
      }
      setLiveUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch {
      setLiveReports([]);
      setLiveError(true);
    } finally {
      setLiveLoading(false);
    }
  }

  function timeAgo(value: string) {
    const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000));
    if (minutes < 2) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }
  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks((all) => [...all, { id: Date.now(), title: newTask.trim(), done: false }]);
    setNewTask('');
    setToast('Task added to your focus list');
    window.setTimeout(() => setToast(''), 2200);
  }

  if (miniMode) return (
    <main className="mini-mode">
      <div className="mini-label">AMAN'S GOAT · {channelHandle}</div>
      <button className="mini-bot" onClick={() => { setMiniMode(false); setAssistantOpen(true); }} aria-label="Expand Aman's GOAT">
        <span className="bot-status" />AG
        <small>OPEN</small>
      </button>
      <button className="exit-mini" onClick={() => setMiniMode(false)}>Exit mini mode</button>
    </main>
  );

  return (
    <main className={`app-shell ${railCollapsed ? 'rail-collapsed' : ''}`}>
      <aside className="rail">
        <div className="rail-top"><button className="brand" onClick={() => setTab('today')} aria-label="Aman's GOAT home"><span className="brand-mark">AG</span><span>Aman's GOAT<small>{channelHandle}</small></span></button><button className="rail-toggle" onClick={() => setRailCollapsed((value) => !value)} aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{railCollapsed ? '›' : '‹'}</button></div>
        <nav aria-label="Main navigation">
          <button title="My Feed" className={`rail-button ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}><span className="nav-icon">▦</span><span>My Feed</span></button>
          <button title="To-Dos" className={`rail-button ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}><span className="nav-icon">✓</span><span>To-Dos</span></button>
          <button title="News Radar" className={`rail-button ${tab === 'research' ? 'active' : ''}`} onClick={() => setTab('research')}><span className="nav-icon nav-list-icon" aria-hidden="true"><i /><i /><i /></span><span>News Radar</span></button>
          <button title="Creator's Intel" className={`rail-button ${tab === 'watch' ? 'active' : ''}`} onClick={() => setTab('watch')}><span className="nav-icon">@</span><span>Creator's Intel</span></button>
          <button title="Content Studio" className={`rail-button ${tab === 'studio' ? 'active' : ''}`} onClick={() => setTab('studio')}><span className="nav-icon">✦</span><span>Content Studio</span></button>
        </nav>
        <button className="profile-button" aria-label="Profile"><span className="avatar">A</span><span>Aman<small>Creator account</small></span></button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">{dateLabel} · {channelHandle}</p><h1>{tab === 'today' ? greeting : tab === 'tasks' ? 'Your focus list.' : tab === 'research' ? 'Your research radar.' : tab === 'watch' ? 'Your creator intelligence.' : 'Your geopolitical studio.'}</h1></div>
          <div className="topbar-actions"><span className="next-brief"><i /> Next brief at 9:00 AM</span><a className="download-button" href="https://github.com/sakshiarora-ai/amans-goat/releases/latest/download/Amans-GOAT-0.2.0-arm64.dmg">Download Mac app</a><div className="theme-switcher" role="group" aria-label="Colour theme">{(['light', 'auto', 'dark'] as const).map((mode) => <button className={theme === mode ? 'active' : ''} onClick={() => setTheme(mode)} key={mode}>{mode === 'light' ? 'Day' : mode === 'dark' ? 'Night' : 'Auto'}</button>)}</div><button className="mini-toggle" onClick={() => setMiniMode(true)}>Mini mode</button><button className="icon-button" onClick={() => setAssistantOpen(true)} aria-label="Open assistant">◌</button></div>
        </header>

        {tab === 'today' && (
          <div className="dashboard-grid">
            <section className="main-column">
              <div className="morning-card">
                <div className="morning-copy"><span className="kicker">NEWS → INSTAGRAM</span><h2>Ten signals.<br />Endless content.</h2><p>Turn today’s geopolitics and Indian news into sharp Reels, save-worthy carousels, and audience-first captions.</p><button className="primary-button" onClick={() => setTab('studio')}>Create today’s post <span>↗</span></button></div>
                <div className="orbit-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="globe-dot dot-one" /><span className="globe-dot dot-two" /><strong>10</strong><small>TOPICS</small></div>
              </div>
              <div className="section-heading live-heading"><div><span className="live-dot" /><div><span className="section-number">LIVE · REFRESHES HOURLY</span><h3>Newest reports first</h3></div></div><button onClick={loadLiveReports}>{liveLoading ? 'Updating…' : 'Refresh now ↻'}</button></div>
              <div className="story-list">{liveReports.length ? liveReports.slice(0, 6).map((story, index) => {
                const related = liveReports.filter((report) => report.id !== story.id && isRelatedTopic(story, report));
                const creatorMatch = related.find((report) => report.signal === 'creator');
                const reachLeader = [...related, story].sort((a, b) => (b.reachScore || 0) - (a.reachScore || 0))[0];
                return <article className="story live-story" key={story.id}><span className="story-index">{String(index + 1).padStart(2, '0')}</span><a className="story-image" aria-label={`View source for ${story.title}`} href={story.url} target="_blank" rel="noreferrer">{story.imageUrl ? <img src={story.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span>{story.category.slice(0, 2).toUpperCase()}</span>}</a><div className="story-copy"><span className="story-tag">{story.category} · {timeAgo(story.publishedAt)}</span><h4>{story.title}</h4><p>{story.source} · Added to the hourly radar</p><div className="story-intel"><span>{related.length + 1} reports tracked</span>{creatorMatch && <a href={creatorMatch.url} target="_blank" rel="noreferrer">Creator match ↗</a>}<a href={reachLeader.url} target="_blank" rel="noreferrer">Reach signal {reachLeader.reachScore || 6}/10 ↗</a></div></div><div className="story-actions"><button className={`favorite-button ${isSaved(story) ? 'active' : ''}`} onClick={() => toggleSavedReport(story)} aria-label={isSaved(story) ? `Remove ${story.title} from planner` : `Save ${story.title} to planner`} title={isSaved(story) ? 'Saved to To-Dos' : 'Save to To-Dos'}>{isSaved(story) ? '♥' : '♡'}</button><button className="reel-button" onClick={() => buildReel(story)}>Build Reel</button><a className="story-open" aria-label={`Read ${story.title}`} href={story.url} target="_blank" rel="noreferrer">↗</a></div></article>;
              }) : <div className="live-feed-warning"><span>{liveLoading ? 'SCANNING LIVE SOURCES' : 'LIVE FEED UNAVAILABLE'}</span><h4>{liveLoading ? 'Gathering the newest reports…' : 'Old stories have been hidden.'}</h4><p>{liveLoading ? 'This normally takes a few seconds.' : "Aman's GOAT could not verify a fresh report, so it will not show yesterday’s fallback. Try Refresh now."}</p>{liveError && <button onClick={loadLiveReports}>Try live refresh ↻</button>}</div>}</div>
            </section>
            <aside className="side-column">
              <section className="reel-counter"><div><span>REELS CREATED</span><strong>{reelsCreated}</strong><small>Saved on this device</small></div><button onClick={() => setReelsCreated((count) => count + 1)}>+ Log a Reel</button><label>Set exact total<input type="number" min="0" value={reelsCreated} onChange={(event) => setReelsCreated(Math.max(0, Number(event.target.value) || 0))} /></label></section>
              <section className="focus-card"><div className="card-title"><span>YOUR FOCUS</span><button onClick={() => setTab('tasks')}>+  Add</button></div><div className="focus-progress"><strong>{complete}</strong><span>of {tasks.length} tasks<br />complete</span><em>{percent}%</em></div><div className="progress-track"><i style={{ width: `${percent}%` }} /></div>{tasks.slice(0, 3).map((task) => <label className={`task ${task.done ? 'done' : ''}`} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span>{task.title}</span></label>)}<button className="quiet-button" onClick={() => setTab('tasks')}>Open task planner →</button></section>
              <section className="idea-card"><span className="kicker">TODAY’S POST IDEA</span><h3>Why India’s middle-power moment matters now</h3><p>Best format: 35-second Reel with a curiosity hook and three proof points.</p><button onClick={() => setTab('studio')}>Build this Reel ↗</button></section>
            </aside>
          </div>
        )}

        {tab === 'tasks' && (
          <section className="planner-view">
            <div className="planner-intro"><span className="page-kicker">TODAY'S PLAN</span><h2>Make progress visible.</h2><p>Your tasks are saved on this device, so the list will still be here when you return.</p></div>
            <form className="add-task" onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a task for today…" aria-label="New task" /><button type="submit">Add task</button></form>
            <div className="planner-list">{tasks.map((task) => <div className={`planner-task ${task.done ? 'done' : ''}`} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} aria-label={`Mark ${task.title} complete`} /><div><strong>{task.title}</strong>{task.sourceUrl && <a className="task-source" href={task.sourceUrl} target="_blank" rel="noreferrer">Open saved news source ↗</a>}</div><button onClick={() => setTasks((all) => all.filter((item) => item.id !== task.id))} aria-label={`Delete ${task.title}`}>Remove</button></div>)}</div>
          </section>
        )}

        {tab === 'research' && (
          <section className="research-view">
            <div className="research-head"><span className="page-kicker">LIVE NEWS RADAR</span><h2>One story. One clear card.</h2><p>Fresh reports are ordered newest first. Every card combines its image, source, reach signal and creator angle without repeating the same story in multiple layouts.</p></div>
            <section className="hourly-feed">
              <header><div><span className="live-dot" /><div><strong>HOURLY NEWS RADAR</strong><small>{liveUpdatedAt ? `Last checked ${timeAgo(liveUpdatedAt)}` : 'Connecting to live sources…'}</small></div></div><button onClick={loadLiveReports}>{liveLoading ? 'Gathering reports…' : 'Check for newer reports'}</button></header>
              <div className="radar-filter">{filters.map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div>
              <div className="radar-card-list">{radarReports.filter((report) => report.signal !== 'video').slice(0, 20).map((report) => {
                const videoMatches = videoReports.filter((video) => isRelatedVideo(report, video)).sort((a, b) => (b.reachScore || 0) - (a.reachScore || 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
                return <article className="radar-news-card" key={report.id}>
                <div className="radar-image">{report.imageUrl ? <img src={report.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span>{report.category.slice(0, 2).toUpperCase()}</span>}</div>
                <div className="radar-copy"><div className="radar-meta"><span>{report.category}</span><em>{timeAgo(report.publishedAt)}</em><b>{report.reachScore || 7}/10 REACH</b></div><h3>{report.title}</h3><p>{report.whyItCanTravel || 'A timely report with a useful explanation opportunity for your audience.'}</p>{videoMatches.length > 0 ? <div className="video-refs"><span>VERIFIED SAME-TOPIC VIDEO REFERENCES</span><div>{videoMatches.map((video, videoIndex) => <a href={video.url} target="_blank" rel="noreferrer" key={video.id}><b>▶ {videoIndex + 1}</b><span>{video.title}</span><em>{video.source} · Google News indexed · {video.reachScore || 7}/10 signal</em></a>)}</div></div> : <p className="video-ref-note">No closely matched video reference is verified for this story yet.</p>}<footer><span><strong>{report.source}</strong><small>Source image and report reference</small></span><div className="radar-actions"><button className={`favorite-button ${isSaved(report) ? 'active' : ''}`} onClick={() => toggleSavedReport(report)} aria-label={isSaved(report) ? `Remove ${report.title} from planner` : `Save ${report.title} to planner`}>{isSaved(report) ? '♥ Saved' : '♡ Save'}</button><button className="reel-button" onClick={() => buildReel(report)}>Build Reel</button><a href={report.url} target="_blank" rel="noreferrer">Open report ↗</a></div></footer></div>
              </article>})}</div>
            </section>
          </section>
        )}

        {tab === 'watch' && (
          <section className="watch-view">
            <div className="watch-hero">
              <div className="watch-intro"><span className="page-kicker">CREATOR INTELLIGENCE</span><h2>See the wave early. Explain it better.</h2><p>Choose from 10 or more high-potential topics, follow what reference creators are covering, watch public X conversations, and prepare people before major Indian events happen.</p></div>
              <div className="watch-status"><span className="live-dot" /><strong>HOURLY MONITOR ACTIVE</strong><small>Meaningful posts only · duplicates suppressed</small></div>
            </div>
            <div className="intel-tabs" role="tablist" aria-label="Creator intelligence views">
              <button className={watchMode === 'mine' ? 'active' : ''} onClick={() => { setWatchMode('mine'); setOpportunityCount(10); }}><span>✦</span><b>My Opportunities</b><small>10+ topics ranked for reach</small></button>
              <button className={watchMode === 'creators' ? 'active' : ''} onClick={() => setWatchMode('creators')}><span>◎</span><b>Creator Feed</b><small>What reference creators cover</small></button>
              <button className={watchMode === 'events' ? 'active' : ''} onClick={() => setWatchMode('events')}><span>◷</span><b>India Event Radar</b><small>Give people an early heads-up</small></button>
              <button className={watchMode === 'x' ? 'active' : ''} onClick={() => setWatchMode('x')}><span>𝕏</span><b>X Pulse</b><small>Publicly indexed conversations</small></button>
            </div>

            <div className="intel-heading"><div><span className="section-number">{watchMode === 'mine' ? 'RANKED FOR @AMAN.ENLIGHTS' : watchMode === 'creators' ? 'REFERENCE CREATOR SIGNALS' : watchMode === 'events' ? 'UPCOMING INDIA MOMENTS' : 'PUBLIC X / TWITTER SIGNALS'}</span><h3>{watchMode === 'mine' ? `${Math.max(10, myOpportunities.length)} opportunities available` : watchMode === 'creators' ? 'What they are moving on now' : watchMode === 'events' ? 'Publish context before the crowd' : 'Verify before you amplify'}</h3></div><button onClick={loadLiveReports}>{liveLoading ? 'Scanning…' : 'Refresh intelligence ↻'}</button></div>

            {watchMode === 'creators' && creatorReports.length === 0 ? <div className="creator-feed-fallback"><div className="feed-note"><span className="live-dot" /><p><b>No newly indexed creator-linked report this hour.</b> The profiles remain monitored; public Instagram indexing can arrive later than the original post.</p></div><div className="creator-strip">{creatorWatchlist.map((creator) => <div key={creator.name}><span className={creator.status}>{creator.status === 'verified' ? 'LIVE' : 'NEEDS LINK'}</span><strong>{creator.name}</strong>{creator.url ? <a href={creator.url} target="_blank" rel="noreferrer">{creator.handle} ↗</a> : <small>{creator.handle}</small>}</div>)}</div></div> : <div className="opportunity-grid">{activeWatchReports.slice(0, watchMode === 'mine' ? opportunityCount : 20).map((report, index) => <article className="opportunity-card" key={report.id}>
              <header><span>{String(index + 1).padStart(2, '0')}</span><em>{report.category}</em><b>{report.reachScore || 7}/10 REACH</b></header>
              <h3>{report.title}</h3>
              <p>{report.whyItCanTravel || 'A timely signal with a clear explanation opportunity for an Indian audience.'}</p>
              <div className="opportunity-angle"><span>{report.signal === 'event' ? 'HEADS-UP ANGLE' : report.signal === 'x' ? 'VERIFY FIRST' : report.signal === 'creator' ? 'BEAT THEIR VERSION' : 'YOUR ANGLE'}</span>{report.signal === 'event' ? 'Explain what will happen, who it affects and the three outcomes to watch.' : report.signal === 'x' ? 'Separate the viral claim from the confirmed facts, then explain why the conversation matters.' : 'Start with the consequence, add the missing context, and close with what changes next.'}</div>
              <footer><div><small>{timeAgo(report.publishedAt)}</small><strong>{report.source}</strong></div><a href={report.url} target="_blank" rel="noreferrer">Read source ↗</a><button onClick={() => { setTasks((all) => [...all, { id: Date.now(), title: `Build content: ${report.title}`, done: false }]); setToast('Topic added to your content plan'); window.setTimeout(() => setToast(''), 2200); }}>Pick topic +</button></footer>
            </article>)}</div>}
            {watchMode === 'mine' && opportunityCount < myOpportunities.length && <button className="load-more" onClick={() => setOpportunityCount((count) => count + 10)}>Show 10 more opportunities ↓</button>}

            <section className="editorial-standard"><div><span className="section-number">THE {channelHandle} ADVANTAGE</span><h3>Fast enough for the feed.<br />Deep enough to trust.</h3></div><ol><li><b>Discover</b><span>Creator posts, live news, X conversations and upcoming events.</span></li><li><b>Verify</b><span>Check the claim against primary and independent reporting.</span></li><li><b>Context</b><span>Explain the mechanism, history and India consequence.</span></li><li><b>Differentiate</b><span>Add the counter-case and the detail others leave out.</span></li><li><b>Publish</b><span>Choose a topic and add it directly to your content plan.</span></li></ol></section>
          </section>
        )}

        {tab === 'studio' && (
          <section className="studio-view">
            <div className="studio-head"><div><span className="section-number">05</span><h2>Turn one signal into<br />a post people save.</h2></div><div className="creator-score"><strong>82</strong><span>CONTENT<br />POTENTIAL</span></div></div>
            <section className="geo-radar">
              <div className="world-stage" aria-label="Interactive geopolitical signal map">
                <div className="world-grid" aria-hidden="true" />
                <div className="world-orbit orbit-a" aria-hidden="true" /><div className="world-orbit orbit-b" aria-hidden="true" />
                <div className="radar-title"><span>LIVE WORLD SIGNALS</span><strong>Geopolitics,<br />made clear.</strong><small>Tap a region to explore the story potential</small></div>
                {worldSignals.map((signal, index) => <button className={`map-point ${signal.position} ${activeRegion === index ? 'active' : ''}`} onClick={() => setActiveRegion(index)} key={signal.region}><i /><span>{signal.region}</span></button>)}
              </div>
              <aside className="signal-detail"><div><span>ACTIVE SIGNAL · {worldSignals[activeRegion].level}</span><em>0{activeRegion + 1}</em></div><h3>{worldSignals[activeRegion].title}</h3><p>{worldSignals[activeRegion].note}</p><button onClick={() => { setSelectedTopic(Math.min(activeRegion, 3)); setFormat('Reel'); }}>Build a Reel from this →</button></aside>
            </section>
            <div className="studio-layout">
              <aside className="topic-picker"><div className="studio-label">CHOOSE TODAY’S SIGNAL</div>{selectedLiveTopic && <button className="active studio-live-topic" onClick={() => setFormat('Reel')}><span>LIVE</span><strong>{selectedLiveTopic.title}</strong><small>{selectedLiveTopic.category} · {selectedLiveTopic.source}</small></button>}{topics.slice(0, 6).map((topic, index) => <button className={!selectedLiveTopic && selectedTopic === index ? 'active' : ''} onClick={() => { setSelectedLiveTopic(null); setSelectedTopic(index); }} key={topic.title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{topic.title}</strong><small>{topic.category}</small></button>)}</aside>
              <section className="creator-canvas">
                <div className="format-tabs">{formats.map((item) => <button className={format === item ? 'active' : ''} onClick={() => setFormat(item)} key={item}>{item}</button>)}</div>
                <div className="post-preview">
                  <div className="post-top"><span className="ig-avatar">A</span><div><strong>{channelHandle}</strong><small>Geopolitics, made clear</small></div><em>{format.toUpperCase()}</em></div>
                  <div className="hook-card"><span>HOOK · {selectedLiveTopic ? 'BUILT FROM LIVE NEWS' : 'EDITORIAL IDEA'}</span><h3>{activeStudioCopy.hook}</h3></div>
                  <div className="script-block"><span>{format === 'Carousel' ? 'SLIDE PLAN' : format === 'Reel' ? 'SCRIPT BEATS' : 'DRAFT'}</span>{activeStudioCopy.body.map((line, index) => <p key={`${line}-${index}`}><b>{String(index + 1).padStart(2, '0')}</b>{line}</p>)}</div>
                  <div className="cta-block"><span>CALL TO ACTION</span><p>{activeStudioCopy.cta}</p></div>
                </div>
              </section>
              <aside className="creator-tools"><div className="studio-label">CREATOR CHECK</div><div className="check-row"><span>Strong hook</span><b>Excellent</b></div><div className="check-row"><span>Clarity</span><b>High</b></div><div className="check-row"><span>Save potential</span><b>8.2 / 10</b></div><div className="hashtag-box"><span>HASHTAG SET</span><p>#IndianPolitics #Geopolitics #IndiaExplained #CurrentAffairs #NewsReel</p></div><button className="copy-button" onClick={() => { navigator.clipboard?.writeText(`${activeStudioCopy.hook}\n\n${activeStudioCopy.body.join('\n')}\n\n${activeStudioCopy.cta}`); setToast(`${format} draft copied`); window.setTimeout(() => setToast(''), 2200); }}>Copy full draft</button><button className="save-button" onClick={() => { setTasks((all) => [...all, { id: Date.now(), title: `Publish ${format}: ${activeStudioTitle}`, done: false, sourceId: selectedLiveTopic?.id, sourceUrl: selectedLiveTopic?.url }]); setToast('Added to your content plan'); window.setTimeout(() => setToast(''), 2200); }}>Add to content plan</button><small>Built from: {activeStudioSource}</small>{selectedLiveTopic && <a className="studio-source-link" href={selectedLiveTopic.url} target="_blank" rel="noreferrer">Review original report ↗</a>}</aside>
            </div>
          </section>
        )}
      </section>

      <button className="bot-bubble" onClick={() => setAssistantOpen(!assistantOpen)} aria-label="Open Aman's GOAT assistant"><span className="bot-status" />AG</button>
      {assistantOpen && <aside className="assistant-panel" aria-label="Aman's GOAT assistant"><div className="assistant-head"><div><span className="assistant-avatar">AG</span><div><strong>Aman's GOAT</strong><small>{channelHandle} · CREATOR INTELLIGENCE BOT</small></div></div><button onClick={() => setAssistantOpen(false)} aria-label="Close assistant">×</button></div><div className="assistant-message"><span>TODAY’S CREATOR BRIEF</span><p>Your strongest opportunity is a Reel on India’s middle-power moment.</p></div><p className="assistant-prompt">What would you like to make?</p><button onClick={() => { setFormat('Reel'); setTab('studio'); setAssistantOpen(false); }}>Draft a 35-sec Reel <b>↗</b></button><button onClick={() => { setFormat('Carousel'); setTab('studio'); setAssistantOpen(false); }}>Build a 6-slide carousel <b>→</b></button><button onClick={() => { setFormat('Caption'); setTab('studio'); setAssistantOpen(false); }}>Write an engaging caption <b>→</b></button><button onClick={() => { setAssistantOpen(false); setMiniMode(true); }}>Keep only bot icon <b>○</b></button><div className="assistant-note"><i /> {channelHandle} creator brief · 9:00 AM</div></aside>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
