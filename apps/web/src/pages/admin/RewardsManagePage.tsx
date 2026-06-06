import { Typography } from 'antd';

const { Title } = Typography;

export default function RewardsManagePage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>福利管理</Title>
      <p style={{ color: 'var(--ink-2)' }}>福利管理将在 Phase 5 实现</p>
    </div>
  );
}
