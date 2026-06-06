// ════════════ 管理后台：仪表盘 · 会员管理 · 活动审核 ════════════

/* ───────── 仪表盘 ───────── */
function AdminDashboardScreen({ go, t, toast }) {
  const D = FX_DATA.dashboard;
  const max = Math.max(...D.trend);
  const stats = [
    { k: '会员总数', v: D.memberCount.toLocaleString(), d: D.memberDelta, ico: 'users', tone: 'info' },
    { k: '进行中活动', v: D.activeActivities, d: D.activityDelta, ico: 'layers', tone: 'cyan' },
    { k: '累计发放积分', v: (D.pointsIssued/1000000).toFixed(2)+'M', d: '+4.3万', ico: 'up', tone: 'good' },
    { k: '本月兑换次数', v: D.exchangeCount, d: D.exchangeDelta, ico: 'gift', tone: 'accent' },
  ];
  return (
    <div className="wrap-page fade-up">
      <PageHead n="后台" title="社区仪表盘" sub="运营数据 · 实时概览"
        action={<div className="row acenter gap8"><span className="pulse-dot" /><span className="t-cap">数据实时更新</span></div>} />
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
        {stats.map((s, i) => {
          const Ico = I[s.ico];
          return (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div className="row between acenter">
                <span style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: `var(--${s.tone}-soft)`, color: `var(--${s.tone})`, display: 'grid', placeItems: 'center' }}><Ico size={17} /></span>
                <Chip tone="good"><I.up size={11} />{typeof s.d === 'number' ? '+'+s.d : s.d}</Chip>
              </div>
              <div className="t-num" style={{ fontSize: 36, marginTop: 14 }}>{s.v}</div>
              <span className="t-cap">{s.k}</span>
            </div>
          );
        })}
      </div>

      <div className="m-grid" style={{ gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)' }}>
        {/* 趋势图 */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row between acenter" style={{ marginBottom: 24 }}>
            <Eyebrow n="趋势">近 7 日新增会员</Eyebrow>
            <span className="t-num" style={{ fontSize: 22 }}>+{D.trend.reduce((a,b)=>a+b,0).toLocaleString()}</span>
          </div>
          <div className="row between" style={{ height: 160, gap: 12, alignItems: 'flex-end' }}>
            {D.trend.map((v, i) => (
              <div key={i} className="col acenter grow gap8" style={{ height: '100%', justifyContent: 'flex-end' }}>
                <span className="mono t-cap" style={{ fontSize: 10 }}>{v}</span>
                <div style={{ width: '100%', maxWidth: 40, borderRadius: '6px 6px 0 0', height: `${(v/max)*100}%`,
                  background: i === D.trend.length - 1 ? 'var(--accent)' : 'var(--ink)',
                  animation: `growBar .7s ${i*0.06}s cubic-bezier(.2,.7,.2,1) both`, transformOrigin: 'bottom' }} />
                <span className="t-cap" style={{ fontSize: 10 }}>{D.trendLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* 等级分布 */}
        <div className="card" style={{ padding: 24 }}>
          <Eyebrow n="结构">会员等级分布</Eyebrow>
          <div className="col gap14" style={{ marginTop: 20 }}>
            {D.levelDist.map((l, i) => (
              <div key={i} className="col gap6">
                <div className="row between acenter">
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{l.name}</span>
                  <span className="mono t-cap">{l.count.toLocaleString()} · {l.pct}%</span>
                </div>
                <Bar pct={l.pct} variant={i === 0 ? '' : i >= 3 ? 'accent' : 'good'} delay={i*80} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 待办 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
        {[
          { n: D.pendingReview, t: '活动待审核', d: '新提交的活动等待发布', dest: 'admin-review', ico: 'layers' },
          { n: D.pendingLaunchers, t: '发起人申请', d: '会员申请成为发起人', dest: 'admin-review', ico: 'flag' },
          { n: D.pendingRegs, t: '报名待处理', d: '跨活动的报名待审核', dest: 'admin-members', ico: 'users' },
        ].map((c, i) => {
          const Ico = I[c.ico];
          return (
            <button key={i} onClick={() => go(c.dest)} className="card hover" style={{ padding: 20, textAlign: 'left', cursor: 'pointer' }}>
              <div className="row between acenter">
                <span style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--surface-sunk)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><Ico size={17} /></span>
                <I.chevR size={16} style={{ color: 'var(--ink-3)' }} />
              </div>
              <div className="row acenter gap8" style={{ marginTop: 14 }}>
                <span className="t-num" style={{ fontSize: 30 }}>{c.n}</span>
                {c.n > 0 && <Chip tone="warn" dot>待处理</Chip>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginTop: 8 }}>{c.t}</div>
              <span className="t-cap">{c.d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── 活动 / 发起人审核 ───────── */
function AdminReviewScreen({ t, toast }) {
  const [tab, setTab] = useState('activity');
  const [acts, setActs] = useState(FX_DATA.adminActivities);
  const [apps, setApps] = useState(FX_DATA.launcherApplies);
  const reviewAct = (id, ok) => { setActs(a => a.filter(x => x.id !== id)); toast(ok ? '活动已发布' : '活动已驳回'); };
  const reviewApp = (id, ok) => { setApps(a => a.filter(x => x.id !== id)); toast(ok ? '已授予发起人权限' : '已拒绝申请'); };

  return (
    <div className="wrap-page fade-up">
      <PageHead n="审核" title="审核中心" sub="活动发布 · 发起人资格" />
      <div className="row gap2" style={{ background: 'var(--surface-sunk)', borderRadius: 999, padding: 3, marginBottom: 20, width: 'fit-content' }}>
        <button className="seg-btn" data-on={tab==='activity'} onClick={() => setTab('activity')}>活动审核 · {acts.length}</button>
        <button className="seg-btn" data-on={tab==='launcher'} onClick={() => setTab('launcher')}>发起人申请 · {apps.length}</button>
      </div>

      {tab === 'activity' ? (
        acts.length === 0 ? <div className="card"><EmptyState icon="check" text="没有待审核的活动了" /></div> :
        <div className="col gap14">
          {acts.map(a => (
            <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="row" style={{ alignItems: 'stretch' }}>
                <div style={{ width: 6, background: a.cover, flex: 'none' }} />
                <div className="grow" style={{ padding: 20 }}>
                  <div className="row between astart wrap gap12">
                    <div className="col gap8 grow">
                      <div className="row gap8 acenter"><Chip tone="">{a.category}</Chip><StatusBadge state={a.state} /></div>
                      <h3 className="t-h3">{a.title}</h3>
                      <p className="t-sub" style={{ margin: 0, maxWidth: 520 }}>{a.desc}</p>
                      <div className="row gap16 wrap" style={{ marginTop: 4 }}>
                        {[['user', a.launcher+' 发起'],['calendar', a.start],['users', a.max+' 人上限'],['clock', '截止 '+a.deadline]].map(([ico,txt],i)=>{
                          const Ico = I[ico];
                          return <div key={i} className="row acenter gap5"><Ico size={13} style={{ color:'var(--ink-3)' }} /><span className="t-cap">{txt}</span></div>;
                        })}
                      </div>
                    </div>
                    <div className="row gap8">
                      <Pill variant="ghost" size="sm" icon="x" noChip onClick={() => reviewAct(a.id, false)}>驳回</Pill>
                      <Pill variant="ink" size="sm" icon="check" onClick={() => reviewAct(a.id, true)}>通过发布</Pill>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        apps.length === 0 ? <div className="card"><EmptyState icon="check" text="没有待处理的申请了" /></div> :
        <div className="col gap14">
          {apps.map(a => (
            <div key={a.id} className="card" style={{ padding: 20 }}>
              <div className="row between astart wrap gap12">
                <div className="row gap12 astart">
                  <span style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--surface-sunk)', display: 'grid', placeItems: 'center', fontWeight: 600, color: 'var(--ink)', flex: 'none' }}>{a.name[0]}</span>
                  <div className="col gap6">
                    <div className="row acenter gap8"><span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{a.name}</span><LevelBadge order={FX_DATA.LEVELS.find(l=>l.name===a.level).order} plain /></div>
                    <span className="mono t-cap">{a.memberNo} · 申请于 {a.time}</span>
                    <p className="t-sub" style={{ margin: '6px 0 0', maxWidth: 480, color: 'var(--ink-2)' }}>「{a.desc}」</p>
                  </div>
                </div>
                <div className="row gap8">
                  <Pill variant="ghost" size="sm" icon="x" noChip onClick={() => reviewApp(a.id, false)}>拒绝</Pill>
                  <Pill variant="accent" size="sm" icon="check" onClick={() => reviewApp(a.id, true)}>授予权限</Pill>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── 会员管理（完善：积分调整抽屉）───────── */
function AdminMembersScreen({ t, toast }) {
  const [q, setQ] = useState('');
  const [members, setMembers] = useState(FX_DATA.members);
  const [drawer, setDrawer] = useState(null); // { member }
  const [adjForm, setAdjForm] = useState({ type:'exchange', amount:'', reason:'' });
  const [adjusting, setAdjusting] = useState(false);
  const list = members.filter(m => m.name.includes(q) || m.no.includes(q));

  const toggle = (no) => {
    setMembers(ms => ms.map(m => m.no === no ? { ...m, status: m.status==='active' ? 'frozen' : 'active' } : m));
    toast('会员状态已更新');
  };

  const openAdj = (m) => {
    setAdjForm({ type:'exchange', amount:'', reason:'' });
    setDrawer(m);
  };

  const doAdjust = () => {
    if (!adjForm.amount || !adjForm.reason.trim()) { toast('请填写完整信息'); return; }
    setAdjusting(true);
    setTimeout(() => {
      const delta = parseInt(adjForm.amount, 10);
      setMembers(ms => ms.map(m => m.no === drawer.no
        ? { ...m, [adjForm.type === 'exchange' ? 'exchange' : 'growth']: m[adjForm.type === 'exchange' ? 'exchange' : 'growth'] + delta }
        : m));
      setAdjusting(false); setDrawer(null);
      toast(`已为 ${drawer.name} 调整积分 ${delta > 0 ? '+' : ''}${delta}`);
    }, 700);
  };

  const adjAfter = drawer
    ? (parseInt(adjForm.amount, 10) || 0) + (adjForm.type === 'exchange' ? drawer.exchange : drawer.growth)
    : 0;

  return (
    <div className="wrap-page fade-up">
      <PageHead n="会员" title="会员管理" sub={`${FX_DATA.dashboard.memberCount.toLocaleString()} 名社区成员`}
        action={
          <div className="field row acenter" style={{ width:240, height:40, padding:'0 14px' }}>
            <I.search size={15} style={{ color:'var(--ink-3)', marginRight:8 }} />
            <input placeholder="搜索姓名 / 编号" value={q} onChange={e => setQ(e.target.value)}
              style={{ border:'none', background:'none', outline:'none', flex:1,
                fontFamily:'inherit', fontSize:13, color:'var(--ink)' }} />
          </div>
        } />
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="adm-row adm-head">
          <span>会员</span><span>等级</span><span className="ar">成长分</span>
          <span className="ar">兑换分</span><span>加入</span><span className="ar">状态 / 操作</span>
        </div>
        <div className="hr" />
        {list.map((m, i) => {
          const lvOrder = FX_DATA.LEVELS.find(l => l.name === m.level)?.order || 1;
          return (
            <div key={m.no} className="adm-row"
              style={{ borderBottom: i < list.length-1 ? '1px solid var(--hairline)' : 'none',
                background: m.status === 'frozen' ? 'var(--bad-soft)' : 'transparent' }}>
              <div className="row gap10 acenter">
                <span style={{ width:34, height:34, borderRadius:999, background:'var(--surface-sunk)',
                  display:'grid', placeItems:'center', fontWeight:600, color:'var(--ink)', flex:'none', fontSize:13 }}>{m.name[0]}</span>
                <div className="col"><span style={{ fontSize:13.5, fontWeight:600, color:'var(--ink)' }}>{m.name}</span><span className="mono t-cap">{m.no}</span></div>
              </div>
              <span><LevelBadge order={lvOrder} plain /></span>
              <span className="ar mono" style={{ color:'var(--good)', fontWeight:600 }}>{m.growth.toLocaleString()}</span>
              <span className="ar mono" style={{ color:'var(--accent-deep)', fontWeight:600 }}>{m.exchange.toLocaleString()}</span>
              <span className="mono t-cap">{m.joined}</span>
              <span className="ar row acenter gap8" style={{ justifyContent:'flex-end' }}>
                {m.status === 'active' ? <Chip tone="good" dot>正常</Chip> : <Chip tone="bad" dot>已冻结</Chip>}
                <button className="tbtn" style={{ fontSize:12 }} onClick={() => openAdj(m)}>调整积分</button>
                <button className="tbtn" style={{ fontSize:12 }} onClick={() => toggle(m.no)}>
                  {m.status === 'active' ? '冻结' : '解冻'}
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {/* 积分调整抽屉 */}
      {drawer && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', justifyContent:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(10,10,10,.3)' }} onClick={() => setDrawer(null)} />
          <div className="glass" style={{ width:'100%', maxWidth:400, position:'relative', height:'100vh',
            padding:'28px 24px', overflowY:'auto', display:'flex', flexDirection:'column', gap:18 }}>
            <div className="row between acenter">
              <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>调整会员积分</h3>
              <button className="icon-btn" onClick={() => setDrawer(null)}><I.x size={16} /></button>
            </div>

            {/* 会员信息 */}
            <div style={{ background:'var(--surface-sunk)', borderRadius:'var(--r-md)', padding:'14px 16px' }}>
              <div className="row acenter gap10">
                <span style={{ width:40, height:40, borderRadius:999, background:'var(--surface)',
                  display:'grid', placeItems:'center', fontWeight:700, fontSize:16 }}>{drawer.name[0]}</span>
                <div className="col gap2">
                  <span style={{ fontWeight:600 }}>{drawer.name}</span>
                  <span className="mono t-cap">{drawer.no}</span>
                </div>
              </div>
              <div className="row gap16" style={{ marginTop:14 }}>
                <div className="col gap2">
                  <span className="t-cap">当前兑换积分</span>
                  <span className="t-num" style={{ fontSize:22, color:'var(--accent-deep)' }}>{drawer.exchange.toLocaleString()}</span>
                </div>
                <div className="vr" />
                <div className="col gap2">
                  <span className="t-cap">当前成长积分</span>
                  <span className="t-num" style={{ fontSize:22, color:'var(--good)' }}>{drawer.growth.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 调整类型 */}
            <div className="col" style={{ gap:7 }}>
              <span className="field-label">调整类型</span>
              <div className="row gap16">
                {[['exchange','兑换积分'], ['growth','成长积分']].map(([v, l]) => (
                  <label key={v} className="row acenter gap6" style={{ cursor:'pointer' }}>
                    <input type="radio" name="adj-type" value={v} checked={adjForm.type===v}
                      onChange={() => setAdjForm(f => ({...f, type:v}))} style={{ accentColor:'var(--accent)' }} />
                    <span style={{ fontSize:14 }}>{l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 数额 */}
            <Field label="调整数额（正数=增加，负数=扣减）">
              <input type="number" className="field" placeholder="+50 或 -20"
                value={adjForm.amount} onChange={e => setAdjForm(f => ({...f, amount:e.target.value}))} />
            </Field>

            {/* 预览余额 */}
            {adjForm.amount && !isNaN(parseInt(adjForm.amount)) && (
              <div style={{ background:'var(--surface-sunk)', borderRadius:'var(--r-sm)', padding:'10px 14px' }}>
                <span className="t-cap">调整后余额：</span>
                <span className="t-num mono" style={{ fontSize:20, color: adjAfter >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                  {adjAfter.toLocaleString()}
                </span>
              </div>
            )}

            {/* 原因 */}
            <Field label="调整原因 *">
              <textarea className="field" rows={3} placeholder="例如：活动参与奖励补发"
                value={adjForm.reason} onChange={e => setAdjForm(f => ({...f, reason:e.target.value}))} />
            </Field>

            <div className="row gap10" style={{ marginTop:'auto' }}>
              <Pill variant="ghost" noChip onClick={() => setDrawer(null)} style={{ flex:1, justifyContent:'center' }}>取消</Pill>
              <Pill variant="ink" noChip onClick={doAdjust} disabled={adjusting} style={{ flex:2, justifyContent:'center' }}>
                {adjusting ? '处理中…' : '确认调整'}
              </Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── 福利管理 (/admin/welfares) ───────── */
function AdminWelfaresScreen({ toast }) {
  const initWelfares = FX_DATA.welfares.map(w => ({ ...w, status: w.stock > 0 ? 'active' : 'soldout' }));
  initWelfares.push({ id:5, title:'GPU 代金券 · 100 元', cost:1200, stock:12, category:'工具', status:'inactive', tag:'off' });
  const [tab, setTab] = useState('active');
  const [welfares, setWelfares] = useState(initWelfares);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState({ title:'', cost:'', stock:'', category:'周边', desc:'' });
  const setF = (k, v) => setForm(f => ({...f, [k]:v}));

  const filtered = tab === 'all' ? welfares
    : tab === 'active' ? welfares.filter(w => w.status === 'active')
    : welfares.filter(w => w.status === 'inactive' || w.status === 'soldout');

  const toggleStatus = (id) => {
    setWelfares(ws => ws.map(w => w.id === id
      ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w));
    toast('福利状态已更新');
  };

  const openEdit = (w) => {
    setForm({ title:w.title, cost:String(w.cost), stock:String(w.stock), category:w.category, desc:'' });
    setDrawer(w);
  };

  const openCreate = () => {
    setForm({ title:'', cost:'', stock:'', category:'周边', desc:'' });
    setDrawer('create');
  };

  const save = () => {
    if (!form.title.trim() || !form.cost || !form.stock) { toast('请填写必填项'); return; }
    if (drawer === 'create') {
      setWelfares(ws => [...ws, { id:Date.now(), ...form, cost:+form.cost, stock:+form.stock, status:'active', tag:'good' }]);
      toast('福利已创建');
    } else {
      setWelfares(ws => ws.map(w => w.id === drawer.id ? { ...w, ...form, cost:+form.cost, stock:+form.stock } : w));
      toast('福利已保存');
    }
    setDrawer(null);
  };

  return (
    <div className="wrap-page fade-up">
      <PageHead n="福利" title="福利管理"
        sub={`${welfares.filter(w=>w.status==='active').length} 件上架`}
        action={<Pill variant="accent" icon="plus" onClick={openCreate}>创建福利</Pill>} />

      <div className="row gap2" style={{ background:'var(--surface-sunk)', borderRadius:999, padding:3,
        marginBottom:20, width:'fit-content' }}>
        {[['active','上架中'], ['inactive','已下架'], ['all','全部']].map(([k, l]) => (
          <button key={k} className="seg-btn" data-on={tab===k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="adm-row adm-head">
          <span>福利名称</span><span>分类</span>
          <span className="ar">积分</span><span className="ar">库存</span>
          <span className="ar">状态</span><span className="ar">操作</span>
        </div>
        <div className="hr" />
        {filtered.length === 0
          ? <EmptyState icon="gift" text="暂无福利" />
          : filtered.map((w, i) => (
            <div key={w.id} className="adm-row"
              style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--hairline)' : 'none' }}>
              <div className="row acenter gap10">
                <span style={{ width:36, height:36, borderRadius:'var(--r-sm)', background:'var(--surface-sunk)',
                  display:'grid', placeItems:'center', flex:'none', fontSize:18 }}>🎁</span>
                <span style={{ fontSize:13.5, fontWeight:550 }}>{w.title}</span>
              </div>
              <Chip tone="">{w.category}</Chip>
              <span className="ar mono" style={{ color:'var(--accent-deep)', fontWeight:600 }}>{w.cost}</span>
              <span className="ar mono" style={{ color: w.stock === 0 ? 'var(--bad)' : 'var(--ink)' }}>{w.stock}</span>
              <span className="ar">
                {w.status === 'soldout' ? <Chip tone="bad" dot>已售罄</Chip>
                  : w.status === 'active' ? <Chip tone="good" dot>上架中</Chip>
                  : <Chip tone="" dot>已下架</Chip>}
              </span>
              <span className="ar row acenter gap8" style={{ justifyContent:'flex-end' }}>
                <button className="tbtn" style={{ fontSize:12 }} onClick={() => openEdit(w)}>编辑</button>
                {w.status !== 'soldout' && (
                  <button className="tbtn"
                    style={{ fontSize:12, color: w.status==='active' ? 'var(--warn)' : 'var(--good)' }}
                    onClick={() => toggleStatus(w.id)}>
                    {w.status === 'active' ? '下架' : '上架'}
                  </button>
                )}
              </span>
            </div>
          ))}
      </div>

      {/* 侧边抽屉 */}
      {drawer && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', justifyContent:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(10,10,10,.3)' }} onClick={() => setDrawer(null)} />
          <div className="glass" style={{ width:'100%', maxWidth:400, position:'relative',
            height:'100vh', padding:'28px 24px', overflowY:'auto',
            display:'flex', flexDirection:'column', gap:16 }}>
            <div className="row between acenter">
              <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>
                {drawer === 'create' ? '创建福利' : '编辑福利'}
              </h3>
              <button className="icon-btn" onClick={() => setDrawer(null)}><I.x size={16} /></button>
            </div>
            <Field label="福利名称 *">
              <input className="field" value={form.title} onChange={e => setF('title', e.target.value)} />
            </Field>
            <div className="col" style={{ gap:7 }}>
              <span className="field-label">分类</span>
              <div className="row gap8 wrap">
                {['周边','虚拟','服务','工具'].map(c => (
                  <button key={c} onClick={() => setF('category', c)} className="pick-chip" data-on={form.category===c}>{c}</button>
                ))}
              </div>
            </div>
            <div className="row gap12">
              <Field label="所需积分 *">
                <input type="number" className="field" value={form.cost} min={1}
                  onChange={e => setF('cost', e.target.value)} />
              </Field>
              <Field label="库存数量 *">
                <input type="number" className="field" value={form.stock} min={0}
                  onChange={e => setF('stock', e.target.value)} />
              </Field>
            </div>
            <Field label="福利描述">
              <textarea className="field" rows={3} value={form.desc}
                onChange={e => setF('desc', e.target.value)} />
            </Field>
            <div className="row gap10" style={{ marginTop:'auto' }}>
              <Pill variant="ghost" noChip onClick={() => setDrawer(null)} style={{ flex:1, justifyContent:'center' }}>取消</Pill>
              <Pill variant="ink" noChip onClick={save} style={{ flex:2, justifyContent:'center' }}>保存</Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── 积分管理 (/admin/points) ───────── */
function AdminPointsScreen({ toast }) {
  const [tab, setTab] = useState('rules');
  const [rules, setRules] = useState(FX_DATA.pointsRules);
  const [editRule, setEditRule] = useState(null);
  const [ruleVal, setRuleVal] = useState('');
  const [txFilter, setTxFilter] = useState('all');

  const toggleRule = (code) => {
    setRules(rs => rs.map(r => r.code === code ? {...r, enabled:!r.enabled} : r));
    toast('规则状态已更新');
  };

  return (
    <div className="wrap-page fade-up">
      <PageHead n="积分" title="积分管理" sub="规则配置与全量流水" />

      <div className="row gap2" style={{ background:'var(--surface-sunk)', borderRadius:999, padding:3,
        marginBottom:20, width:'fit-content' }}>
        <button className="seg-btn" data-on={tab==='rules'} onClick={() => setTab('rules')}>积分规则</button>
        <button className="seg-btn" data-on={tab==='txns'} onClick={() => setTab('txns')}>积分流水</button>
      </div>

      {tab === 'rules' ? (
        <div className="col gap12">
          <div className="card sunk" style={{ padding:'12px 16px' }}>
            <div className="row acenter gap8">
              <I.shield size={14} style={{ color:'var(--info)' }} />
              <span className="t-cap" style={{ color:'var(--ink-2)' }}>
                规则码为系统内置，管理员只可调整积分值和启用/禁用，不允许删除内置规则。
              </span>
            </div>
          </div>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div className="adm-row adm-head">
              <span>规则码</span><span>描述</span><span>类型</span>
              <span className="ar">积分值</span><span className="ar">状态</span><span className="ar">操作</span>
            </div>
            <div className="hr" />
            {rules.map((r, i) => (
              <div key={r.code} className="adm-row"
                style={{ borderBottom: i < rules.length-1 ? '1px solid var(--hairline)' : 'none',
                  opacity: r.enabled ? 1 : .5 }}>
                <span className="mono" style={{ fontSize:11.5, color:'var(--ink-2)' }}>{r.code}</span>
                <span style={{ fontSize:13.5 }}>{r.desc}</span>
                <Chip tone={r.type==='成长' ? 'good' : r.type==='兑换' ? 'accent' : 'info'}>{r.type}</Chip>
                <span className="ar mono" style={{ fontWeight:600,
                  color: String(r.amount).startsWith('-') ? 'var(--bad)' : 'var(--good)' }}>{r.amount}</span>
                <span className="ar">
                  <Chip tone={r.enabled ? 'good' : ''} dot>{r.enabled ? '启用' : '禁用'}</Chip>
                </span>
                <span className="ar row acenter gap8" style={{ justifyContent:'flex-end' }}>
                  {r.amount !== '可变' && (
                    <button className="tbtn" style={{ fontSize:12 }}
                      onClick={() => { setRuleVal(r.amount); setEditRule(r); }}>编辑</button>
                  )}
                  <button className="tbtn"
                    style={{ fontSize:12, color: r.enabled ? 'var(--warn)' : 'var(--good)' }}
                    onClick={() => toggleRule(r.code)}>
                    {r.enabled ? '禁用' : '启用'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="col gap12">
          <div className="row gap2" style={{ background:'var(--surface-sunk)', borderRadius:999, padding:3, width:'fit-content' }}>
            {[['all','全部'], ['growth','成长'], ['exchange','兑换']].map(([k, l]) => (
              <button key={k} className="seg-btn" data-on={txFilter===k} onClick={() => setTxFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div className="adm-row adm-head">
              <span>时间</span><span>成员</span><span>类型</span><span className="ar">金额</span><span>来源</span>
            </div>
            <div className="hr" />
            {FX_DATA.transactions
              .filter(x => txFilter==='all' || x.type===txFilter)
              .map((x, i, arr) => (
                <div key={x.id} className="adm-row"
                  style={{ borderBottom: i < arr.length-1 ? '1px solid var(--hairline)' : 'none' }}>
                  <span className="mono t-cap">{x.time}</span>
                  <div className="row acenter gap8">
                    <span style={{ width:28, height:28, borderRadius:999, background:'var(--surface-sunk)',
                      display:'grid', placeItems:'center', fontWeight:600, fontSize:12 }}>{FX_DATA.me.name[0]}</span>
                    <span style={{ fontSize:13.5, fontWeight:550 }}>{FX_DATA.me.name}</span>
                  </div>
                  <Chip tone={x.type==='growth' ? 'good' : 'accent'}>
                    {x.type === 'growth' ? '成长' : '兑换'}
                  </Chip>
                  <span className="ar mono" style={{ fontWeight:600,
                    color: x.amount > 0 ? 'var(--good)' : 'var(--bad)' }}>
                    {x.amount > 0 ? '+' : ''}{x.amount}
                  </span>
                  <span className="t-cap" style={{ color:'var(--ink-2)', maxWidth:240,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{x.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 编辑规则弹窗 */}
      {editRule && (
        <div style={{ position:'fixed', inset:0, zIndex:9000, display:'grid', placeItems:'center',
          background:'rgba(10,10,10,.4)', backdropFilter:'blur(4px)' }}>
          <div className="glass" style={{ width:360, borderRadius:'var(--r-xl)', padding:28,
            animation:'pop .3s cubic-bezier(.2,.7,.2,1) both' }}>
            <h3 style={{ margin:'0 0 4px' }}>编辑积分规则</h3>
            <span className="mono t-cap" style={{ color:'var(--ink-2)' }}>{editRule.code} · {editRule.desc}</span>
            <div className="col" style={{ gap:14, marginTop:20 }}>
              <Field label="积分值（正数=增加，负数=扣减）">
                <input type="number" className="field" value={ruleVal}
                  onChange={e => setRuleVal(e.target.value)} />
              </Field>
            </div>
            <div className="row gap10" style={{ marginTop:20 }}>
              <Pill variant="ghost" noChip onClick={() => setEditRule(null)} style={{ flex:1, justifyContent:'center' }}>取消</Pill>
              <Pill variant="ink" noChip style={{ flex:2, justifyContent:'center' }}
                onClick={() => {
                  setRules(rs => rs.map(r => r.code === editRule.code ? {...r, amount:ruleVal} : r));
                  setEditRule(null); toast('规则已保存');
                }}>保存</Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── 等级管理 (/admin/levels) ───────── */
function AdminLevelsScreen({ toast }) {
  const memberCounts = [3452, 2442, 1516, 758, 253];
  const [levels, setLevels] = useState(
    FX_DATA.LEVELS.map((l, i) => ({ ...l, members: memberCounts[i] }))
  );
  const [editLv, setEditLv] = useState(null);
  const [lvForm, setLvForm] = useState({ name:'', min:0, priv:'' });

  const openEdit = (l) => {
    setLvForm({ name:l.name, min:l.min, priv:l.priv });
    setEditLv(l);
  };

  const saveLv = () => {
    setLevels(ls => ls.map(l => l.order === editLv.order ? { ...l, ...lvForm, min:+lvForm.min } : l));
    setEditLv(null); toast('等级已保存');
  };

  const total = levels.reduce((s, l) => s + l.members, 0);

  return (
    <div className="wrap-page fade-up">
      <PageHead n="等级" title="等级管理" sub="调整阈值不影响现有会员等级" />

      <div className="card sunk" style={{ padding:'12px 16px', marginBottom:16 }}>
        <div className="row acenter gap8">
          <I.shield size={14} style={{ color:'var(--warn)' }} />
          <span className="t-cap" style={{ color:'var(--ink-2)' }}>
            调整等级阈值后，现有会员等级不会自动降级，仅影响新增成长分后的重新计算。
          </span>
        </div>
      </div>

      {/* 分布可视化 */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <Eyebrow n="分布">会员等级分布</Eyebrow>
        <div className="col" style={{ gap:12, marginTop:16 }}>
          {levels.map((l, i) => (
            <div key={l.order} className="col" style={{ gap:5 }}>
              <div className="row between acenter">
                <div className="row acenter gap8">
                  <span className="mono" style={{ fontSize:11, color:'var(--accent-deep)', width:18 }}>L{l.order}</span>
                  <span style={{ fontSize:13.5, fontWeight:600 }}>{l.name}</span>
                </div>
                <span className="mono t-cap">{l.members.toLocaleString()} 人 · {Math.round(l.members/total*100)}%</span>
              </div>
              <Bar pct={Math.round(l.members/total*100)} delay={i*60}
                variant={i === 0 ? '' : i >= 3 ? 'accent' : 'good'} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="adm-row adm-head">
          <span>等级</span><span>名称</span><span className="ar">最低成长分</span>
          <span className="ar">当前会员数</span><span>特权描述</span><span className="ar">操作</span>
        </div>
        <div className="hr" />
        {levels.map((l, i) => (
          <div key={l.order} className="adm-row"
            style={{ borderBottom: i < levels.length-1 ? '1px solid var(--hairline)' : 'none' }}>
            <span className="mono" style={{ fontWeight:700, color:'var(--accent-deep)' }}>L{l.order}</span>
            <span style={{ fontSize:14, fontWeight:600 }}>{l.name}</span>
            <span className="ar mono" style={{ fontWeight:600 }}>{l.min.toLocaleString()}</span>
            <span className="ar mono" style={{ color:'var(--ink-2)' }}>{l.members.toLocaleString()}</span>
            <span className="t-cap" style={{ maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.priv}</span>
            <span className="ar">
              <button className="tbtn" style={{ fontSize:12 }} onClick={() => openEdit(l)}>编辑</button>
            </span>
          </div>
        ))}
      </div>

      {/* 编辑弹窗 */}
      {editLv && (
        <div style={{ position:'fixed', inset:0, zIndex:9000, display:'grid', placeItems:'center',
          background:'rgba(10,10,10,.4)', backdropFilter:'blur(4px)' }}>
          <div className="glass" style={{ width:420, borderRadius:'var(--r-xl)', padding:28,
            animation:'pop .3s cubic-bezier(.2,.7,.2,1) both' }}>
            <h3 style={{ margin:'0 0 4px' }}>编辑等级</h3>
            <span className="mono t-cap" style={{ color:'var(--ink-2)' }}>L{editLv.order}</span>
            <div className="col" style={{ gap:14, marginTop:20 }}>
              <Field label="等级名称">
                <input className="field" value={lvForm.name}
                  onChange={e => setLvForm(f => ({...f, name:e.target.value}))} />
              </Field>
              <Field label="最低成长分">
                <input type="number" className="field" value={lvForm.min}
                  onChange={e => setLvForm(f => ({...f, min:e.target.value}))} />
              </Field>
              <Field label="特权描述">
                <textarea className="field" rows={2} value={lvForm.priv}
                  onChange={e => setLvForm(f => ({...f, priv:e.target.value}))} />
              </Field>
              <div style={{ background:'var(--warn-soft)', borderRadius:'var(--r-sm)', padding:'10px 12px' }}>
                <span className="t-cap" style={{ color:'var(--warn)' }}>⚠️ 修改阈值不影响现有会员等级</span>
              </div>
            </div>
            <div className="row gap10" style={{ marginTop:20 }}>
              <Pill variant="ghost" noChip onClick={() => setEditLv(null)} style={{ flex:1, justifyContent:'center' }}>取消</Pill>
              <Pill variant="ink" noChip onClick={saveLv} style={{ flex:2, justifyContent:'center' }}>保存</Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  AdminDashboardScreen, AdminReviewScreen, AdminMembersScreen,
  AdminWelfaresScreen, AdminPointsScreen, AdminLevelsScreen,
});
