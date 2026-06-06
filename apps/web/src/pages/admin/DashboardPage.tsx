import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, List, Tag } from 'antd';
import {
  UserOutlined,
  RocketOutlined,
  CalendarOutlined,
  StarOutlined,
  GiftOutlined,
  FileSearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title } = Typography;

interface DashboardData {
  memberCount: number;
  launcherCount: number;
  activeActivityCount: number;
  monthlyPointsCount: number;
  monthlyRewardCount: number;
  pendingActivityReviews: number;
  pendingLauncherApps: number;
  levelDistribution: Array<{ levelId: number; name: string; count: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/admin/dashboard');
        setData(res as unknown as DashboardData);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>管理仪表盘</Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="会员数" value={data.memberCount} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="发起人数" value={data.launcherCount} prefix={<RocketOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="进行中活动" value={data.activeActivityCount} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="本月积分变动" value={data.monthlyPointsCount} prefix={<StarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="本月兑换订单" value={data.monthlyRewardCount} prefix={<GiftOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="待审核活动"
              value={data.pendingActivityReviews}
              prefix={<FileSearchOutlined />}
              valueStyle={data.pendingActivityReviews > 0 ? { color: '#fa8c16' } : undefined}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="待审核发起人"
              value={data.pendingLauncherApps}
              prefix={<TeamOutlined />}
              valueStyle={data.pendingLauncherApps > 0 ? { color: '#fa8c16' } : undefined}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>等级分布</Title>
        <List
          dataSource={data.levelDistribution}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Tag>{item.name}</Tag>
                <span>{item.count} 人</span>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
