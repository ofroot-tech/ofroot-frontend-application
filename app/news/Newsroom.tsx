'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Bookmark, Check, ChevronRight, CircleHelp, GitBranch, Radio, RefreshCw, Search, X } from 'lucide-react';
import type { NewsArticle, NewsCategory, NewsSnapshot } from '@/app/lib/news/types';
import HeroShimmer from '@/components/growth/HeroShimmer';
import MotionText from '@/components/growth/MotionText';
import styles from './news.module.css';
import SignalHeader from './SignalHeader';
import { formatPublished, topics } from './presentation';
const kindLabels: Record<NewsArticle['kind'], string> = { reporting: 'Reporting', research: 'Research', release: 'Release', policy: 'Policy update', advisory: 'Security advisory' };
const savedKey = 'ofroot-signal-saved-v1';

function SaveButton({ article, saved, onSave }: { article: NewsArticle; saved: boolean; onSave: (id: string) => void }) {
  return <button type="button" className={`${styles.save} ${saved ? styles.isSaved : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${article.title}`} aria-pressed={saved} onClick={() => onSave(article.id)}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>;
}

export default function Newsroom({ initialSnapshot }: { initialSnapshot: NewsSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [pending, setPending] = useState<NewsSnapshot | null>(null);
  const [category, setCategory] = useState<NewsCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [sort, setSort] = useState('newest');
  const [checking, setChecking] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(savedKey) || '[]');
      if (Array.isArray(value)) setSaved(value.filter((id): id is string => typeof id === 'string').slice(0, 500));
    } catch { /* Saved articles are optional when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    let active = true;
    let busy = false;
    const controller = new AbortController();
    async function poll() {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const response = await fetch('/api/news', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('News refresh unavailable');
        const next = await response.json() as NewsSnapshot;
        if (!active || !Array.isArray(next.articles) || !Array.isArray(next.sources) || !Array.isArray(next.sourceHealth)) return;
        setConnectionError(false);
        const existing = snapshotRef.current;
        const hasNew = next.articles.some(article => !existing.articles.some(old => old.id === article.id));
        // Corrections and removals apply immediately. Inserting new headlines waits
        // for the reader, so the stream does not jump while they are reading.
        if (hasNew) {
          setPending(next);
          const freshById = new Map(next.articles.map(article => [article.id, article]));
          setSnapshot({ ...next, articles: existing.articles.flatMap(article => { const fresh = freshById.get(article.id); return fresh ? [fresh] : []; }) });
        } else { setSnapshot(next); setPending(null); }
      } catch { if (active) setConnectionError(true); }
      finally { busy = false; }
    }
    const timer = window.setInterval(poll, 60_000);
    const onVisible = () => { if (!document.hidden) void poll(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const sourceMap = new Map(snapshot.sources.map(item => [item.id, item]));
  const counts = Object.fromEntries(topics.map(topic => [topic.id, snapshot.articles.filter(article => article.category === topic.id).length]));
  const filtered = snapshot.articles.filter(article => (category === 'all' || article.category === category) && (source === 'all' || article.sourceId === source) && (!savedOnly || saved.includes(article.id)) && `${article.title} ${sourceMap.get(article.sourceId)?.name || ''} ${topics.find(topic => topic.id === article.category)?.label || ''}`.toLowerCase().includes(query.toLowerCase().trim()));
  if (sort === 'oldest') filtered.sort((a, b) => (a.publishedAt ? Date.parse(a.publishedAt) : Infinity) - (b.publishedAt ? Date.parse(b.publishedAt) : Infinity));
  const lead = snapshot.articles[0];
  const shortList = snapshot.articles.slice(1, 4);
  const healthyCount = snapshot.sourceHealth.filter(item => item.status === 'ok').length;
  const activeCount = snapshot.sources.filter(item => item.enabled).length;
  const currentSnapshot = pending || snapshot;
  const isStale = connectionError || currentSnapshot.status === 'stale' || currentSnapshot.status === 'unavailable' || !currentSnapshot.lastSuccessfulAt || Date.now() - Date.parse(currentSnapshot.lastSuccessfulAt) > 30 * 60_000;
  const editionDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(new Date(snapshot.checkedAt));
  const newCount = pending ? pending.articles.filter(item => !snapshot.articles.some(old => old.id === item.id)).length : 0;

  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id].slice(-500);
    setSaved(next);
    try { localStorage.setItem(savedKey, JSON.stringify(next)); setSaveMessage(next.includes(id) ? 'Saved on this device.' : 'Removed from saved.'); }
    catch { setSaveMessage('Saved for this visit. Browser storage is unavailable.'); }
  }
  function chooseCategory(next: NewsCategory | 'all') { setCategory(next); setVisibleCount(15); }
  async function checkNow() {
    setChecking(true);
    try {
      const response = await fetch('/api/news', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unavailable');
      const next = await response.json() as NewsSnapshot;
      if (!Array.isArray(next.articles) || !Array.isArray(next.sources) || !Array.isArray(next.sourceHealth)) throw new Error('Invalid response');
      setSnapshot(next); setPending(null); setConnectionError(false);
    } catch { setConnectionError(true); }
    finally { setChecking(false); }
  }

  // The publication uses the public site's hero and motion primitives. Live
  // headlines remain static so a background refresh never animates the reader's place.
  return <main id="main-content" className={styles.news}>
    <div className={styles.container}><SignalHeader /></div>
    <HeroShimmer headingId="news-title" className={styles.hero}>
      <div className={styles.heroGrid} aria-hidden="true"><span /><span /><span /></div>
      <div className={`${styles.container} ${styles.intro}`}>
        <div><p className={styles.eyebrow}><span /> THE OFROOT TECHNOLOGY BRIEF</p><h1 id="news-title"><MotionText trigger="load">Stay ahead.<br />Read the source.</MotionText></h1><p className={styles.introCopy}>AI, integrations, healthcare startups, policy, and cybersecurity. The latest from approved sources, with a direct link to every original.</p><div className={styles.heroActions}><a href="#stream-title" className={styles.primary}>Explore the latest <ArrowDown size={18} aria-hidden="true" /></a><Link href="/news/methodology">How the index works <ArrowUpRight size={17} aria-hidden="true" /></Link></div></div>
        <div className={styles.introAside}><span className={styles.eyebrow}>DISCOVER HERE. GO DEEPER THERE.</span><p>One connected view.<br />Credit at every step.</p><dl><div><dt>Technology beats</dt><dd>05</dd></div><div><dt>Available feeds</dt><dd>{healthyCount}<span> / {activeCount}</span></dd></div><div><dt>References in the index</dt><dd>{snapshot.articles.length}</dd></div></dl><Link href="/news/sources">Explore our sources <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </HeroShimmer>
    <div className={styles.container}>
      <div className={styles.edition}><span><span>{editionDate}</span><span className={styles.editionDivider} aria-hidden="true">/</span><span>SOURCE-LINKED NEWS</span></span><span className={styles.freshness}><i className={isStale ? styles.amberDot : styles.greenDot} />{isStale ? 'Source checks delayed' : currentSnapshot.status === 'partial' ? 'Some sources unavailable' : 'Connected to the sources'}<button onClick={checkNow} disabled={checking} aria-label="Check news index for updates"><RefreshCw size={15} className={checking ? styles.spinning : ''} /></button></span></div>

      <nav className={styles.topicGrid} aria-label="News topics">{topics.map((topic, index) => <button type="button" key={topic.id} onClick={() => chooseCategory(category === topic.id ? 'all' : topic.id)} aria-pressed={category === topic.id} className={category === topic.id ? styles.activeTopic : ''}><span className={styles.topicTop}><topic.icon size={21} strokeWidth={1.5} /><small>0{index + 1}</small></span><strong>{topic.label}</strong><span>{topic.description}</span></button>)}</nav>

      <section className={styles.highlights} aria-label="Latest highlights">
        <article className={styles.lead}>
          <div className={styles.leadTop}><span><Radio size={14} /> THE LATEST SIGNAL</span><span>{lead ? topics.find(topic => topic.id === lead.category)?.short : 'SOURCE-LINKED NEWS'}</span></div>
          {lead ? <><h2><a href={lead.url} target="_blank" rel="noopener noreferrer">{lead.title}</a></h2><div className={styles.leadBottom}><div><span>{sourceMap.get(lead.sourceId)?.name}</span>{lead.author && <span className={styles.author}>By {lead.author}</span>}<small>{formatPublished(lead.publishedAt)} <span>· {kindLabels[lead.kind]}</span></small></div><a href={lead.url} target="_blank" rel="noopener noreferrer" className={styles.leadArrow} aria-label={`Read ${lead.title} at the source`}><ArrowUpRight size={25} /></a></div></> : <><h2>A clearer view starts<br />with the original source.</h2><p>We’re checking the approved feeds. When a source is unavailable, we say so.</p><Link href="/news/sources" className={styles.emptyLeadLink}>View source status <ArrowRight size={17} /></Link></>}
          <div className={styles.leadDecoration} aria-hidden="true" />
        </article>
        <div className={styles.shortList}><div className={styles.sectionHeading}><h2>The short list</h2><span>WORTH YOUR ATTENTION</span></div>{shortList.length ? shortList.map((article, index) => <article key={article.id} className={styles.shortItem}><span className={styles.shortNumber}>0{index + 1}</span><div><span className={styles.miniCategory}>{topics.find(topic => topic.id === article.category)?.short}</span><h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3><p>{sourceMap.get(article.sourceId)?.name}{article.author && <span> · By {article.author}</span>} <span>· {formatPublished(article.publishedAt)}</span></p></div><ArrowUpRight size={17} aria-hidden="true" /></article>) : <div className={styles.emptyShort}><GitBranch size={28} strokeWidth={1.3} /><h3>Connected by curiosity.</h3><p>Research, product releases, policy, and security updates—all with a path back to the original.</p></div>}</div>
      </section>

      <div className={styles.streamLayout}>
        <section className={styles.stream} aria-labelledby="stream-title">
          <div className={styles.streamTitle}><div><p className={styles.eyebrow}>FOLLOW WHAT’S CHANGING</p><h2 id="stream-title"><MotionText>The latest.</MotionText></h2></div><span role="status" aria-live="polite"><ArrowDown size={14} /> {filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></div>
          <div className={styles.streamTabs}><div><button type="button" onClick={() => { setSavedOnly(false); setVisibleCount(15); }} aria-pressed={!savedOnly} className={!savedOnly ? styles.activeTab : ''}>All updates</button><button type="button" onClick={() => { setSavedOnly(true); setVisibleCount(15); }} aria-pressed={savedOnly} className={savedOnly ? styles.activeTab : ''}><Bookmark size={14} /> Saved <small>{saved.length}</small></button></div><select aria-label="Sort articles" value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
          <div className={styles.searchRow}><label><Search size={18} aria-hidden="true" /><input aria-label="Search news" type="search" placeholder="Search headlines, topics, or sources" value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(15); }} /></label><select aria-label="Filter by source" value={source} onChange={event => { setSource(event.target.value); setVisibleCount(15); }}><option value="all">All sources</option>{snapshot.sources.filter(item => item.enabled).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          {category !== 'all' && <div className={styles.filterInfo}><span>Showing {topics.find(topic => topic.id === category)?.label}</span><button type="button" onClick={() => chooseCategory('all')}>Clear topic <X size={13} /></button></div>}
          {(pending || connectionError) && <div className={styles.updateNotice} role="status">{connectionError ? <span>Connection delayed. The last available index is still readable.</span> : <><span>{newCount ? `${newCount} new ${newCount === 1 ? 'item' : 'items'} available` : 'The index has been checked again.'}</span><button onClick={() => { if (pending) setSnapshot(pending); setPending(null); }}>Update view <RefreshCw size={13} /></button></>}</div>}
          <div className={styles.articleList}>{filtered.slice(0, visibleCount).map(article => <article className={styles.article} key={article.id}><div className={styles.articleMeta}><span className={styles.categoryTag}>{topics.find(topic => topic.id === article.category)?.short}</span><span>{kindLabels[article.kind]}</span><SaveButton article={article} saved={saved.includes(article.id)} onSave={toggleSave} /></div><h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3><div className={styles.articleBottom}><span><strong>{sourceMap.get(article.sourceId)?.name}</strong><span> · </span><time dateTime={article.publishedAt || undefined}>{formatPublished(article.publishedAt)}</time>{article.author && <span className={styles.author}>By {article.author}</span>}</span><a href={article.url} target="_blank" rel="noopener noreferrer">Read at source <ArrowUpRight size={15} /></a></div></article>)}</div>
          {!filtered.length && <div className={styles.emptyState}><Search size={30} strokeWidth={1.2} /><h3>{savedOnly ? 'Your reading list starts here.' : category !== 'all' ? 'This beat is waiting for its next signal.' : query || source !== 'all' ? 'No signals match this search.' : 'The sources are quiet for now.'}</h3><p>{savedOnly ? 'Save a headline to revisit it on this device. Saved items appear while they remain in the current index.' : category === 'healthcare' ? 'Healthcare agency updates and approved startup reporting will appear here as the sources publish them.' : category !== 'all' ? 'Only items from approved, available sources appear here. We keep coverage gaps visible.' : 'Try another topic or check source status. We never fill a gap with invented news.'}</p><button type="button" onClick={() => { setQuery(''); setSource('all'); chooseCategory('all'); setSavedOnly(false); }}>View all updates <ArrowRight size={15} /></button></div>}
          {filtered.length > visibleCount && <button type="button" className={styles.loadMore} onClick={() => setVisibleCount(count => count + 15)}>More signals <ArrowDown size={16} /><span>{filtered.length - visibleCount} remaining</span></button>}
          <p className={styles.listFootnote}><Check size={13} /> Original headlines. Visible sources. Always a link back.</p>
          <p role="status" className={styles.srOnly}>{saveMessage}</p>
        </section>

        <aside className={styles.rail} aria-label="Newsroom information">
          <div className={styles.radar}><span className={styles.railEyebrow}><span /> ON THE RADAR</span><h2>Follow the<br />bigger picture.</h2><p>Five connected worlds.<br />Every perspective matters.</p>{topics.map(topic => <button key={topic.id} onClick={() => chooseCategory(topic.id)} aria-pressed={category === topic.id}><topic.icon size={16} /><span>{topic.label}</span><small>{counts[topic.id]}</small><ChevronRight size={14} /></button>)}</div>
          <div className={styles.sourcePanel}><span className={styles.railEyebrow}>FROM THE ORIGINALS</span><h2>Visible sources.<br />A direct path back.</h2><p>We bring the discovery.<br />The publishers bring the story.</p><div className={styles.sourceBadges}>{snapshot.sources.filter(item => item.enabled).slice(0, 4).map(item => <span key={item.id}>{item.name}</span>)}</div><Link href="/news/sources">Meet our sources <ArrowUpRight size={15} /></Link><span className={styles.sourceStatus}><i className={healthyCount ? styles.greenDot : styles.amberDot} />{healthyCount} of {activeCount} feeds available at last check</span></div>
          <div className={styles.methodPanel}><CircleHelp size={22} strokeWidth={1.3} /><h2>Built to inform.<br />Designed to give credit.</h2><p>No copied articles. No borrowed images. Just permitted headlines and a direct path to the original.</p><Link href="/news/methodology">Our approach <ArrowRight size={15} /></Link></div>
        </aside>
      </div>

      <section className={styles.closing}><div><span className={styles.eyebrow}>CONTEXT STARTS WITH THE ORIGINAL.</span><h2><MotionText>The future is connected.<br />Your news should be, too.</MotionText></h2></div><Link href="/news/sources" className={styles.primary}>Explore the source network <ArrowUpRight size={19} /></Link></section>
      <div className={styles.newsFooter}><span><AudioLines size={16} /> SIGNAL BY OFROOT <span>· A considered view of technology.</span></span><div><Link href="/news/methodology">Editorial approach</Link><a href="mailto:communications@ofroot.technology?subject=Signal%20source%20request">Suggest a source <ArrowUpRight size={12} /></a></div></div>
    </div>
  </main>;
}
