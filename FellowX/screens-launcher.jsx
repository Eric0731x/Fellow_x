// ════════════ 发起人页面：创建活动 · 报名审核 ════════════

/* ───────── 活动列表（公开 / 浏览全部）───────── */
function ActivitiesScreen({ go, t }) {
  const [cat, setCat] = useState('全部');
  const [view, setView] = useState('grid');
  const cats = ['全部', '共学', '精读', '线下', '训练'];
  const list = FX_DATA.activities.filter(a =>
    !['DRAFT'].includes(a.state) && (cat === '全部' || a.category === cat));
  return (
    <div className="wrap-page fade-up">
      <PageHead n="活动" title="同行活动" sub="共学 · 精读 · 闭门会 · 线下沙龙" />
      <div className="row between acenter wrap gap12" style={{ marginBottom: 20 }}>
        <div className="row gap2" style={{ background: 'var(--surface-sunk)', borderRadius: 999, padding: 3, flexWrap: 'wrap' }}>
          {cats.map(c => <button key={c} onClick={() => setCat(c)} className="seg-btn" data-on={cat === c}>{c}</button>)}
        </div>
        <div className="row gap2" style={{ background: 'var(--surface-sunk)', borderRadius: 999, padding: 3 }}>
          <button className="seg-btn icon" data-on={view==='grid'} onClick={() => setView('grid')}><I.grid size={15} /></button>
          <button className="seg-btn icon" data-on={view==='list'} onClick={() => setView('list')}><I.list size={15} /></button>
        </div>
      </div>
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {list.map((a, i) => <ActivityCard key={a.id} a={a} t={t} onClick={() => go('activity', a.id)} delay={i * 50} />)}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {list.map((a, i) => (
            <button key={a.id} onClick={() => go('activity', a.id)} className="row between acenter" style={{
              width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: i < list.length - 1 ? '1px solid var(--hairline)' : 'none', fontFamily: 'inherit', textAlign: 'left' }}>
              <div className="row gap14 acenter">
                <span style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: a.cover, flex: 'none' }} />
                <div className="col gap4">
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{a.title}</span>
                  <div className="row gap8 acenter"><Chip tone="">{a.category}</Chip><span className="mono t-cap">{a.start}</span></div>
                </div>
              </div>
              <div className="row gap16 acenter">
                <span className="mono t-sub">{a.registered}/{a.max}</span>
                <StatusBadge state={a.state} />
                <I.chevR size={16} style={{ color: 'var(--ink-3)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── 福利商城（兑换）───────── */
function ExchangeScreen({ t, toast }) {
  const [balance, setBalance] = useState(FX_DATA.me.exchangePoints);
  const [cele, setCele] = useState(null);
  const exchange = (w) => { setBalance(b => b - w.cost); setCele(w); };
  return (
    <div className="wrap-page fade-up">
      <PageHead n="福利" title="兑换商城" sub="让投入有实在的回响"
        action={<div className="card" style={{ padding: '12px 18px' }}>
          <div className="row acenter gap10">
            <I.coin size={18} style={{ color: 'var(--accent)' }} />
            <div className="col"><span className="t-cap">可用兑换分</span><span className="t-num" style={{ fontSize: 24, color: 'var(--accent-deep)' }}>{balance.toLocaleString()}</span></div>
          </div>
        </div>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {FX_DATA.welfares.map(w => <WelfareCard key={w.id} w={w} balance={balance} onExchange={exchange} />)}
      </div>
      {cele && <CelebrationModal points={`已用 ${cele.cost} 兑换分换取「${cele.title}」`} onClose={() => setCele(null)} />}
    </div>
  );
}

/* ───────── 创建活动（分步）───────── */
function CreateActivityScreen({ go, toast }) {
  const [step, setStep] = useState(0);
  const steps = ['基本信息', '时间与名额', '门槛与积分', '预览提交'];
  const [f, setF] = useState({
    title: '', category: '共学', desc: '', cover: '#0a0a0a',
    location: '', start: '', end: '', deadline: '', max: 40,
    minLevel: 2, growthReward: 120, saveDraft: false,
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const covers = ['#0a0a0a', '#1d4ed8', '#c2410c', '#0e7490', '#15803d', '#7c3aed'];

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const submit = () => { toast('活动已提交审核'); go('launcher-activities'); };

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 760 }}>
      <PageHead n="发起" title="创建活动" sub="发起一场属于社区的同行" />
      {/* 步骤指示 */}
      <div className="row between" style={{ marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={i} className="col acenter grow" style={{ position: 'relative' }}>
            {i < steps.length - 1 && <div style={{ position: 'absolute', top: 13, left: '50%', width: '100%', height: 2, background: i < step ? 'var(--accent)' : 'var(--hairline)' }} />}
            <span style={{ width: 28, height: 28, borderRadius: 999, zIndex: 1, display: 'grid', placeItems: 'center',
              background: i <= step ? 'var(--accent)' : 'var(--surface-sunk)', color: i <= step ? '#fff' : 'var(--ink-3)',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, border: i === step ? '3px solid var(--accent-soft)' : 'none' }}>
              {i < step ? <I.check size={14} /> : i + 1}</span>
            <span className="t-cap" style={{ marginTop: 8, color: i <= step ? 'var(--ink)' : 'var(--ink-3)', fontSize: 11 }}>{s}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 28 }}>
        {step === 0 && (
          <div className="col gap18 fade-up">
            <Field label="活动标题"><input className="field" placeholder="例如：Agent 工作流共创营 · 第 8 期" value={f.title} onChange={e => set('title', e.target.value)} /></Field>
            <div className="col" style={{ gap: 7 }}>
              <span className="field-label">分类</span>
              <div className="row gap8 wrap">
                {['共学','精读','线下','训练'].map(c => (
                  <button key={c} onClick={() => set('category', c)} className="pick-chip" data-on={f.category === c}>{c}</button>
                ))}
              </div>
            </div>
            <Field label="活动简介"><textarea className="field" rows={4} placeholder="一句话讲清楚：参与者会得到什么、需要付出什么。" value={f.desc} onChange={e => set('desc', e.target.value)} /></Field>
            <div className="col" style={{ gap: 7 }}>
              <span className="field-label">封面色</span>
              <div className="row gap10">
                {covers.map(c => (
                  <button key={c} onClick={() => set('cover', c)} style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)',
                    background: c, border: 'none', cursor: 'pointer', position: 'relative',
                    outline: f.cover === c ? '2px solid var(--ink)' : 'none', outlineOffset: 2 }}>
                    {f.cover === c && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff' }}><I.check size={16} /></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="col gap18 fade-up">
            <div className="row gap14 wrap">
              <Field label="开始日期"><input className="field" type="date" value={f.start} onChange={e => set('start', e.target.value)} /></Field>
              <Field label="结束日期"><input className="field" type="date" value={f.end} onChange={e => set('end', e.target.value)} /></Field>
            </div>
            <Field label="报名截止"><input className="field" type="date" value={f.deadline} onChange={e => set('deadline', e.target.value)} /></Field>
            <Field label="活动地点"><input className="field" placeholder="线上会议链接 / 线下详细地址" value={f.location} onChange={e => set('location', e.target.value)} /></Field>
            <div className="col" style={{ gap: 7 }}>
              <div className="row between"><span className="field-label" style={{ margin: 0 }}>报名人数上限</span><span className="t-num mono" style={{ fontSize: 20, color: 'var(--accent-deep)' }}>{f.max}</span></div>
              <input type="range" min="6" max="320" step="2" value={f.max} onChange={e => set('max', +e.target.value)} className="slider" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="col gap20 fade-up">
            <div className="col" style={{ gap: 7 }}>
              <span className="field-label">参与最低等级</span>
              <div className="row gap8 wrap">
                {FX_DATA.LEVELS.map(l => (
                  <button key={l.order} onClick={() => set('minLevel', l.order)} className="pick-chip" data-on={f.minLevel === l.order}>
                    <span className="mono" style={{ opacity: .6, marginRight: 4 }}>L{l.order}</span>{l.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="col" style={{ gap: 7 }}>
              <div className="row between"><span className="field-label" style={{ margin: 0 }}>完成奖励 · 成长积分</span><span className="t-num mono" style={{ fontSize: 20, color: 'var(--good)' }}>+{f.growthReward}</span></div>
              <input type="range" min="20" max="500" step="10" value={f.growthReward} onChange={e => set('growthReward', +e.target.value)} className="slider" />
              <span className="t-cap">参与者每完成一次有效参与可获得该成长积分。</span>
            </div>
            <div className="card sunk" style={{ padding: 16 }}>
              <div className="row gap10 acenter"><I.shield size={16} style={{ color: 'var(--info)' }} /><span className="t-sub" style={{ color: 'var(--ink-soft)' }}>提交后将进入<b>待审核</b>状态，由社区管理员审核通过后才会公开报名。</span></div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="col gap16 fade-up">
            <span className="t-cap">预览 · 提交前请确认</span>
            <ActivityCard t={{ cardStyle: 'cover' }} a={{
              id: 0, title: f.title || '未命名活动', category: f.category, cover: f.cover, desc: f.desc || '（暂无简介）',
              location: f.location || '待定', state: 'PENDING_REVIEW', registered: 0, max: f.max,
              start: f.start || '—', end: f.end || '—', launcher: FX_DATA.me.name, minLevel: f.minLevel, hot: false }} />
            <div className="row gap16 wrap">
              {[['门槛', `L${f.minLevel} ${FX_DATA.LEVELS.find(l=>l.order===f.minLevel).name}`],['名额', `${f.max} 人`],['奖励', `+${f.growthReward} 成长分`]].map(([k,v],i)=>(
                <div key={i} className="card sunk grow" style={{ padding: 14, minWidth: 120 }}><span className="t-cap">{k}</span><div className="t-h3" style={{ marginTop: 4 }}>{v}</div></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="row between" style={{ marginTop: 20 }}>
        <Pill variant="ghost" noChip onClick={step === 0 ? () => go('launcher-activities') : prev}>{step === 0 ? '取消' : '上一步'}</Pill>
        <div className="row gap10">
          {step === 3 && <Pill variant="soft" icon="doc" noChip onClick={() => { toast('已保存为草稿'); go('launcher-activities'); }}>存草稿</Pill>}
          {step < 3
            ? <Pill variant="ink" icon="arrow" onClick={next}>下一步</Pill>
            : <Pill variant="accent" icon="check" onClick={submit}>提交审核</Pill>}
        </div>
      </div>
    </div>
  );
}

/* ───────── 发起人 · 我的活动 + 报名审核 ───────── */
function LauncherActivitiesScreen({ go, t, toast }) {
  const mine = FX_DATA.activities.filter(a => a.launcher === FX_DATA.me.name);
  const [active, setActive] = useState(mine[0].id);
  const [regs, setRegs] = useState(FX_DATA.registrations);
  const act = (id, state) => { setRegs(rs => rs.map(r => r.id === id ? { ...r, state } : r)); toast(state === 'APPROVED' ? '已通过报名' : '已拒绝报名'); };
  const pending = regs.filter(r => r.state === 'PENDING').length;
  const cur = mine.find(a => a.id === active);

  return (
    <div className="wrap-page fade-up">
      <PageHead n="管理" title="我发起的活动" sub={`${mine.length} 场活动 · ${pending} 条待审核报名`}
        action={<Pill variant="accent" icon="plus" onClick={() => go('create-activity')}>创建活动</Pill>} />
      <div className="m-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)' }}>
        {/* 左：我的活动 */}
        <div className="col gap12">
          {mine.map(a => (
            <button key={a.id} onClick={() => setActive(a.id)} className="card hover" style={{
              padding: 16, textAlign: 'left', cursor: 'pointer',
              borderColor: active === a.id ? 'var(--ink)' : 'var(--hairline)',
              boxShadow: active === a.id ? 'var(--shadow-2)' : 'none' }}>
              <div className="row between acenter" style={{ marginBottom: 8 }}>
                <StatusBadge state={a.state} />
                <span className="mono t-cap">{a.registered}/{a.max}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{a.title}</div>
              <Bar pct={a.max ? (a.registered/a.max)*100 : 0} variant="accent" />
            </button>
          ))}
        </div>
        {/* 右：报名审核 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="row between acenter" style={{ padding: '18px 20px' }}>
            <div className="col"><Eyebrow n="报名">{cur ? cur.title : ''}</Eyebrow></div>
            <Chip tone="warn" dot>{pending} 待审核</Chip>
          </div>
          <div className="hr" />
          {regs.length === 0 ? <EmptyState icon="users" text="还没有报名" /> : regs.map((r, i) => (
            <div key={r.id} style={{ padding: '16px 20px', borderBottom: i < regs.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <div className="row between acenter">
                <div className="row gap12 acenter">
                  <span style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--surface-sunk)', display: 'grid', placeItems: 'center', fontWeight: 600, color: 'var(--ink)', flex: 'none' }}>{r.name[0]}</span>
                  <div className="col gap4">
                    <div className="row acenter gap8"><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</span><LevelBadge order={FX_DATA.LEVELS.find(l=>l.name===r.level).order} plain /></div>
                    <span className="mono t-cap">{r.memberNo} · {r.time}</span>
                  </div>
                </div>
                {r.state === 'PENDING' ? (
                  <div className="row gap8">
                    <button className="rev-btn bad" onClick={() => act(r.id, 'REJECTED')}><I.x size={15} /></button>
                    <button className="rev-btn good" onClick={() => act(r.id, 'APPROVED')}><I.check size={15} /></button>
                  </div>
                ) : <StatusBadge state={r.state} reg />}
              </div>
              <p className="t-sub" style={{ margin: '10px 0 0', paddingLeft: 50, color: 'var(--ink-2)' }}>「{r.note}」</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── 申请成为发起人 (/launcher/apply) ───────── */
function LauncherApplyScreen({ go, toast }) {
  const me = FX_DATA.me;
  const lv = FX_DATA.LEVELS.find(l => l.order === me.levelOrder);
  const canApply = me.levelOrder >= 2;
  const [applied, setApplied] = useState(false);
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!desc.trim()) { toast('请填写个人简介'); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setApplied(true); toast('申请已提交，等待审核'); }, 800);
  };

  if (applied) {
    return (
      <div className="wrap-page fade-up" style={{ maxWidth:600 }}>
        <div className="card" style={{ padding:48, textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>⏳</div>
          <div className="eyebrow" style={{ justifyContent:'center', marginBottom:12 }}>
            <span className="dot" />申请已提交
          </div>
          <h2 style={{ fontSize:22, margin:'0 0 10px' }}>发起人申请审核中</h2>
          <p className="t-sub" style={{ maxWidth:340, margin:'0 auto 24px', lineHeight:1.7 }}>
            你的申请将在 3 个工作日内完成审核，结果将通过系统消息通知告知。
          </p>
          <div style={{ background:'var(--surface-sunk)', borderRadius:'var(--r-md)', padding:'14px 18px',
            display:'flex', alignItems:'center', gap:12, marginBottom:28, textAlign:'left' }}>
            <I.clock size={15} style={{ color:'var(--ink-3)', flex:'none' }} />
            <span className="t-cap" style={{ flex:1 }}>申请时间：2026-06-04 {new Date().toTimeString().slice(0,5)}</span>
            <Chip tone="warn" dot>待审核</Chip>
          </div>
          <Pill variant="ink" noChip onClick={() => go('member-home')} style={{ justifyContent:'center', minWidth:180 }}>返回个人中心</Pill>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-page fade-up" style={{ maxWidth:680 }}>
      <button className="tbtn" onClick={() => go('member-home')} style={{ marginBottom:16 }}>← 返回个人中心</button>
      <PageHead n="发起人" title="申请成为活动发起人" sub="在社区发起属于你的同行" />

      {/* 资格说明 */}
      <div className="card" style={{ padding:24, marginBottom:14 }}>
        <Eyebrow n="权益">成为发起人，你可以</Eyebrow>
        <div className="col" style={{ gap:10, marginTop:16 }}>
          {['在社区发起并管理活动，设置报名规则','审核报名者，决定谁加入你的活动','成功举办活动后获得额外成长积分奖励'].map((t, i) => (
            <div key={i} className="row acenter gap10">
              <span style={{ width:20, height:20, borderRadius:999, background:'var(--good-soft)',
                display:'grid', placeItems:'center', color:'var(--good)', flex:'none' }}>
                <I.check size={12} />
              </span>
              <span className="t-sub">{t}</span>
            </div>
          ))}
        </div>
        <div className="hr" style={{ margin:'18px 0 14px' }} />
        <div className="row between acenter" style={{ flexWrap:'wrap', gap:8 }}>
          <span className="t-sub">申请要求：账号等级 ≥ 同行者（L2）</span>
          <Chip tone={canApply ? 'good' : 'bad'} dot>
            当前 {lv.name}（L{me.levelOrder}）{canApply ? ' · 可申请' : ' · 等级不足'}
          </Chip>
        </div>
        {!canApply && (
          <div style={{ background:'var(--warn-soft)', borderRadius:'var(--r-sm)', padding:'10px 14px', marginTop:12 }}>
            <span className="t-cap" style={{ color:'var(--warn)' }}>
              还需 {FX_DATA.LEVELS.find(l=>l.order===2).min - me.growthPoints} 成长分升至同行者等级
            </span>
          </div>
        )}
      </div>

      {/* 简介输入 */}
      <div className="card" style={{ padding:24, marginBottom:14 }}>
        <Field label="个人简介 *">
          <textarea className="field" rows={5} maxLength={500} disabled={!canApply}
            placeholder="简要介绍你的背景、擅长领域，以及你希望在社区发起什么类型的活动..."
            value={desc} onChange={e => setDesc(e.target.value)}
            style={!canApply ? { opacity:.5, cursor:'not-allowed' } : {}} />
        </Field>
        <div style={{ textAlign:'right', marginTop:6 }}>
          <span className="mono t-cap">{desc.length} / 500 字</span>
        </div>
      </div>

      {/* 须知 */}
      <div className="card sunk" style={{ padding:16, marginBottom:24 }}>
        <div className="col" style={{ gap:8 }}>
          {['申请提交后将由管理员在 3 个工作日内审核','审核结果将通过系统通知告知','一次只能有一个待审核的申请'].map((t, i) => (
            <div key={i} className="row acenter gap8">
              <span style={{ width:4, height:4, borderRadius:999, background:'var(--ink-3)', flex:'none' }} />
              <span className="t-cap">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <Pill variant={canApply ? 'accent' : 'soft'} icon="arrow"
          onClick={submit} disabled={submitting || !canApply}>
          {submitting ? '提交中…' : canApply ? '提交申请' : '等级不足，无法申请'}
        </Pill>
      </div>
    </div>
  );
}

Object.assign(window, { ActivitiesScreen, ExchangeScreen, CreateActivityScreen, LauncherActivitiesScreen, LauncherApplyScreen });
