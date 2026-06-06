import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  AuditOutlined,
  UserOutlined,
  GiftOutlined,
  TrophyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: <Link to="/admin/dashboard">数据看板</Link> },
  { key: '/admin/review', icon: <AuditOutlined />, label: <Link to="/admin/review">审核中心</Link> },
  { key: '/admin/members', icon: <UserOutlined />, label: <Link to="/admin/members">会员管理</Link> },
  { key: '/admin/rewards', icon: <GiftOutlined />, label: <Link to="/admin/rewards">福利管理</Link> },
  { key: '/admin/points/rules', icon: <TrophyOutlined />, label: <Link to="/admin/points/rules">积分规则</Link> },
  { key: '/admin/levels', icon: <SettingOutlined />, label: <Link to="/admin/levels">等级管理</Link> },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: '#fff' }}>
        <div style={{ padding: '16px', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
          FellowX Admin
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: '#fff', borderBottom: '1px solid var(--hairline)' }}>
          <Button danger onClick={() => { logout(); navigate('/'); }}>退出管理</Button>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
