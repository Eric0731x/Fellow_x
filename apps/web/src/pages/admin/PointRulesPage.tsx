import { Typography } from 'antd';

const { Title } = Typography;

export default function PointRulesPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>积分规则</Title>
      <p style={{ color: 'var(--ink-2)' }}>积分规则管理将在 Phase 4 实现</p>
    </div>
  );
}
