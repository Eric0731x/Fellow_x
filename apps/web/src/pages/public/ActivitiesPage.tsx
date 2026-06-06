import { Typography } from 'antd';

const { Title } = Typography;

export default function ActivitiesPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>活动广场</Title>
      <p style={{ color: 'var(--ink-2)' }}>活动列表将在 Phase 3 实现</p>
    </div>
  );
}
