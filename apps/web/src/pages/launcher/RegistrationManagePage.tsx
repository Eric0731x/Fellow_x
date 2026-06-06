import { Typography } from 'antd';

const { Title } = Typography;

export default function RegistrationManagePage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>报名管理</Title>
      <p style={{ color: 'var(--ink-2)' }}>报名管理将在 Phase 3 实现</p>
    </div>
  );
}
