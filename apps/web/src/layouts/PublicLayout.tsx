import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space } from 'antd';
import { useAuthStore } from '../stores/authStore';

const { Header, Content, Footer } = Layout;

export default function PublicLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid var(--hairline)' }}>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', marginRight: 'auto' }}>
          FellowX
        </Link>
        <Menu mode="horizontal" style={{ flex: 1, minWidth: 0, border: 'none' }} items={[
          { key: 'home', label: <Link to="/">首页</Link> },
          { key: 'activities', label: <Link to="/activities">活动</Link> },
          { key: 'rewards', label: <Link to="/rewards">福利</Link> },
        ]} />
        <Space>
          {isAuthenticated ? (
            <Button type="link" onClick={() => navigate('/me')}>个人中心</Button>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </>
          )}
        </Space>
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
        FellowX &copy; 2026
      </Footer>
    </Layout>
  );
}
