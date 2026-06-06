import { Typography } from 'antd';

const { Title } = Typography;

export default function RegistrationsPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>我的报名</Title>
      <p style={{ color: 'var(--ink-2)' }}>报名记录将在 Phase 3 实现</p>
    </div>
  );
}
