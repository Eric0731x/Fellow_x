// ════════════ 业务卡片：活动卡（3 种视觉变体）+ 福利卡 ════════════

/* 活动卡 — cardStyle: 'hairline'(描边) | 'cover'(封面) | 'status'(状态边框) */
function ActivityCard({ a, t, dark, onClick, delay = 0 }) {
  const style = (t && t.cardStyle) || 'hairline';
  const meta = FX_DATA.STATE_META[a.state] || {};
  const pct = a.max ? Math.round((a.registered / a.max) * 100) : 0;
  const toneColor = meta.tone ? `var(--${meta.tone})` : 'var(--ink-3)';

  const Stat = () => (
    <div className="row between acenter" style={{ marginTop: 14 }}>
      <div className="row acenter gap6">
        <I.users size={14} style={{ color: dark ? 'rgba(250,250,249,.5)' : 'var(--ink-3)' }} />
        <span className="mono" style={{ fontSize: 12.5, color: dark ? 'rgba(250,250,249,.8)' : 'var(--ink-2)' }}>
          {a.registered}<span style={{ opacity: .5 }}>/{a.max}</span>
        </span>
      </div>
      <div className="row acenter gap6">
        <I.calendar size={13} style={{ color: dark ? 'rgba(250,250,249,.5)' : 'var(--ink-3)' }} />
        <span className="mono" style={{ fontSize: 12, color: dark ? 'rgba(250,250,249,.6)' : 'var(--ink-3)' }}>{a.start}</span>
      </div>
    </div>
  );

  // ── 变体 C：状态边框编码 ──
  if (style === 'status') {
    return (
      <div className="card hover fade-up" onClick={onClick} style={{
        padding: 20, animationDelay: `${delay}ms`, position: 'relative', overflow: 'hidden',
        borderLeft: `3px solid ${toneColor}`,
        ...(dark ? { background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', borderLeftColor: toneColor, color: 'var(--on-dark)' } : {}),
      }}>
        <div className="row between acenter">
          <Chip tone="">{a.category}</Chip>
          <StatusBadge state={a.state} />
        </div>
        <h3 className="t-h3" style={{ margin: '14px 0 6px', color: dark ? 'var(--on-dark)' : 'var(--ink)' }}>{a.title}</h3>
        <p className="t-sub" style={{ margin: 0, color: dark ? 'rgba(250,250,249,.55)' : 'var(--ink-2)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.desc}</p>
        <Stat />
        {a.state === 'REGISTRATION_OPEN' && <div style={{ marginTop: 12 }}><Bar pct={pct} variant="accent" /></div>}
      </div>
    );
  }

  // ── 变体 B：封面图 ──
  if (style === 'cover') {
    return (
      <div className="card hover fade-up" onClick={onClick} style={{
        padding: 0, overflow: 'hidden', animationDelay: `${delay}ms`,
        ...(dark ? { background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: 'var(--on-dark)' } : {}),
      }}>
        <div style={{ height: 116, background: a.cover, position: 'relative', display: 'flex',
          alignItems: 'flex-end', padding: 14 }}>
          <div style={{ position: 'absolute', inset: 0, background:
            'radial-gradient(120% 120% at 80% 0%, rgba(255,255,255,.16), transparent 50%)' }} />
          <div style={{ position: 'absolute', top: 12, right: 12 }}><StatusBadge state={a.state} /></div>
          {a.hot && <span style={{ position: 'absolute', top: 12, left: 12 }} className="chip-tag accent"><I.fire size={11} />热门</span>}
          <span className="mono" style={{ color: '#fff', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', opacity: .9, position: 'relative' }}>{a.category}</span>
        </div>
        <div style={{ padding: 18 }}>
          <h3 className="t-h3" style={{ margin: '0 0 6px', color: dark ? 'var(--on-dark)' : 'var(--ink)' }}>{a.title}</h3>
          <p className="t-sub" style={{ margin: 0, color: dark ? 'rgba(250,250,249,.55)' : 'var(--ink-2)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.desc}</p>
          <Stat />
        </div>
      </div>
    );
  }

  // ── 变体 A：hairline 描边（默认）──
  return (
    <div className="card hover fade-up" onClick={onClick} style={{
      padding: 20, animationDelay: `${delay}ms`,
      ...(dark ? { background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: 'var(--on-dark)' } : {}),
    }}>
      <div className="row between acenter">
        <div className="row gap8 acenter">
          <Chip tone="">{a.category}</Chip>
          {a.hot && <Chip tone="accent" dot>热门</Chip>}
        </div>
        <StatusBadge state={a.state} />
      </div>
      <h3 className="t-h3" style={{ margin: '14px 0 6px', color: dark ? 'var(--on-dark)' : 'var(--ink)' }}>{a.title}</h3>
      <p className="t-sub" style={{ margin: 0, color: dark ? 'rgba(250,250,249,.55)' : 'var(--ink-2)',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.desc}</p>
      <div className="row gap14 acenter" style={{ marginTop: 14 }}>
        <div className="row acenter gap6">
          <I.pin size={13} style={{ color: dark ? 'rgba(250,250,249,.5)' : 'var(--ink-3)' }} />
          <span className="t-cap" style={{ color: dark ? 'rgba(250,250,249,.6)' : 'var(--ink-3)' }}>{a.location}</span>
        </div>
      </div>
      <div className="hr" style={{ margin: '14px 0', background: dark ? 'rgba(255,255,255,.08)' : 'var(--hairline)' }} />
      <Stat />
    </div>
  );
}

/* 福利卡 */
function WelfareCard({ w, onExchange, balance }) {
  const out = w.stock === 0;
  const afford = balance >= w.cost;
  return (
    <div className="card fade-up" style={{ padding: 18, opacity: out ? .7 : 1 }}>
      <div className="row between acenter">
        <Chip tone="">{w.category}</Chip>
        {out ? <Chip tone="bad" dot>已售罄</Chip> : <Chip tone="good" dot>库存 {w.stock}</Chip>}
      </div>
      <h3 className="t-h3" style={{ margin: '14px 0 16px' }}>{w.title}</h3>
      <div className="row between acenter">
        <div className="row acenter gap6">
          <I.coin size={16} style={{ color: 'var(--accent)' }} />
          <span className="t-num" style={{ fontSize: 22, color: 'var(--accent-deep)' }}>{w.cost}</span>
          <span className="t-cap">兑换分</span>
        </div>
        <Pill variant={out || !afford ? 'soft' : 'ink'} size="sm" icon="gift" noChip
          disabled={out || !afford} onClick={() => onExchange(w)}>
          {out ? '售罄' : afford ? '兑换' : '积分不足'}
        </Pill>
      </div>
    </div>
  );
}

Object.assign(window, { ActivityCard, WelfareCard });
