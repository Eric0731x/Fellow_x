import { Typography } from 'antd';

const { Title } = Typography;

export default function LauncherApplyPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>发起人申请</Title>
      <p style={{ color: 'var(--ink-2)' }}>发起人申请将在 Phase 4 实现</p>
    </div>
  );
}
