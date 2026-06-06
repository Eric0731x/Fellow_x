import { Typography } from 'antd';

const { Title } = Typography;

export default function ActivityDetailPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>活动详情</Title>
      <p style={{ color: 'var(--ink-2)' }}>活动详情将在 Phase 3 实现</p>
    </div>
  );
}
