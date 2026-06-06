// ════════════ FellowX mock data ════════════
// 一个面向 AI 社区的会员管理与激励系统的演示数据

window.FX_DATA = (function () {

  const LEVELS = [
    { order: 1, name: '萌新',   min: 0,     priv: '社区浏览 · 活动报名' },
    { order: 2, name: '同行者', min: 500,   priv: '专属共学 · 优先报名' },
    { order: 3, name: '实践家', min: 1500,  priv: '发起活动 · 福利 8 折' },
    { order: 4, name: '布道者', min: 4000,  priv: '导师对接 · 线下沙龙' },
    { order: 5, name: '核心',   min: 9000,  priv: '决策共建 · 全部特权' },
  ];

  const me = {
    name: '林知秋', phone: '138****6021', memberNo: 'FX-002184',
    avatar: '知', role: 'launcher',
    exchangePoints: 1280, growthPoints: 3160,
    levelOrder: 3, joinedDays: 214, streak: 12,
    activitiesJoined: 23, activitiesLaunched: 6, badgesEarned: 9,
    gender: 'MALE', birthday: '1995-08-15', email: 'linzhiqiu@example.com',
  };

  // 活动状态：DRAFT PENDING_REVIEW PUBLISHED REGISTRATION_OPEN IN_PROGRESS ENDED REJECTED CANCELLED
  const activities = [
    { id: 1, title: 'Agent 工作流共创营 · 第 7 期', category: '共学', cover: '#0a0a0a',
      desc: '六周，把一个真实业务流程拆成可编排的 Agent。每周一次直播 + 作业互评。',
      location: '线上 · 飞书会议', state: 'REGISTRATION_OPEN', hot: true,
      registered: 184, max: 240, deadline: '06-12', start: '06-15', end: '07-27',
      launcher: '林知秋', minLevel: 2, days: 42 },
    { id: 2, title: '把论文读成产品 · RAG 精读会', category: '精读', cover: '#1d4ed8',
      desc: '每两周精读一篇检索增强生成的关键论文，落到一个可跑的最小实现。',
      location: '线上 · 腾讯会议', state: 'IN_PROGRESS',
      registered: 96, max: 120, deadline: '已截止', start: '05-20', end: '08-20',
      launcher: '陈牧', minLevel: 3, days: 92 },
    { id: 3, title: 'AI 创业者周末闭门会 · 北京站', category: '线下', cover: '#c2410c',
      desc: '12 位早期创始人，半天结构化交流 + 半天一对一约谈，只谈真问题。',
      location: '北京 · 朝阳区', state: 'PUBLISHED',
      registered: 0, max: 12, deadline: '06-20', start: '06-28', end: '06-28',
      launcher: '林知秋', minLevel: 4, days: 1 },
    { id: 4, title: '提示词工程实战训练 · 入门', category: '训练', cover: '#0e7490',
      desc: '七天，每天一个真实任务，把直觉变成可复用的提示词方法论。',
      location: '线上 · 社群', state: 'ENDED',
      registered: 320, max: 320, deadline: '已结束', start: '04-01', end: '04-08',
      launcher: '苏黎', minLevel: 1, days: 7 },
    { id: 5, title: '多模态模型选型工作坊', category: '共学', cover: '#15803d',
      desc: '横评主流多模态模型，建立一套自己团队能用的选型评估表。',
      location: '上海 · 徐汇', state: 'PENDING_REVIEW',
      registered: 0, max: 40, deadline: '06-25', start: '07-05', end: '07-05',
      launcher: '林知秋', minLevel: 2, days: 1 },
    { id: 6, title: '草稿：年度社区共学规划', category: '共学', cover: '#525252',
      desc: '把明年的共学路线图摊开，邀请核心成员一起填。',
      location: '待定', state: 'DRAFT',
      registered: 0, max: 60, deadline: '—', start: '—', end: '—',
      launcher: '林知秋', minLevel: 3, days: 0 },
  ];

  const welfares = [
    { id: 1, title: 'Claude Pro 月度会员', cost: 800, stock: 24, category: '工具', tag: 'good' },
    { id: 2, title: '社区定制笔记本 · 素笺', cost: 320, stock: 0, category: '周边', tag: 'bad' },
    { id: 3, title: '导师 1v1 咨询券 · 30min', cost: 1500, stock: 8, category: '服务', tag: 'good' },
    { id: 4, title: 'GPU 算力券 · 50 元', cost: 600, stock: 56, category: '工具', tag: 'good' },
  ];

  const badges = [
    { id:1, name:'首次报名', icon:'🎯', got:true,  hint:'完成第一次活动报名' },
    { id:2, name:'七日连击', icon:'🔥', got:true,  hint:'连续 7 天打卡' },
    { id:3, name:'精读十篇', icon:'📚', got:true,  hint:'累计精读 10 篇论文' },
    { id:4, name:'首次发起', icon:'🚀', got:true,  hint:'发起第一场活动' },
    { id:5, name:'破百影响', icon:'💯', got:true,  hint:'单场活动报名破百' },
    { id:6, name:'乐于助人', icon:'🤝', got:true,  hint:'作业互评 20 次' },
    { id:7, name:'夜猫子', icon:'🌙', got:true,  hint:'深夜提交 5 次作业' },
    { id:8, name:'连击 30', icon:'⚡', got:true,  hint:'连续 30 天活跃' },
    { id:9, name:'布道者', icon:'📡', got:true,  hint:'晋升至布道者等级' },
    { id:10, name:'满勤季', icon:'🏆', got:false, hint:'一个季度全勤' },
    { id:11, name:'千分达人', icon:'💎', got:false, hint:'兑换积分累计破千' },
    { id:12, name:'核心共建', icon:'👑', got:false, hint:'晋升至核心等级' },
  ];

  // 积分流水：type growth/exchange, +/-
  const transactions = [
    { id:1, title:'完成「RAG 精读会」第 6 次', type:'growth', amount:+120, time:'06-03 09:12' },
    { id:2, title:'兑换 GPU 算力券 · 50 元', type:'exchange', amount:-600, time:'06-02 21:40' },
    { id:3, title:'连续打卡 12 天 · 连击奖励', type:'growth', amount:+60, time:'06-02 08:01' },
    { id:4, title:'发起「Agent 工作流共创营」获批', type:'growth', amount:+300, time:'05-30 16:22' },
    { id:5, title:'作业互评 ×3', type:'growth', amount:+30, time:'05-29 23:50' },
    { id:6, title:'兑换 Claude Pro 月度会员', type:'exchange', amount:-800, time:'05-28 12:05' },
    { id:7, title:'活动签到 · RAG 精读会', type:'exchange', amount:+50, time:'05-27 19:30' },
    { id:8, title:'精读论文提交 · 第 5 篇', type:'growth', amount:+120, time:'05-25 22:14' },
  ];

  // 发起人收到的报名（待审核）
  const registrations = [
    { id:1, name:'周屿', memberNo:'FX-004021', level:'实践家', time:'06-03 10:22', state:'PENDING', note:'做检索系统两年，想系统补 Agent 编排。' },
    { id:2, name:'许见', memberNo:'FX-003988', level:'同行者', time:'06-03 09:55', state:'PENDING', note:'独立开发者，正在做一个写作 Agent。' },
    { id:3, name:'康宁', memberNo:'FX-004102', level:'同行者', time:'06-02 22:10', state:'APPROVED', note:'希望和同行交流落地经验。' },
    { id:4, name:'叶澜', memberNo:'FX-002756', level:'布道者', time:'06-02 18:33', state:'APPROVED', note:'带团队来学，争取内训复用。' },
    { id:5, name:'安和', memberNo:'FX-004233', level:'萌新', time:'06-02 14:09', state:'REJECTED', note:'刚入门，先观望。' },
  ];

  // 后台待审核
  const adminActivities = activities.filter(a => a.state === 'PENDING_REVIEW').concat([
    { id:7, title:'开源模型微调闭门工作坊', category:'训练', launcher:'郑也', state:'PENDING_REVIEW',
      max:30, start:'07-12', desc:'用一块消费级显卡跑通一次完整微调。', days:1, registered:0, deadline:'07-08', cover:'#7c3aed' },
  ]);

  const launcherApplies = [
    { id:1, name:'郑也', memberNo:'FX-003120', level:'实践家', time:'06-03 08:40', state:'PENDING',
      desc:'连续组织过 4 期线下读书会，想把 AI 微调系列长期做下去。' },
    { id:2, name:'温故', memberNo:'FX-002901', level:'布道者', time:'06-02 19:12', state:'PENDING',
      desc:'高校老师，希望把课程内容沉淀成社区共学。' },
  ];

  const dashboard = {
    memberCount: 8421, memberDelta: +312,
    activeActivities: 17, activityDelta: +3,
    pointsIssued: 1284600, pointsDelta: +42800,
    exchangeCount: 936, exchangeDelta: +57,
    // 近 7 日新增会员
    trend: [120, 168, 142, 205, 188, 264, 312],
    trendLabels: ['周一','周二','周三','周四','周五','周六','周日'],
    pendingReview: 4, pendingLaunchers: 2, pendingRegs: 23,
    levelDist: [
      { name:'萌新', pct: 41, count: 3452 },
      { name:'同行者', pct: 29, count: 2442 },
      { name:'实践家', pct: 18, count: 1516 },
      { name:'布道者', pct: 9, count: 758 },
      { name:'核心', pct: 3, count: 253 },
    ],
  };

  const members = [
    { name:'周屿', no:'FX-004021', level:'实践家', growth:1820, exchange:640, joined:'2025-11', status:'active' },
    { name:'许见', no:'FX-003988', level:'同行者', growth:920, exchange:210, joined:'2025-09', status:'active' },
    { name:'康宁', no:'FX-004102', level:'同行者', growth:780, exchange:80, joined:'2026-01', status:'active' },
    { name:'叶澜', no:'FX-002756', level:'布道者', growth:5240, exchange:1900, joined:'2024-12', status:'active' },
    { name:'安和', no:'FX-004233', level:'萌新', growth:120, exchange:40, joined:'2026-05', status:'frozen' },
    { name:'郑也', no:'FX-003120', level:'实践家', growth:2380, exchange:980, joined:'2025-06', status:'active' },
  ];

  // 当前用户的报名记录
  const memberRegistrations = [
    { id:1, actId:1, actTitle:'Agent 工作流共创营 · 第 7 期',
      actTime:'06-15 → 07-27', actLocation:'线上 · 飞书会议', state:'APPROVED', regTime:'06-03 10:00' },
    { id:2, actId:3, actTitle:'AI 创业者周末闭门会 · 北京站',
      actTime:'06-28', actLocation:'北京 · 朝阳区', state:'PENDING', regTime:'06-04 09:15' },
    { id:3, actId:4, actTitle:'提示词工程实战训练 · 入门',
      actTime:'04-01 → 04-08', actLocation:'线上 · 社群', state:'REJECTED', regTime:'03-28 14:20',
      rejectReason:'名额已满，将在下期优先通知你。' },
    { id:4, actId:2, actTitle:'把论文读成产品 · RAG 精读会',
      actTime:'05-20 → 08-20', actLocation:'线上 · 腾讯会议', state:'CANCELLED', regTime:'05-18 16:45' },
  ];

  // 积分规则
  const pointsRules = [
    { code:'ACTIVITY_JOIN',   desc:'参与活动完成',   type:'成长', amount:'+120', enabled:true },
    { code:'ACTIVITY_JOIN_E', desc:'参与活动完成',   type:'兑换', amount:'+50',  enabled:true },
    { code:'ACTIVITY_LAUNCH', desc:'发起活动获批',   type:'成长', amount:'+300', enabled:true },
    { code:'CANCEL_APPROVED', desc:'取消已通过报名', type:'成长', amount:'-50',  enabled:true },
    { code:'DAILY_LOGIN',     desc:'每日签到',       type:'兑换', amount:'+10',  enabled:true },
    { code:'ADMIN_ADJUST',    desc:'管理员手动调整', type:'两者', amount:'可变',  enabled:true },
  ];

  const STATE_META = {
    DRAFT:             { zh:'草稿',   tone:'',     },
    PENDING_REVIEW:    { zh:'待审核', tone:'warn', },
    PUBLISHED:         { zh:'已发布', tone:'info', },
    REGISTRATION_OPEN: { zh:'报名中', tone:'good', },
    IN_PROGRESS:       { zh:'进行中', tone:'cyan', },
    ENDED:             { zh:'已结束', tone:'',     },
    REJECTED:          { zh:'已驳回', tone:'bad',  },
    CANCELLED:         { zh:'已取消', tone:'',     },
  };
  const REG_META = {
    PENDING:  { zh:'待审核', tone:'warn' },
    APPROVED: { zh:'已通过', tone:'good' },
    REJECTED: { zh:'已拒绝', tone:'bad'  },
    CANCELLED:{ zh:'已取消', tone:''     },
  };

  return { LEVELS, me, activities, welfares, badges, transactions, registrations,
           adminActivities, launcherApplies, dashboard, members, STATE_META, REG_META,
           memberRegistrations, pointsRules };
})();
