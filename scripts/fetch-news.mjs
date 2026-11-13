import { mkdir, writeFile } from 'node:fs/promises';

const feeds = [
  ['world geopolitics when:24h', 'Geopolitics', 'news'],
  ['India foreign policy China US Russia when:24h', 'Geopolitics', 'news'],
  ['Indian politics parliament elections policy when:24h', 'Indian politics', 'news'],
  ['India national news economy technology climate when:24h', 'National', 'news'],
  ['India trending on X Twitter politics geopolitics when:24h', 'X Pulse', 'x'],
  ['India upcoming summit election court hearing launch protest event when:7d', 'Event Radar', 'event'],
  ['("Vivek Sehrawat" OR "Amit Kilhor" OR "Prafful Garg" OR "Nirbhay Singh" OR "Aditya Said What" OR "SimplifieD") when:7d', 'Creator Watch', 'creator'],
  ['site:youtube.com/watch (India politics OR geopolitics OR national news) when:7d', 'YouTube video', 'video'],
  ['site:youtube.com/shorts (India politics OR geopolitics OR national news) when:7d', 'YouTube Short', 'video'],
  ['site:instagram.com/reel (India politics OR geopolitics OR national news) when:7d', 'Instagram Reel', 'video'],
].map(([query, category, signal]) => ({ query, category, signal }));

const highReachTerms = ['india', 'modi', 'election', 'supreme court', 'china', 'pakistan', 'trump', 'war', 'ai', 'economy', 'army', 'parliament', 'protest', 'ban', 'launch', 'summit'];
const referenceStopWords = new Set(['about', 'after', 'against', 'breaking', 'current', 'explained', 'from', 'global', 'government', 'india', 'indian', 'into', 'latest', 'leader', 'national', 'news', 'over', 'politics', 'president', 'report', 'reports', 'that', 'their', 'this', 'today', 'video', 'viral', 'with']);

function referenceWords(title = '') {
  return new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length > 4 && !referenceStopWords.has(word)));
}

function stronglyMatches(title, referenceTitle) {
  const titleWords = referenceWords(title);
  const referenceSet = referenceWords(referenceTitle);
  const shared = [...titleWords].filter((word) => referenceSet.has(word));
  return shared.length >= 2;
}

function reachScore(title, signal, timestamp) {
  const lower = title.toLowerCase();
  const points = highReachTerms.filter((term) => lower.includes(term)).length;
  const hoursOld = Math.max(0, (Date.now() - timestamp) / 3_600_000);
  return Math.min(10, 6 + points + (hoursOld < 3 ? 2 : hoursOld < 12 ? 1 : 0) + (signal === 'event' || signal === 'x' ? 1 : 0));
}

function decodeXML(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function field(item, name) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXML(match[1]) : '';
}

function reason(signal, score) {
  if (signal === 'event') return 'Early-mover opportunity: publish the context before the event peaks.';
  if (signal === 'x') return 'Public conversation is accelerating; verify the claim before joining it.';
  if (signal === 'creator') return 'A reference creator or their topic is entering the public news cycle.';
  return score >= 9 ? 'High-salience topic with strong conflict, consequence and share potential.' : score >= 8 ? 'Timely India relevance with a clear explainer opportunity.' : 'Useful developing signal; add context before it becomes crowded.';
}

function parseFeed(xml, feed) {
  return (xml.match(/<item>[\s\S]*?<\/item>/gi) ?? []).map((item) => {
    const source = field(item, 'source') || 'News report';
    const rawTitle = field(item, 'title');
    const suffix = ` - ${source}`;
    const title = rawTitle.endsWith(suffix) ? rawTitle.slice(0, -suffix.length) : rawTitle;
    const publishedAt = field(item, 'pubDate');
    const timestamp = Date.parse(publishedAt) || 0;
    const score = reachScore(title, feed.signal, timestamp);
    return { id: `${publishedAt}-${title}`, title, source, url: field(item, 'link'), imageUrl: '', category: feed.category, signal: feed.signal, publishedAt, timestamp, reachScore: score, whyItCanTravel: reason(feed.signal, score), relatedTo: feed.relatedTo };
  }).filter((report) => !feed.referenceTitle || stronglyMatches(report.title, feed.referenceTitle));
}

function parseTrends(xml) {
  return (xml.match(/<item>[\s\S]*?<\/item>/gi) ?? []).flatMap((item) => {
    const title = field(item, 'ht:news_item_title') || field(item, 'title');
    const url = field(item, 'ht:news_item_url') || field(item, 'link');
    const source = field(item, 'ht:news_item_source') || field(item, 'ht:picture_source') || 'Google Trends India';
    const publishedAt = field(item, 'pubDate');
    const timestamp = Date.parse(publishedAt) || Date.now();
    if (!title || !url) return [];
    return [{ id: `trend-${publishedAt}-${title}`, title, source: `Google Trends · ${source}`, url, imageUrl: field(item, 'ht:picture'), category: 'Trending in India', signal: 'news', publishedAt, timestamp, reachScore: Math.min(10, reachScore(title, 'news', timestamp) + 1), whyItCanTravel: 'Search interest is accelerating in India. Verify the linked report before publishing.' }];
  });
}

async function fetchFeed(feed) {
  try {
    const params = new URLSearchParams({ q: feed.query, hl: 'en-IN', gl: 'IN', ceid: 'IN:en' });
    const response = await fetch(`https://news.google.com/rss/search?${params}`, { headers: { 'user-agent': 'AmansGOAT/2.0 (+@aman.enlights)' } });
    return response.ok ? parseFeed(await response.text(), feed) : [];
  } catch { return []; }
}

const batches = [];
try {
  const trends = await fetch('https://trends.google.com/trending/rss?geo=IN', { headers: { 'user-agent': 'Mozilla/5.0 AmansGOAT/@aman.enlights' } });
  if (trends.ok) batches.push(parseTrends(await trends.text()));
} catch { /* Google News remains an independent fallback. */ }

for (let index = 0; index < feeds.length; index += 4) {
  batches.push(...await Promise.all(feeds.slice(index, index + 4).map(fetchFeed)));
}

const earlyNews = batches.flat().filter((report) => report.signal === 'news').sort((a, b) => b.timestamp - a.timestamp);
const referenceFeeds = earlyNews.slice(0, 10).map((report) => {
  const terms = [...referenceWords(report.title)].slice(0, 5);
  return {
    query: `${terms.join(' ')} (site:youtube.com/watch OR site:youtube.com/shorts OR site:instagram.com/reel) when:14d`,
    category: 'Video reference',
    signal: 'video',
    relatedTo: report.id,
    referenceTitle: report.title,
  };
}).filter((feed) => referenceWords(feed.referenceTitle).size >= 2);
for (let index = 0; index < referenceFeeds.length; index += 4) {
  batches.push(...await Promise.all(referenceFeeds.slice(index, index + 4).map(fetchFeed)));
}

const seen = new Set();
const deduplicated = batches.flat().sort((a, b) => b.timestamp - a.timestamp).filter((report) => {
  const key = report.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!key || seen.has(key)) return false;
  seen.add(key);
  return true;
});
const reports = [...deduplicated.filter((report) => report.signal !== 'video').slice(0, 40), ...deduplicated.filter((report) => report.signal === 'video').slice(0, 30)].map(({ timestamp: _timestamp, ...report }) => report);

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/data/news.json', import.meta.url), `${JSON.stringify({ reports, updatedAt: new Date().toISOString(), live: reports.length > 0 }, null, 2)}\n`);
console.log(`Updated ${reports.length} public intelligence signals.`);
