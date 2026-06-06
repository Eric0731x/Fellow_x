import { Typography } from 'antd';

const { Title } = Typography;

export default function MemberDetailPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>会员详情</Title>
      <p style={{ color: 'var(--ink-2)' }}>会员详情将在 Phase 2 实现</p>
    </div>
  );
}
