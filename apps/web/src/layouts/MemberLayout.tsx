import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space } from 'antd';
import { useAuthStore } from '../stores/authStore';

const { Header, Content } = Layout;

export default function MemberLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid var(--hairline)' }}>
        <Link to="/me" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', marginRight: 'auto' }}>
          FellowX
        </Link>
        <Menu mode="horizontal" style={{ flex: 1, minWidth: 0, border: 'none' }} items={[
          { key: 'home', label: <Link to="/me">个人中心</Link> },
          { key: 'activities', label: <Link to="/activities">活动</Link> },
          { key: 'points', label: <Link to="/points">积分</Link> },
          { key: 'rewards', label: <Link to="/rewards">福利</Link> },
        ]} />
        <Space>
          <Button onClick={() => navigate('/me/edit')}>编辑资料</Button>
          <Button danger onClick={() => { logout(); navigate('/'); }}>退出</Button>
        </Space>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}
