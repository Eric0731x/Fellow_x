import { Typography } from 'antd';

const { Title } = Typography;

export default function LauncherActivitiesPage() {
  return (
    <div className="wrap-page fade-up">
      <Title level={2}>我的活动</Title>
      <p style={{ color: 'var(--ink-2)' }}>发起人活动管理将在 Phase 3 实现</p>
    </div>
  );
}
