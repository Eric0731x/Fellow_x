// ════════════ FellowX App 外壳：路由 · 角色 · 主题 · Tweaks ════════════
const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardStyle": "hairline",
  "pointsViz": "rings",
  "gamification": true,
  "navStyle": "tabs",
  "accent": "#ea580c"
}/*EDITMODE-END*/;

// 角色 → 可访问页面
const ROLE_NAV = {
  guest:    [['landing','首页'],['activities','活动']],
  member:   [['member-home','个人中心'],['activities','活动'],['points','我的积分'],['exchange','兑换商城']],
  launcher: [['member-home','个人中心'],['launcher-activities','我的活动'],['activities','活动'],['exchange','兑换商城']],
  admin:    [['admin-dashboard','仪表盘'],['admin-review','审核中心'],['admin-members','会员管理'],['admin-welfares','福利'],['admin-points','积分'],['admin-levels','等级']],
};
const ROLE_LABEL = { guest: '游客', member: '会员', launcher: '发起人', admin: '管理员' };
const ROLE_HOME  = { guest: 'landing', member: 'member-home', launcher: 'member-home', admin: 'admin-dashboard' };
const ROLE_ICON  = { guest: 'user', member: 'star', launcher: 'flag', admin: 'shield' };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [role, setRole] = useS('guest');
  const [route, setRoute] = useS({ name: 'landing', param: null });
  const [theme, setTheme] = useS('light');
  const [font, setFont] = useS('manrope');
  const [toast, toastNode] = useToast();
  const [profileModal, setProfileModal] = useS(false);

  // 主题 / 字体 / 强调色 同步到 <html>
  useE(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useE(() => { document.documentElement.setAttribute('data-font', font); }, [font]);
  useE(() => {
    if (t.accent) {
      document.documentElement.style.setProperty('--accent', t.accent);
      document.documentElement.style.setProperty('--accent-deep', t.accent);
    }
  }, [t.accent]);

  const go = (name, param = null) => { setRoute({ name, param }); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const isAuthed = role !== 'guest';

  const switchRole = (r) => {
    setRole(r);
    go(ROLE_HOME[r]);
  };

  const onRegister = () => {
    setRole('member');
    go('member-home');
    toast('欢迎加入 FellowX');
    setTimeout(() => setProfileModal(true), 400);
  };

  // 路由表
  const render = () => {
    const p = { go, t, toast, isAuthed };
    switch (route.name) {
      case 'landing':     return <LandingScreen {...p} />;
      case 'login':       return <AuthScreen mode="login" go={go} onAuth={() => { setRole('member'); go('member-home'); toast('登录成功'); }} />;
      case 'register':    return <AuthScreen mode="register" go={go} onAuth={onRegister} />;
      case 'activities':  return <ActivitiesScreen {...p} />;
      case 'activity':    return <ActivityDetailScreen id={route.param} {...p} />;
      case 'member-home':       return <MemberHomeScreen {...p} role={role} />;
      case 'points':             return <PointsScreen {...p} />;
      case 'exchange':           return <ExchangeScreen {...p} />;
      case 'me-edit':            return <EditProfileScreen {...p} />;
      case 'me-registrations':   return <RegistrationsScreen {...p} />;
      case 'create-activity':    return <CreateActivityScreen {...p} />;
      case 'launcher-activities':return <LauncherActivitiesScreen {...p} />;
      case 'launcher-apply':     return <LauncherApplyScreen {...p} />;
      case 'admin-dashboard':    return <AdminDashboardScreen {...p} />;
      case 'admin-review':       return <AdminReviewScreen {...p} />;
      case 'admin-members':      return <AdminMembersScreen {...p} />;
      case 'admin-welfares':     return <AdminWelfaresScreen {...p} />;
      case 'admin-points':       return <AdminPointsScreen {...p} />;
      case 'admin-levels':       return <AdminLevelsScreen {...p} />;
      default: return <LandingScreen {...p} />;
    }
  };

  const navItems = ROLE_NAV[role];
  const ThemeIco = theme === 'light' ? I.moon : I.sun;

  return (
    <div>
      {/* ── 顶栏 ── */}
      <header className="topbar">
        <button onClick={() => go(ROLE_HOME[role])} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Logo />
        </button>

        {/* 桌面导航 */}
        <nav className="desktop-nav row gap2" style={{ marginLeft: 8 }}>
          {navItems.map(([name, label]) => (
            <button key={name} className="nav-link"
              data-on={route.name === name || (name === 'activities' && route.name === 'activity')}
              onClick={() => go(name)}>{label}</button>
          ))}
        </nav>

        <div className="mauto row acenter gap10">
          {/* 角色切换器 */}
          <div className="role-switch" title="切换体验角色">
            {Object.keys(ROLE_LABEL).map(r => {
              const Ico = I[ROLE_ICON[r]];
              return (
                <button key={r} data-on={role === r} onClick={() => switchRole(r)}>
                  <Ico size={13} /><span className="lbl">{ROLE_LABEL[r]}</span>
                </button>
              );
            })}
          </div>

          {/* 字体切换 */}
          <div className="desktop-nav row gap2" style={{ background: 'var(--surface-sunk)', borderRadius: 999, padding: 3 }}>
            {[['manrope','Aa'],['hei','黑'],['serif','宋']].map(([k, l]) => (
              <button key={k} className="seg-btn" data-on={font === k} onClick={() => setFont(k)}
                style={{ fontFamily: k === 'serif' ? 'var(--font-serif)' : k === 'hei' ? 'PingFang SC, sans-serif' : 'var(--font-display)', minWidth: 30 }}>{l}</button>
            ))}
          </div>

          {/* 主题 */}
          <button className="icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="切换明暗">
            <ThemeIco size={16} />
          </button>

          {/* 认证态 */}
          {isAuthed ? (
            <button className="icon-btn" onClick={() => { setRole('guest'); go('landing'); toast('已退出登录'); }} title="退出">
              <I.logout size={16} />
            </button>
          ) : (
            <Pill variant="ink" size="sm" icon="arrow" noChip onClick={() => go('login')}>登录</Pill>
          )}
        </div>
      </header>

      {/* 移动端导航条 */}
      <nav className="mobile-nav" style={{ position: 'sticky', top: 60, zIndex: 90, background: 'var(--surface-glass)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--hairline)', padding: '8px 14px',
        display: 'none', gap: 4, overflowX: 'auto' }} id="mobnav">
        {navItems.map(([name, label]) => (
          <button key={name} className="nav-link" data-on={route.name === name}
            onClick={() => go(name)} style={{ flex: 'none' }}>{label}</button>
        ))}
      </nav>

      {/* ── 主体 ── */}
      <main key={route.name + (route.param || '')}>{render()}</main>

      {/* 页脚 */}
      {['landing','activities'].includes(route.name) && (
        <footer className="foot">
          <div className="col acenter gap10">
            <Logo />
            <p className="t-cap" style={{ maxWidth: 380, lineHeight: 1.6 }}>
              FellowX · 面向 AI 社区的会员管理与激励系统 — 小程序 + 网页端双端
            </p>
            <p className="t-cap" style={{ opacity: .6 }}>素笺设计语言 · 黑白为骨，单色为魂</p>
          </div>
        </footer>
      )}

      {toastNode}

      {/* ── 资料完善弹窗 ── */}
      {profileModal && (
        <ProfileCompletionModal
          onSkip={() => setProfileModal(false)}
          onSave={() => { setProfileModal(false); toast('资料已保存，+5 成长分 🎉'); }}
        />
      )}

      {/* ── Tweaks ── */}
      <TweaksPanel>
        <TweakSection label="视觉变体" />
        <TweakRadio label="活动卡样式" value={t.cardStyle}
          options={['hairline', 'cover', 'status']}
          onChange={(v) => setTweak('cardStyle', v)} />
        <TweakRadio label="积分可视化" value={t.pointsViz}
          options={['rings', 'bignum', 'orbit']}
          onChange={(v) => setTweak('pointsViz', v)} />
        <TweakSection label="激励元素" />
        <TweakToggle label="游戏化（连击/徽章）" value={t.gamification}
          onChange={(v) => setTweak('gamification', v)} />
        <TweakSection label="品牌" />
        <TweakColor label="强调色" value={t.accent}
          options={['#ea580c', '#dc2626', '#2563eb', '#059669', '#7c3aed']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakButton label="预览角色" onClick={() => switchRole(role === 'admin' ? 'guest' : role === 'guest' ? 'member' : role === 'member' ? 'launcher' : 'admin')}>
          切换到下一个角色
        </TweakButton>
      </TweaksPanel>
    </div>
  );
}

// 移动端导航显隐
const mq = window.matchMedia('(max-width: 760px)');
function syncMob() { const n = document.getElementById('mobnav'); if (n) n.style.display = mq.matches ? 'flex' : 'none'; }
mq.addEventListener('change', syncMob);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
setTimeout(syncMob, 100);
