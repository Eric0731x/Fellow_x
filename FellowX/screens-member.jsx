// ════════════ 会员页面：个人中心 · 我的积分 · 活动详情 ════════════

/* ───────── 双轨积分可视化（3 种变体）pointsViz: 'rings'|'bignum'|'orbit' ───────── */
function PointsViz({ t, me, nextLv }) {
  const viz = (t && t.pointsViz) || 'rings';
  const lv = FX_DATA.LEVELS.find(l => l.order === me.levelOrder);
  const toNext = nextLv ? nextLv.min - me.growthPoints : 0;
  const span = nextLv ? nextLv.min - lv.min : 1;
  const prog = nextLv ? Math.round(((me.growthPoints - lv.min) / span) * 100) : 100;

  if (viz === 'bignum') {
    return (
      <div className="card" style={{ padding: 26 }}>
        <div className="row between wrap gap24">
          <div className="col gap4">
            <div className="row acenter gap6"><I.up size={14} style={{ color: 'var(--good)' }} /><span className="t-cap">成长积分 · 只增不减</span></div>
            <span className="t-num" style={{ fontSize: 56, color: 'var(--ink)' }}>{me.growthPoints.toLocaleString()}</span>
          </div>
          <div className="vr" style={{ minHeight: 70 }} />
          <div className="col gap4">
            <div className="row acenter gap6"><I.coin size={14} style={{ color: 'var(--accent)' }} /><span className="t-cap">兑换积分 · 可消费</span></div>
            <span className="t-num" style={{ fontSize: 56, color: 'var(--accent-deep)' }}>{me.exchangePoints.toLocaleString()}</span>
          </div>
        </div>
        <div className="hr" style={{ margin: '22px 0 18px' }} />
        <div className="row between acenter" style={{ marginBottom: 10 }}>
          <span className="t-sub">距 <b style={{ color: 'var(--ink)' }}>{nextLv ? nextLv.name : '满级'}</b> 还需 <span className="mono" style={{ color: 'var(--accent-deep)' }}>{toNext > 0 ? toNext : 0}</span> 成长分</span>
          <span className="mono t-cap">{prog}%</span>
        </div>
        <Bar pct={prog} variant="accent" thick />
      </div>
    );
  }

  if (viz === 'orbit') {
    return (
      <div className="card ink" style={{ padding: 26, position: 'relative', overflow: 'hidden' }}>
        <div className="row gap24 acenter" style={{ position: 'relative', zIndex: 1 }}>
          <Ring pct={prog} size={130} stroke={10} color="var(--accent)" track="rgba(255,255,255,.1)">
            <div className="col acenter gap2">
              <span className="t-num" style={{ fontSize: 30, color: 'var(--on-dark)' }}>{prog}%</span>
              <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>升级进度</span>
            </div>
          </Ring>
          <div className="col gap16 grow">
            <div className="col gap4">
              <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>成长积分</span>
              <span className="t-num" style={{ fontSize: 38, color: 'var(--on-dark)' }}>{me.growthPoints.toLocaleString()}</span>
            </div>
            <div className="row gap24">
              <div className="col gap2">
                <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>兑换积分</span>
                <span className="t-num" style={{ fontSize: 22, color: 'var(--accent)' }}>{me.exchangePoints.toLocaleString()}</span>
              </div>
              <div className="col gap2">
                <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>距下一级</span>
                <span className="t-num mono" style={{ fontSize: 22, color: 'var(--on-dark)' }}>{toNext > 0 ? toNext : 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: -80, bottom: -80, width: 220, height: 220, borderRadius: 999, border: '1px solid rgba(255,255,255,.06)' }} />
      </div>
    );
  }

  // 默认 rings：双环
  return (
    <div className="card" style={{ padding: 26 }}>
      <div className="row gap32 wrap center">
        <div className="col acenter gap10">
          <Ring pct={100} size={118} stroke={9} color="var(--good)">
            <div className="col acenter">
              <span className="t-num" style={{ fontSize: 26 }}>{(me.growthPoints/1000).toFixed(1)}k</span>
              <span className="t-cap">成长</span>
            </div>
          </Ring>
          <div className="row acenter gap6"><span className="sd" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--good)' }} /><span className="t-sub">成长积分 · 只增不减</span></div>
        </div>
        <div className="col acenter gap10">
          <Ring pct={prog} size={118} stroke={9} color="var(--accent)" delay={140}>
            <div className="col acenter">
              <span className="t-num" style={{ fontSize: 26, color: 'var(--accent-deep)' }}>{me.exchangePoints}</span>
              <span className="t-cap">兑换</span>
            </div>
          </Ring>
          <div className="row acenter gap6"><span className="sd" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} /><span className="t-sub">兑换积分 · 可消费</span></div>
        </div>
      </div>
      <div className="hr" style={{ margin: '20px 0 16px' }} />
      <div className="row between acenter" style={{ marginBottom: 10 }}>
        <span className="t-sub">距 <b style={{ color: 'var(--ink)' }}>{nextLv ? nextLv.name : '满级'}</b> 还需 <span className="mono" style={{ color: 'var(--accent-deep)' }}>{toNext > 0 ? toNext : 0}</span> 成长分</span>
        <span className="mono t-cap">{prog}%</span>
      </div>
      <Bar pct={prog} variant="accent" thick />
    </div>
  );
}

