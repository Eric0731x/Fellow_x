import { Typography } from 'antd';

const { Title } = Typography;

export default function MembersPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>会员管理</Title>
      <p style={{ color: 'var(--ink-2)' }}>会员管理将在 Phase 2 实现</p>
    </div>
  );
}
