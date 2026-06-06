import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="wrap-page fade-up" style={{ textAlign: 'center', padding: '80px 16px' }}>
      <Title className="t-hero">FellowX</Title>
      <Paragraph style={{ fontSize: '1.125rem', color: 'var(--ink-2)', maxWidth: 600, margin: '0 auto 32px' }}>
        AI 共学社区会员成长平台 — 双轨积分、等级晋升、活动共建
      </Paragraph>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Button type="primary" size="large" onClick={() => navigate('/register')}>立即加入</Button>
        <Button size="large" onClick={() => navigate('/activities')}>浏览活动</Button>
      </div>
    </div>
  );
}
