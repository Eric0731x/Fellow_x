// ════════════ FellowX core components ════════════
const { useState, useEffect, useRef } = React;

/* ───────── 线性图标集（size 由 currentColor + width 控制）───────── */
const Icon = ({ d, size = 16, sw = 1.6, fill, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'}
       stroke={fill ? 'none' : 'currentColor'} strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);
const I = {
  arrow:  (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />,
  arrowR: (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />,
  plus:   (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  check:  (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  x:      (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />,
  fire:   (p) => <Icon {...p}><path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C9 8.5 9 6 12 2z"/><path d="M12 22a5 5 0 0 0 5-5c0-2-1.5-3-2.2-4.2C14 14 13 14.5 12 13c-1.2 2-3 2.5-3 4.5a3 3 0 0 0 3 4.5z"/></Icon>,
  bolt:   (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  star:   (p) => <Icon {...p} d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3z" />,
  coin:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h3.2a1.8 1.8 0 0 1 0 3.6H9.5h3.4a1.8 1.8 0 0 1 0 3.6H9.5"/></Icon>,
  up:     (p) => <Icon {...p} d="M12 19V5M5 12l7-7 7 7" />,
  calendar:(p)=> <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>,
  pin:    (p) => <Icon {...p}><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></Icon>,
  users:  (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.6M21 20a6 6 0 0 0-4-5.6"/></Icon>,
  user:   (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  bell:   (p) => <Icon {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></Icon>,
  grid:   (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Icon>,
  list:   (p) => <Icon {...p} d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  gift:   (p) => <Icon {...p}><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/></Icon>,
  shield: (p) => <Icon {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></Icon>,
  doc:    (p) => <Icon {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></Icon>,
  search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></Icon>,
  sun:    (p) => <Icon {...p}><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></Icon>,
  moon:   (p) => <Icon {...p} d="M21 12.8A8 8 0 1 1 11.2 3a6.3 6.3 0 0 0 9.8 9.8z" />,
  chevR:  (p) => <Icon {...p} d="M9 6l6 6-6 6" />,
  chevD:  (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  trophy: (p) => <Icon {...p}><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3"/></Icon>,
  sparkle:(p) => <Icon {...p} d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" />,
  clock:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  edit:   (p) => <Icon {...p} d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
  logout: (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Icon>,
  layers: (p) => <Icon {...p} d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />,
  flag:   (p) => <Icon {...p} d="M4 21V4M4 4h13l-2 4 2 4H4" />,
};

/* ───────── Pill 药丸按钮 ───────── */
function Pill({ variant = 'ink', size = '', icon, children, noChip, onClick, disabled, type, style }) {
  const Ico = icon && I[icon];
  return (
    <button type={type || 'button'} className={`pill ${variant} ${size} ${noChip || !icon ? 'no-chip' : ''}`}
            onClick={onClick} disabled={disabled} style={style}>
      {Ico && !noChip && <span className="chip"><Ico /></span>}
      <span>{children}</span>
    </button>
  );
}

/* ───────── Eyebrow ───────── */
function Eyebrow({ n, children, accent }) {
  return (
    <div className={`eyebrow ${accent ? 'accent' : ''}`}>
      <span className="dot" />
      {n && <span>{n}</span>}
      {n && <span style={{ opacity: .5 }}>·</span>}
      <span style={{ color: 'var(--ink-2)' }}>{children}</span>
    </div>
  );
}

/* ───────── 进度环 Ring ───────── */
function Ring({ pct = 0, size = 120, stroke = 9, color = 'var(--ink)', track = 'var(--surface-sunk)', children, delay = 0 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [draw, setDraw] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDraw(pct), 80 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={circ}
                strokeDashoffset={circ - (circ * draw) / 100}
                style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* ───────── 进度条 Bar ───────── */
function Bar({ pct = 0, variant = '', thick, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 80 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return <div className={`bar ${variant} ${thick ? 'thick' : ''}`}><i style={{ width: `${w}%` }} /></div>;
}

/* ───────── Chip ───────── */
function Chip({ tone = '', dot, children }) {
  return <span className={`chip-tag ${tone}`}>{dot && <span className="sd" />}{children}</span>;
}

/* ───────── 活动状态徽标 ───────── */
function StatusBadge({ state, reg }) {
  const meta = reg ? FX_DATA.REG_META[state] : FX_DATA.STATE_META[state];
  if (!meta) return null;
  return <span className={`chip-tag ${meta.tone}`}><span className="sd" />{meta.zh}</span>;
}

/* ───────── Logo ───────── */
function Logo({ size = 'md' }) {
  const big = size === 'lg';
  return (
    <div className="row acenter" style={{ gap: 9 }}>
      <span style={{
        width: big ? 30 : 26, height: big ? 30 : 26, borderRadius: 999,
        background: 'var(--ink)', display: 'grid', placeItems: 'center', flex: 'none',
      }}>
        <span style={{ width: big ? 11 : 9, height: big ? 11 : 9, borderRadius: 999,
          background: 'var(--accent)', display: 'block' }} />
      </span>
      <div className="row acenter" style={{ gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: big ? 19 : 16,
          letterSpacing: '-0.03em', color: 'var(--ink)' }}>FellowX</span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.02em' }}>同行社区</span>
      </div>
    </div>
  );
}

/* ───────── 等级徽标 ───────── */
function LevelBadge({ order, name, plain }) {
  const lv = FX_DATA.LEVELS.find(l => l.order === order);
  const nm = name || (lv && lv.name) || '';
  return (
    <span className="chip-tag" style={{
      background: plain ? 'var(--surface-sunk)' : 'var(--ink)',
      color: plain ? 'var(--ink-2)' : 'var(--on-dark)',
      fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', fontSize: 10.5,
    }}>
      <span className="mono" style={{ opacity: .6 }}>L{order}</span>{nm}
    </span>
  );
}

/* ───────── 空状态 ───────── */
function EmptyState({ icon = 'layers', text = '暂无内容', action }) {
  const Ico = I[icon];
  return (
    <div className="col acenter center" style={{ padding: '56px 20px', textAlign: 'center', gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--surface-sunk)',
        display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>
        <Ico size={24} />
      </div>
      <div className="t-sub">{text}</div>
      {action}
    </div>
  );
}

/* ───────── Toast ───────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, tone = '') => {
    const id = Math.random();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  };
  const node = (
    <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999, alignItems: 'center' }}>
      {toasts.map(t => (
        <div key={t.id} className="glass fade-up" style={{
          padding: '11px 18px', borderRadius: 999, fontSize: 13, fontWeight: 550,
          color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center',
            background: t.tone === 'bad' ? 'var(--bad)' : 'var(--accent)', color: '#fff' }}>
            {t.tone === 'bad' ? <I.x size={11} /> : <I.check size={11} />}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return [push, node];
}

/* ───────── 二次确认弹窗 ConfirmDialog ───────── */
function ConfirmDialog({ title, content, danger, confirmText, onCancel, onConfirm, loading }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, display:'grid', placeItems:'center',
      background:'rgba(10,10,10,.45)', backdropFilter:'blur(5px)' }}>
      <div className="glass" onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:380,
        borderRadius:'var(--r-xl)', padding:'28px 24px', animation:'pop .3s cubic-bezier(.2,.7,.2,1) both' }}>
        <h3 style={{ margin:'0 0 10px', fontSize:17, color: danger ? 'var(--bad)' : 'var(--ink)' }}>
          {danger && <span style={{ marginRight:6 }}>⚠️</span>}{title}
        </h3>
        <p className="t-sub" style={{ margin:'0 0 24px', lineHeight:1.6 }}>{content}</p>
        <div className="row gap10" style={{ justifyContent:'flex-end' }}>
          <Pill variant="ghost" noChip onClick={onCancel} disabled={loading}>取消</Pill>
          <Pill variant="ghost" noChip disabled={loading} onClick={onConfirm}
            style={danger ? { color:'var(--bad)', borderColor:'var(--bad)' } : { background:'var(--ink)', color:'var(--on-dark)', border:'none' }}>
            {loading ? '处理中…' : (confirmText || (danger ? '确认' : '确认'))}
          </Pill>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, I, Pill, Eyebrow, Ring, Bar, Chip, StatusBadge, Logo, LevelBadge, EmptyState, useToast, ConfirmDialog,
});
