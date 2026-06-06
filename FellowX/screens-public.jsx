// ════════════ 公开页面：着陆页 + 登录/注册 ════════════

/* ───────── 着陆页 ───────── */
function LandingScreen({ go, t }) {
  const D = FX_DATA;
  const featured = D.activities.filter(a => ['REGISTRATION_OPEN','IN_PROGRESS','PUBLISHED'].includes(a.state)).slice(0, 3);
  return (
    <div className="fade-up">
      {/* Hero — 亮 */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 28px 40px' }}>
        <Eyebrow n="001" accent>面向 AI 从业者的同行社区</Eyebrow>
        <h1 className="t-hero" style={{ margin: '22px 0 0', maxWidth: 820 }}>
          把每一次同行，<br />变成离<span style={{ color: 'var(--accent)' }}>下一步</span>更近的一天。
        </h1>
        <p className="t-body" style={{ fontSize: 16, maxWidth: 520, marginTop: 22, lineHeight: 1.6 }}>
          共学、精读、闭门会与线下沙龙。用成长积分记录坚持，用兑换积分回馈投入——
          噪音全部拿掉之后，坚持本身就足够好看。
        </p>
        <div className="row gap12 wrap" style={{ marginTop: 30 }}>
          <Pill variant="accent" size="lg" icon="arrow" onClick={() => go('register')}>免费加入社区</Pill>
          <Pill variant="ghost" size="lg" icon="grid" onClick={() => go('activities')}>浏览全部活动</Pill>
        </div>
        {/* 关键数字带 */}
        <div className="row gap32 wrap" style={{ marginTop: 52 }}>
          {[['8,421','活跃会员'],['1.28M','已发放成长分'],['340+','场已举办活动'],['96%','正向反馈']].map(([n, l], i) => (
            <div key={i} className="col" style={{ gap: 4 }}>
              <span className="t-num" style={{ fontSize: 40 }}>{n}</span>
              <span className="t-cap">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 精选活动 — 暗段（切入圆角）*/}
      <section style={{ background: 'var(--ink)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', marginTop: 28 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '52px 28px 60px', color: 'var(--on-dark)' }}>
          <div className="row between acenter wrap" style={{ gap: 16 }}>
            <div>
              <div className="eyebrow accent" style={{ color: 'rgba(250,250,249,.5)' }}><span className="dot" />002 · 正在进行</div>
              <h2 className="t-h2" style={{ color: 'var(--on-dark)', marginTop: 12 }}>本期精选共学</h2>
            </div>
            <button className="tbtn" style={{ color: 'rgba(250,250,249,.7)' }} onClick={() => go('activities')}>查看全部 →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 28 }}>
            {featured.map((a, i) => <ActivityCard key={a.id} a={a} t={t} dark onClick={() => go('activity', a.id)} delay={i * 60} />)}
          </div>
        </div>
      </section>

      {/* 如何运转 — 亮 */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '60px 28px 80px' }}>
        <div className="eyebrow"><span className="dot" />003 · 双轨积分</div>
        <h2 className="t-h2" style={{ marginTop: 12 }}>投入有回响，成长留痕迹</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 28 }}>
          {[
            { ico:'up', tone:'good', t:'成长积分 · 只增不减', d:'参与、精读、互评都会累积成长分，决定你的社区等级，是坚持的刻度。' },
            { ico:'coin', tone:'accent', t:'兑换积分 · 可以消费', d:'用兑换积分换工具会员、算力券与导师咨询，让投入有实在的回响。' },
            { ico:'fire', tone:'warn', t:'连击与徽章', d:'连续活跃点亮连击火焰，里程碑解锁徽章墙——激励而非施压。' },
          ].map((c, i) => {
            const Ico = I[c.ico];
            return (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', background: `var(--${c.tone}-soft)`,
                  color: `var(--${c.tone})`, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  <Ico size={20} />
                </div>
                <h3 className="t-h3" style={{ marginBottom: 8 }}>{c.t}</h3>
                <p className="t-body" style={{ margin: 0 }}>{c.d}</p>
              </div>
            );
          })}
        </div>
        {/* CTA 条 */}
        <div className="card ink" style={{ marginTop: 40, padding: '36px 32px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 className="t-h2" style={{ color: 'var(--on-dark)' }}>准备好找到你的同行了吗？</h2>
            <p className="t-body" style={{ marginTop: 8 }}>三十秒注册，今天就开始累积你的第一份成长分。</p>
          </div>
          <Pill variant="accent" size="lg" icon="arrow" onClick={() => go('register')}>立即加入</Pill>
        </div>
      </section>
    </div>
  );
}

