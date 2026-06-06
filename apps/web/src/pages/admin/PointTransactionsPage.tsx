import { Typography } from 'antd';

const { Title } = Typography;

export default function PointTransactionsPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>积分流水</Title>
      <p style={{ color: 'var(--ink-2)' }}>积分流水查询将在 Phase 4 实现</p>
    </div>
  );
}
