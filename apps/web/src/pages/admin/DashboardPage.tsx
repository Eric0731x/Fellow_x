import { Typography } from 'antd';

const { Title } = Typography;

export default function DashboardPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>管理后台</Title>
      <p style={{ color: 'var(--ink-2)' }}>管理仪表盘将在 Phase 6 实现</p>
    </div>
  );
}
