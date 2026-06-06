import { Typography } from 'antd';

const { Title } = Typography;

export default function EditProfilePage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>编辑资料</Title>
      <p style={{ color: 'var(--ink-2)' }}>编辑资料将在 Phase 2 实现</p>
    </div>
  );
}