/* ───────── 认证：登录 / 注册共用外壳 ───────── */
function AuthScreen({ mode, go, onAuth }) {
  const isReg = mode === 'register';
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (isReg && !form.name.trim()) e.name = '请输入姓名';
    if (!/^1[3-9]\d{9}$/.test(form.phone)) e.phone = '手机号格式不正确';
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/.test(form.password)) e.password = '密码需 6-20 位且含字母和数字';
    if (isReg && form.confirm !== form.password) e.confirm = '两次密码输入不一致';
    setErr(e);
    return Object.keys(e).length === 0;
  };
  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 800);
  };

  return (
    <div className="row" style={{ minHeight: 'calc(100vh - 61px)' }}>
      {/* 左：表单 */}
      <div className="col center" style={{ flex: '1 1 460px', padding: '40px 28px' }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="fade-up">
          <Eyebrow n={isReg ? '注册' : '登录'} accent>{isReg ? '加入 FellowX' : '欢迎回来'}</Eyebrow>
          <h1 className="t-h2" style={{ fontSize: 30, margin: '16px 0 6px' }}>
            {isReg ? '创建你的同行账号' : '继续你的同行之路'}
          </h1>
          <p className="t-sub" style={{ marginBottom: 28 }}>
            {isReg ? '已经是会员了？' : '还没有账号？'}
            <button className="tbtn" style={{ color: 'var(--accent-deep)', padding: '0 4px' }}
              onClick={() => go(isReg ? 'login' : 'register')}>{isReg ? '去登录' : '去注册'}</button>
          </p>
          <form onSubmit={submit} className="col" style={{ gap: 18 }}>
            {isReg && (
              <Field label="姓名" err={err.name}>
                <input className={`field ${err.name ? 'err' : ''}`} placeholder="你希望同行如何称呼你"
                  value={form.name} onChange={set('name')} />
              </Field>
            )}
            <Field label="手机号" err={err.phone}>
              <input className={`field ${err.phone ? 'err' : ''}`} placeholder="11 位手机号" inputMode="numeric"
                value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="密码" err={err.password}>
              <input type="password" className={`field ${err.password ? 'err' : ''}`} placeholder="6-20 位，含字母和数字"
                value={form.password} onChange={set('password')} />
            </Field>
            {isReg && (
              <Field label="确认密码" err={err.confirm}>
                <input type="password" className={`field ${err.confirm ? 'err' : ''}`} placeholder="再次输入密码"
                  value={form.confirm} onChange={set('confirm')} />
              </Field>
            )}
            <button type="submit" disabled={loading}
              className="pill accent no-chip" style={{ height: 48, justifyContent: 'center', fontSize: 15, marginTop: 4 }}>
              {loading ? '请稍候…' : (isReg ? '创建账号' : '登录')}
            </button>
          </form>
          <p className="t-cap" style={{ marginTop: 18, textAlign: 'center' }}>
            登录即代表同意《社区公约》与《隐私政策》
          </p>
        </div>
      </div>
      {/* 右：暗色品牌侧 */}
      <div className="auth-aside col between" style={{ flex: '1 1 420px', background: 'var(--ink)',
        color: 'var(--on-dark)', padding: '48px 44px', position: 'relative', overflow: 'hidden' }}>
        <Logo size="lg" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="eyebrow accent" style={{ color: 'rgba(250,250,249,.5)' }}><span className="dot" />素笺</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.5, letterSpacing: '-0.01em',
            margin: '18px 0 0', color: 'var(--on-dark)', maxWidth: 340 }}>
            「把噪音全部拿掉之后，坚持本身就足够好看。」
          </p>
          <div className="row gap24" style={{ marginTop: 40 }}>
            {[['12','连续打卡天'],['3,160','我的成长分'],['L3','当前等级']].map(([n, l], i) => (
              <div key={i} className="col gap4">
                <span className="t-num" style={{ fontSize: 30, color: 'var(--on-dark)' }}>{n}</span>
                <span className="t-cap" style={{ color: 'rgba(250,250,249,.5)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* 装饰大圆点 */}
        <div style={{ position: 'absolute', right: -120, top: -120, width: 320, height: 320, borderRadius: 999,
          border: '1px solid rgba(250,250,249,.08)' }} />
        <div style={{ position: 'absolute', right: 40, top: 90, width: 12, height: 12, borderRadius: 999,
          background: 'var(--accent)' }} />
      </div>
    </div>
  );
}

function Field({ label, err, children }) {
  return (
    <label className="col" style={{ gap: 0 }}>
      <span className="field-label">{label}</span>
      {children}
      {err && <span className="field-err"><I.x size={12} />{err}</span>}
    </label>
  );
}

Object.assign(window, { LandingScreen, AuthScreen, Field });
