import { Typography } from 'antd';

const { Title } = Typography;

export default function EditActivityPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>编辑活动</Title>
      <p style={{ color: 'var(--ink-2)' }}>编辑活动将在 Phase 3 实现</p>
    </div>
  );
}