/* ───────── 徽章墙 ───────── */
function BadgeWall({ t, onCelebrate }) {
  const show = (t && t.gamification) !== false;
  if (!show) return null;
  const badges = FX_DATA.badges;
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row between acenter" style={{ marginBottom: 16 }}>
        <Eyebrow n="徽章">成就墙</Eyebrow>
        <span className="mono t-cap">{badges.filter(b => b.got).length}/{badges.length}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 10 }}>
        {badges.map((b, i) => (
          <button key={b.id} title={b.hint} onClick={() => b.got && onCelebrate && onCelebrate(b)}
            className="col acenter center" style={{
            aspectRatio: '1', borderRadius: 'var(--r-md)', border: '1px solid var(--hairline)',
            background: b.got ? 'var(--surface-sunk)' : 'transparent', cursor: b.got ? 'pointer' : 'default',
            gap: 6, padding: 8, opacity: b.got ? 1 : .4, filter: b.got ? 'none' : 'grayscale(1)',
            transition: 'transform .15s', fontFamily: 'inherit' }}
            onMouseEnter={e => b.got && (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{b.icon}</span>
            <span style={{ fontSize: 10, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>{b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── 个人中心 ───────── */
function MemberHomeScreen({ go, t, toast, role }) {
  const me = FX_DATA.me;
  const lv = FX_DATA.LEVELS.find(l => l.order === me.levelOrder);
  const nextLv = FX_DATA.LEVELS.find(l => l.order === me.levelOrder + 1);
  const [celebrate, setCelebrate] = useState(null);
  const showGame = (t && t.gamification) !== false;
  const isLauncher = role === 'launcher';

  const quickLinks = [
    { ico:'coin', tt:'我的积分', sub:'双轨积分流水', dest:'points' },
    { ico:'gift', tt:'兑换商城', sub:'让投入有回响', dest:'exchange' },
    { ico:'doc',  tt:'我的报名', sub:`${FX_DATA.memberRegistrations.filter(r=>['PENDING','APPROVED'].includes(r.state)).length} 个进行中`, dest:'me-registrations' },
    { ico:'edit', tt:'编辑资料', sub:'头像 · 昵称 · 邮箱', dest:'me-edit' },
  ];
  if (!isLauncher) {
    quickLinks.push({ ico:'flag', tt:'申请发起人', sub:'银牌+ 即可申请', dest:'launcher-apply', accent: true });
  }

  return (
    <div className="wrap-page fade-up">
      {/* 头部身份卡 */}
      <div className="card ink" style={{ padding: 26, marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div className="row between wrap gap20" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row gap16 acenter">
            <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--accent)',
              display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 26, color: '#fff', flex: 'none' }}>{me.avatar}</div>
            <div className="col gap6">
              <div className="row acenter gap10">
                <span className="t-h2" style={{ fontSize: 24, color: 'var(--on-dark)' }}>{me.name}</span>
                <LevelBadge order={me.levelOrder} />
              </div>
              <div className="row acenter gap12">
                <span className="mono t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>{me.memberNo}</span>
                <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>同行 {me.joinedDays} 天</span>
              </div>
            </div>
          </div>
          {showGame && (
            <div className="row acenter gap8" style={{ background: 'rgba(255,255,255,.08)', borderRadius: 999, padding: '8px 16px 8px 10px' }}>
              <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#fff' }}><I.fire size={16} /></span>
              <div className="col">
                <span className="t-num" style={{ fontSize: 22, color: 'var(--on-dark)' }}>{me.streak}</span>
                <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)', marginTop: -2 }}>天连击</span>
              </div>
            </div>
          )}
        </div>
        <div className="row gap32 wrap" style={{ marginTop: 24, position: 'relative', zIndex: 1 }}>
          {[[me.activitiesJoined,'参与活动'],[me.activitiesLaunched,'我发起的'],[me.badgesEarned,'已得徽章']].map(([n, l], i) => (
            <div key={i} className="col gap2">
              <span className="t-num" style={{ fontSize: 26, color: 'var(--on-dark)' }}>{n}</span>
              <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>{l}</span>
            </div>
          ))}
          <div className="mauto row acenter">
            <Pill variant="accent" size="sm" icon="edit" noChip onClick={() => go('me-edit')}>编辑资料</Pill>
          </div>
        </div>
        <div style={{ position: 'absolute', right: -90, top: -90, width: 240, height: 240, borderRadius: 999, border: '1px solid rgba(255,255,255,.07)' }} />
      </div>

      <div className="m-grid">
        <div className="col gap18">
          <PointsViz t={t} me={me} nextLv={nextLv} />
          <BadgeWall t={t} onCelebrate={b => setCelebrate(b)} />
        </div>
        <div className="col gap18">
          {/* 等级阶梯 */}
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow n="等级">成长阶梯</Eyebrow>
            <div className="col gap2" style={{ marginTop: 16 }}>
              {FX_DATA.LEVELS.map((l, i) => {
                const here = l.order === me.levelOrder;
                const passed = l.order < me.levelOrder;
                return (
                  <div key={l.order} className="row acenter gap12" style={{ padding: '10px 0',
                    borderBottom: i < 4 ? '1px solid var(--hairline)' : 'none' }}>
                    <span className="mono" style={{ fontSize: 11, color: here ? 'var(--accent-deep)' : 'var(--ink-3)', width: 22 }}>L{l.order}</span>
                    <span style={{ width: 8, height: 8, borderRadius: 999, flex: 'none',
                      background: passed ? 'var(--good)' : here ? 'var(--accent)' : 'var(--ink-4)' }} />
                    <div className="col grow">
                      <span style={{ fontSize: 13.5, fontWeight: here ? 600 : 500, color: here ? 'var(--ink)' : 'var(--ink-2)' }}>{l.name}</span>
                      <span className="t-cap">{l.priv}</span>
                    </div>
                    <span className="mono t-cap">{l.min.toLocaleString()}</span>
                    {here && <Chip tone="accent">当前</Chip>}
                  </div>
                );
              })}
            </div>
          </div>
          {/* 快捷入口 */}
          <div className="card" style={{ padding: 14 }}>
            {quickLinks.map(({ ico, tt, sub, dest, accent }, i) => {
              const Ico = I[ico];
              return (
                <button key={i} onClick={() => go(dest)} className="row acenter gap12" style={{
                  width: '100%', padding: '13px 10px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: i < quickLinks.length - 1 ? '1px solid var(--hairline)' : 'none',
                  fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)',
                    background: accent ? 'var(--accent-soft)' : 'var(--surface-sunk)',
                    color: accent ? 'var(--accent-deep)' : 'var(--ink)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                    <Ico size={17} />
                  </span>
                  <div className="col grow">
                    <span style={{ fontSize: 13.5, fontWeight: 550, color: accent ? 'var(--accent-deep)' : 'var(--ink)' }}>{tt}</span>
                    <span className="t-cap">{sub}</span>
                  </div>
                  <I.chevR size={16} style={{ color: 'var(--ink-3)' }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {celebrate && <CelebrationModal badge={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}

/* ───────── 庆祝弹层 ───────── */
function CelebrationModal({ badge, points, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'grid', placeItems: 'center',
      background: 'rgba(10,10,10,.4)', backdropFilter: 'blur(4px)' }}>
      <div className="glass" onClick={e => e.stopPropagation()} style={{ width: 320, borderRadius: 'var(--r-xl)',
        padding: '36px 28px', textAlign: 'center', animation: 'pop .5s cubic-bezier(.2,.7,.2,1) both' }}>
        <div style={{ fontSize: 56, animation: 'pop .6s .1s cubic-bezier(.2,.7,.2,1) both' }}>{badge ? badge.icon : '🎉'}</div>
        <div className="eyebrow accent center" style={{ marginTop: 14, justifyContent: 'center' }}><span className="dot" />里程碑达成</div>
        <h3 className="t-h2" style={{ fontSize: 24, margin: '10px 0 6px' }}>{badge ? badge.name : '兑换成功'}</h3>
        <p className="t-sub" style={{ margin: 0 }}>{badge ? badge.hint : points}</p>
        <div style={{ marginTop: 22 }}><Pill variant="accent" noChip onClick={onClose} style={{ width: '100%', justifyContent: 'center', height: 44 }}>太好了</Pill></div>
      </div>
    </div>
  );
}

/* ───────── 我的积分 ───────── */
function PointsScreen({ t, toast }) {
  const me = FX_DATA.me;
  const [filter, setFilter] = useState('all');
  const txns = FX_DATA.transactions.filter(x => filter === 'all' || x.type === filter);
  return (
    <div className="wrap-page fade-up">
      <PageHead n="积分" title="我的积分" sub="双轨积分 · 成长留痕，投入有回响" />
      <div className="row gap16 wrap" style={{ marginBottom: 18 }}>
        <div className="card grow" style={{ padding: 22, minWidth: 220 }}>
          <div className="row acenter gap6"><I.up size={14} style={{ color: 'var(--good)' }} /><span className="t-cap">成长积分 · 只增不减</span></div>
          <div className="t-num" style={{ fontSize: 44, marginTop: 8 }}>{me.growthPoints.toLocaleString()}</div>
          <Chip tone="good" dot>本周 +330</Chip>
        </div>
        <div className="card grow" style={{ padding: 22, minWidth: 220 }}>
          <div className="row acenter gap6"><I.coin size={14} style={{ color: 'var(--accent)' }} /><span className="t-cap">兑换积分 · 可消费</span></div>
          <div className="t-num" style={{ fontSize: 44, marginTop: 8, color: 'var(--accent-deep)' }}>{me.exchangePoints.toLocaleString()}</div>
          <div className="row gap8"><Chip tone="accent" dot>可兑换福利</Chip></div>
        </div>
      </div>
      {/* 流水 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="row between acenter" style={{ padding: '18px 20px' }}>
          <Eyebrow n="流水">积分明细</Eyebrow>
          <div className="row gap2" style={{ background: 'var(--surface-sunk)', borderRadius: 999, padding: 3 }}>
            {[['all','全部'],['growth','成长'],['exchange','兑换']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className="seg-btn" data-on={filter === k}>{l}</button>
            ))}
          </div>
        </div>
        <div className="hr" />
        <div>
          {txns.map((x, i) => (
            <div key={x.id} className="row between acenter" style={{ padding: '15px 20px',
              borderBottom: i < txns.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <div className="row gap12 acenter">
                <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', flex: 'none',
                  background: x.amount > 0 ? 'var(--good-soft)' : 'var(--bad-soft)',
                  color: x.amount > 0 ? 'var(--good)' : 'var(--bad)', display: 'grid', placeItems: 'center' }}>
                  {x.amount > 0 ? <I.up size={15} /> : <I.coin size={15} />}
                </span>
                <div className="col">
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{x.title}</span>
                  <span className="mono t-cap">{x.time} · {x.type === 'growth' ? '成长分' : '兑换分'}</span>
                </div>
              </div>
              <span className="t-num mono" style={{ fontSize: 17, color: x.amount > 0 ? 'var(--good)' : 'var(--bad)' }}>
                {x.amount > 0 ? '+' : ''}{x.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── 活动详情 ───────── */
function ActivityDetailScreen({ id, go, t, toast, isAuthed }) {
  const a = FX_DATA.activities.find(x => x.id === id) || FX_DATA.activities[0];
  const [registered, setRegistered] = useState(false);
  const [showCele, setShowCele] = useState(false);
  const meta = FX_DATA.STATE_META[a.state] || {};
  const pct = a.max ? Math.round((a.registered / a.max) * 100) : 0;
  const canReg = a.state === 'REGISTRATION_OPEN';

  // 状态机进度
  const flow = ['DRAFT','PENDING_REVIEW','PUBLISHED','REGISTRATION_OPEN','IN_PROGRESS','ENDED'];
  const curIdx = flow.indexOf(a.state);

  const doReg = () => {
    if (!isAuthed) { go('login'); return; }
    setRegistered(true); setShowCele(true);
  };

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 980 }}>
      <button className="tbtn" onClick={() => go('activities')} style={{ marginBottom: 14 }}>← 返回活动列表</button>
      <div className="m-grid" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)' }}>
        {/* 左 */}
        <div className="col gap18">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 160, background: a.cover, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 20 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 120% at 85% 0%, rgba(255,255,255,.18), transparent 55%)' }} />
              <div style={{ position: 'absolute', top: 16, right: 16 }}><StatusBadge state={a.state} /></div>
              <span className="mono" style={{ color: '#fff', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: .9, position: 'relative' }}>{a.category}</span>
            </div>
            <div style={{ padding: 24 }}>
              <h1 className="t-h2" style={{ fontSize: 26, margin: '0 0 12px' }}>{a.title}</h1>
              <div className="row gap16 wrap" style={{ marginBottom: 18 }}>
                {[['calendar', `${a.start} — ${a.end}`],['pin', a.location],['user', `${a.launcher} 发起`]].map(([ico, txt], i) => {
                  const Ico = I[ico];
                  return <div key={i} className="row acenter gap6"><Ico size={14} style={{ color: 'var(--ink-3)' }} /><span className="t-sub">{txt}</span></div>;
                })}
              </div>
              <div className="hr" style={{ margin: '0 0 18px' }} />
              <p className="t-body" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>{a.desc}</p>
              <p className="t-body" style={{ lineHeight: 1.7 }}>
                本期共 {a.days} 天，采用「直播 + 作业 + 互评」的节奏。每完成一次有效参与可获得成长积分，
                全勤将解锁专属徽章。报名需达到 <b style={{ color: 'var(--ink)' }}>L{a.minLevel}</b> 及以上等级。
              </p>
            </div>
          </div>
          {/* 状态时间线 */}
          <div className="card" style={{ padding: 22 }}>
            <Eyebrow n="流程">活动状态</Eyebrow>
            <div className="row" style={{ marginTop: 20, position: 'relative' }}>
              {flow.map((s, i) => {
                const done = i <= curIdx;
                return (
                  <div key={s} className="col acenter grow" style={{ position: 'relative' }}>
                    {i < flow.length - 1 && <div style={{ position: 'absolute', top: 7, left: '50%', width: '100%', height: 2, background: i < curIdx ? 'var(--accent)' : 'var(--hairline)' }} />}
                    <span style={{ width: 16, height: 16, borderRadius: 999, zIndex: 1, flex: 'none',
                      background: done ? 'var(--accent)' : 'var(--surface)', border: done ? 'none' : '2px solid var(--ink-4)',
                      display: 'grid', placeItems: 'center' }}>{i === curIdx && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff' }} />}</span>
                    <span className="t-cap" style={{ marginTop: 8, fontSize: 10, color: done ? 'var(--ink)' : 'var(--ink-3)', textAlign: 'center' }}>{FX_DATA.STATE_META[s].zh}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* 右：报名卡（吸顶）*/}
        <div className="col gap18">
          <div className="card" style={{ padding: 22, position: 'sticky', top: 78 }}>
            <div className="row between acenter">
              <span className="t-cap">报名进度</span>
              <span className="mono t-cap">{pct}%</span>
            </div>
            <div className="row acenter gap8" style={{ margin: '8px 0 12px' }}>
              <span className="t-num" style={{ fontSize: 34 }}>{a.registered}</span>
              <span className="t-sub" style={{ marginBottom: 4 }}>/ {a.max} 人</span>
            </div>
            <Bar pct={pct} variant="accent" thick />
            <div className="row gap8 wrap" style={{ margin: '16px 0' }}>
              <Chip tone="">报名截止 {a.deadline}</Chip>
              <Chip tone="info">需 L{a.minLevel}+</Chip>
            </div>
            {canReg ? (
              <Pill variant={registered ? 'soft' : 'accent'} icon={registered ? 'check' : 'arrow'} noChip
                disabled={registered} onClick={doReg}
                style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 15 }}>
                {registered ? '已报名 · 待审核' : isAuthed ? '立即报名' : '登录后报名'}
              </Pill>
            ) : (
              <Pill variant="soft" noChip disabled style={{ width: '100%', justifyContent: 'center', height: 48 }}>
                {meta.zh} · 暂不可报名
              </Pill>
            )}
            <p className="t-cap" style={{ textAlign: 'center', marginTop: 12, marginBottom: 0 }}>报名将提交给发起人审核</p>
          </div>
        </div>
      </div>
      {showCele && <CelebrationModal points="报名已提交，等待发起人审核" onClose={() => setShowCele(false)} />}
    </div>
  );
}

/* ───────── 通用页头 ───────── */
function PageHead({ n, title, sub, action }) {
  return (
    <div className="row between astart wrap gap16" style={{ marginBottom: 22 }}>
      <div>
        <Eyebrow n={n}>{sub}</Eyebrow>
        <h1 className="t-h2" style={{ marginTop: 12 }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

/* ───────── 资料完善引导弹窗 ───────── */
function ProfileCompletionModal({ onSkip, onSave }) {
  const me = FX_DATA.me;
  const [form, setForm] = useState({ name: me.name, gender: 'UNKNOWN', birthday: '', email: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onSave(form); }, 700);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9100, display:'grid', placeItems:'center',
      background:'rgba(10,10,10,.55)', backdropFilter:'blur(6px)' }}>
      <div className="glass" style={{ width:'100%', maxWidth:440, borderRadius:'var(--r-xl)',
        padding:'32px 28px', animation:'pop .4s cubic-bezier(.2,.7,.2,1) both', margin:'0 16px' }}>
        {/* 顶部说明 */}
        <div className="col acenter" style={{ marginBottom:24, textAlign:'center' }}>
          <div className="eyebrow accent" style={{ justifyContent:'center' }}>
            <span className="dot" />完善资料
          </div>
          <h2 style={{ margin:'10px 0 6px', fontSize:22, fontWeight:700 }}>完善你的个人资料</h2>
          <p className="t-sub" style={{ margin:0 }}>完善后可获得 +5 成长分，让同行更了解你</p>
        </div>

        {/* 头像 */}
        <div className="col acenter" style={{ marginBottom:22 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--accent)', cursor:'pointer',
            display:'grid', placeItems:'center', fontSize:30, fontWeight:700, color:'#fff', position:'relative' }}>
            {me.avatar}
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,.3)',
              display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0}>
              <I.edit size={18} style={{ color:'#fff' }} />
            </div>
          </div>
          <span className="t-cap" style={{ marginTop:8 }}>点击更换头像（JPG/PNG ≤ 5MB）</span>
        </div>

        {/* 表单 */}
        <div className="col" style={{ gap:14 }}>
          <Field label="昵称">
            <input className="field" value={form.name} onChange={e => set('name', e.target.value)} maxLength={50} />
          </Field>
          <div className="col" style={{ gap:7 }}>
            <span className="field-label">性别</span>
            <div className="row gap20">
              {[['MALE','男'], ['FEMALE','女'], ['UNKNOWN','保密']].map(([v, l]) => (
                <label key={v} className="row acenter gap6" style={{ cursor:'pointer' }}>
                  <input type="radio" name="pcm-gender" value={v} checked={form.gender===v}
                    onChange={() => set('gender', v)} style={{ accentColor:'var(--accent)' }} />
                  <span style={{ fontSize:14, color:'var(--ink-2)' }}>{l}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="生日（可选）">
            <input type="date" className="field" value={form.birthday}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => set('birthday', e.target.value)} />
          </Field>
          <Field label="邮箱（可选）">
            <input type="email" className="field" placeholder="your@email.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
        </div>

        {/* 操作 */}
        <div className="row gap10" style={{ marginTop:22 }}>
          <Pill variant="ghost" noChip onClick={onSkip} style={{ flex:1, justifyContent:'center' }}>跳过</Pill>
          <Pill variant="accent" icon="arrow" onClick={handleSave} disabled={saving}
            style={{ flex:2, justifyContent:'center' }}>
            {saving ? '保存中…' : '保存并继续'}
          </Pill>
        </div>
      </div>
    </div>
  );
}

/* ───────── 编辑个人资料页 (/me/edit) ───────── */
function EditProfileScreen({ go, toast }) {
  const me = FX_DATA.me;
  const [form, setForm] = useState({
    name: me.name,
    gender: me.gender || 'UNKNOWN',
    birthday: me.birthday || '',
    email: me.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast('昵称不能为空', 'bad'); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); toast('保存成功'); go('member-home'); }, 700);
  };

  return (
    <div className="wrap-page fade-up" style={{ maxWidth:680 }}>
      <button className="tbtn" onClick={() => go('member-home')} style={{ marginBottom:16 }}>← 返回个人中心</button>
      <h1 className="t-h2" style={{ marginBottom:24 }}>编辑个人资料</h1>

      {/* 头像区 */}
      <div className="card" style={{ padding:24, marginBottom:14 }}>
        <div className="col acenter" style={{ gap:10 }}>
          <div style={{ width:96, height:96, borderRadius:'50%', background:'var(--accent)', cursor:'pointer',
            display:'grid', placeItems:'center', fontSize:36, fontWeight:700, color:'#fff', position:'relative' }}>
            {me.avatar}
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,.3)',
              display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0}>
              <I.edit size={20} style={{ color:'#fff' }} />
            </div>
          </div>
          <span style={{ fontSize:13, color:'var(--ink-2)' }}>📷 更换头像</span>
          <span className="t-cap" style={{ opacity:.6 }}>支持 JPG / PNG / WebP，≤ 5MB，将裁剪为 1:1</span>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="card" style={{ padding:24, marginBottom:14 }}>
        <Eyebrow n="基本">个人信息</Eyebrow>
        <div className="col" style={{ gap:16, marginTop:18 }}>
          <Field label="昵称 *">
            <input className="field" value={form.name} maxLength={50}
              onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="手机号（不可修改）">
            <input className="field" value={me.phone} disabled
              style={{ opacity:.5, cursor:'not-allowed', background:'var(--surface-sunk)' }} />
          </Field>
          <div className="col" style={{ gap:7 }}>
            <span className="field-label">性别</span>
            <div className="row gap20">
              {[['MALE','男'], ['FEMALE','女'], ['UNKNOWN','保密']].map(([v, l]) => (
                <label key={v} className="row acenter gap6" style={{ cursor:'pointer' }}>
                  <input type="radio" name="ep-gender" value={v} checked={form.gender===v}
                    onChange={() => set('gender', v)} style={{ accentColor:'var(--accent)' }} />
                  <span style={{ fontSize:14 }}>{l}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="生日">
            <input type="date" className="field" value={form.birthday}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => set('birthday', e.target.value)} />
          </Field>
          <Field label="邮箱">
            <input type="email" className="field" placeholder="your@email.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* 账号操作 */}
      <div className="card" style={{ padding:24, marginBottom:24 }}>
        <Eyebrow n="账号">危险操作</Eyebrow>
        <div className="row between acenter" style={{ marginTop:16 }}>
          <div className="col" style={{ gap:4 }}>
            <span style={{ fontSize:13.5, fontWeight:550, color:'var(--bad)' }}>注销账号</span>
            <span className="t-cap">注销后数据保留 30 天，期间可通过客服恢复</span>
          </div>
          <button className="tbtn" style={{ color:'var(--bad)', fontSize:13, whiteSpace:'nowrap' }}
            onClick={() => setShowDeactivate(true)}>申请注销 →</button>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="row gap10" style={{ justifyContent:'flex-end' }}>
        <Pill variant="ghost" noChip onClick={() => go('member-home')}>取消</Pill>
        <Pill variant="ink" icon="check" onClick={handleSave} disabled={saving}>
          {saving ? '保存中…' : '💾 保存修改'}
        </Pill>
      </div>

      {showDeactivate && (
        <ConfirmDialog
          title="确认注销账号？"
          content="注销后账号将在 30 天内可恢复，之后数据将被永久删除。此操作不可撤销。"
          danger confirmText="确认注销"
          loading={deactivating}
          onCancel={() => setShowDeactivate(false)}
          onConfirm={() => {
            setDeactivating(true);
            setTimeout(() => { toast('注销申请已提交'); go('landing'); }, 800);
          }}
        />
      )}
    </div>
  );
}

/* ───────── 我的报名 (/me/registrations) ───────── */
function RegistrationsScreen({ go, toast }) {
  const [tab, setTab] = useState('all');
  const [regs, setRegs] = useState(FX_DATA.memberRegistrations);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const tabs = [['all','全部'], ['PENDING','待审核'], ['APPROVED','已通过'], ['REJECTED','已拒绝'], ['CANCELLED','已取消']];
  const list = tab === 'all' ? regs : regs.filter(r => r.state === tab);

  const doCancel = () => {
    setCancelling(true);
    setTimeout(() => {
      setRegs(rs => rs.map(r => r.id === cancelTarget ? { ...r, state:'CANCELLED' } : r));
      setCancelling(false); setCancelTarget(null);
      toast('已取消报名');
    }, 600);
  };

  const stateColor = { PENDING:'var(--warn)', APPROVED:'var(--good)', REJECTED:'var(--bad)', CANCELLED:'var(--ink-3)' };

  return (
    <div className="wrap-page fade-up">
      <button className="tbtn" onClick={() => go('member-home')} style={{ marginBottom:14 }}>← 返回个人中心</button>
      <PageHead n="报名" title="我的报名" sub={`${regs.length} 条记录`} />

      {/* Tabs */}
      <div className="row gap2" style={{ background:'var(--surface-sunk)', borderRadius:999, padding:3,
        marginBottom:20, width:'fit-content', flexWrap:'wrap' }}>
        {tabs.map(([k, l]) => (
          <button key={k} className="seg-btn" data-on={tab===k} onClick={() => setTab(k)}>
            {l}{k!=='all' && <span className="mono" style={{ marginLeft:4, fontSize:11, opacity:.7 }}>
              {regs.filter(r=>r.state===k).length}
            </span>}
          </button>
        ))}
      </div>

      {list.length === 0
        ? <div className="card"><EmptyState icon="doc" text="暂无报名记录" /></div>
        : <div className="col gap12">
            {list.map(r => (
              <div key={r.id} className="card" style={{ padding:20,
                borderLeft: `3px solid ${stateColor[r.state] || 'var(--hairline)'}` }}>
                <div className="row between astart" style={{ gap:12, flexWrap:'wrap' }}>
                  <div className="col" style={{ gap:8, flex:'1 1 240px' }}>
                    <div className="row acenter gap8" style={{ flexWrap:'wrap' }}>
                      <h3 className="t-h3" style={{ margin:0 }}>{r.actTitle}</h3>
                      <StatusBadge state={r.state} reg />
                    </div>
                    <div className="row gap14 wrap">
                      <div className="row acenter gap5">
                        <I.calendar size={13} style={{ color:'var(--ink-3)' }} />
                        <span className="t-cap">{r.actTime}</span>
                      </div>
                      <div className="row acenter gap5">
                        <I.pin size={13} style={{ color:'var(--ink-3)' }} />
                        <span className="t-cap">{r.actLocation}</span>
                      </div>
                      <div className="row acenter gap5">
                        <I.clock size={13} style={{ color:'var(--ink-3)' }} />
                        <span className="t-cap">报名于 {r.regTime}</span>
                      </div>
                    </div>
                    {r.state==='REJECTED' && r.rejectReason && (
                      <div style={{ background:'var(--bad-soft)', borderRadius:'var(--r-sm)', padding:'8px 12px' }}>
                        <span className="t-cap" style={{ color:'var(--bad)' }}>拒绝原因：{r.rejectReason}</span>
                      </div>
                    )}
                  </div>
                  <div className="row gap8" style={{ flex:'none' }}>
                    <button className="tbtn" style={{ fontSize:12 }}
                      onClick={() => go('activity', r.actId)}>查看活动</button>
                    {['PENDING','APPROVED'].includes(r.state) && (
                      <button className="tbtn" style={{ fontSize:12, color:'var(--bad)' }}
                        onClick={() => setCancelTarget(r.id)}>取消报名</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {cancelTarget && (
        <ConfirmDialog
          title="确认取消报名？"
          content={regs.find(r=>r.id===cancelTarget)?.state === 'APPROVED'
            ? '取消已通过的报名将扣除 50 成长积分，此操作不可恢复。'
            : '取消报名后此操作不可恢复。'}
          danger confirmText="确认取消"
          loading={cancelling}
          onCancel={() => setCancelTarget(null)}
          onConfirm={doCancel}
        />
      )}
    </div>
  );
}

Object.assign(window, {
  PointsViz, BadgeWall, MemberHomeScreen, CelebrationModal, PointsScreen,
  ActivityDetailScreen, PageHead, ProfileCompletionModal, EditProfileScreen, RegistrationsScreen,
});
