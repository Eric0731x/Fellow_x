import { Typography } from 'antd';

const { Title } = Typography;

export default function OrdersPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>我的订单</Title>
      <p style={{ color: 'var(--ink-2)' }}>订单管理将在 Phase 5 实现</p>
    </div>
  );
}
