import { Typography } from 'antd';

const { Title } = Typography;

export default function ReviewPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>审核管理</Title>
      <p style={{ color: 'var(--ink-2)' }}>审核管理将在 Phase 4 实现</p>
    </div>
  );
}
