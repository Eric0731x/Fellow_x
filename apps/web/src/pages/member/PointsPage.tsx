import { Typography } from 'antd';

const { Title } = Typography;

export default function PointsPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>积分中心</Title>
      <p style={{ color: 'var(--ink-2)' }}>积分系统将在 Phase 4 实现</p>
    </div>
  );
}
