import { Typography } from 'antd';

const { Title } = Typography;

export default function RewardsPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>福利商城</Title>
      <p style={{ color: 'var(--ink-2)' }}>福利商城将在 Phase 5 实现</p>
    </div>
  );
}
