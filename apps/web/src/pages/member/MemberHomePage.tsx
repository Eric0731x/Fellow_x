import { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Typography, Spin, Avatar, Tag } from 'antd';
import { TrophyOutlined, StarOutlined, SafetyOutlined } from '@ant-design/icons';
import { useUserStore } from '../../stores/userStore';
import { getLevelsApi } from '../../api/level';
import { getPointsSummaryApi } from '../../api/points';
import type { Level, PointsSummary } from '@fellowx/shared';

const { Title, Text } = Typography;

export default function MemberHomePage() {
  const user = useUserStore((s) => s.user);
  const [levels, setLevels] = useState<Level[]>([]);
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lvls, pts] = await Promise.all([getLevelsApi(), getPointsSummaryApi()]);
        setLevels(lvls);
        setSummary(pts);
      } catch {
        // silently fail — show whatever we have
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {/* Identity Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar size={64} src={user?.avatarUrl} style={{ backgroundColor: 'var(--accent)' }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ marginBottom: 0 }}>{user?.name ?? '用户'}</Title>
            <Text type="secondary">{user?.memberNo}</Text>
            {summary?.level && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                {summary.level.name}
              </Tag>
            )}
          </Col>
        </Row>
      </Card>

      {/* Points Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: 28, color: '#faad14' }} />
              <Title level={3} style={{ margin: '8px 0 0' }}>
                {summary?.growthPoints ?? 0}
              </Title>
              <Text type="secondary">成长值</Text>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <StarOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <Title level={3} style={{ margin: '8px 0 0' }}>
                {summary?.exchangePoints ?? 0}
              </Title>
              <Text type="secondary">兑换积分</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Level Progress */}
      <Card title="等级进度" style={{ marginBottom: 24 }}>
        {summary?.level && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong>{summary.level.name}</Text>
              {summary.nextLevel && <Text type="secondary">{summary.nextLevel.name}</Text>}
            </div>
            <Progress
              percent={summary.progress}
              strokeColor="var(--accent)"
              format={() => `${summary.progress}%`}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {summary.growthPoints} / {summary.nextLevel?.minGrowthPoints ?? summary.level.minGrowthPoints} 成长值
              </Text>
            </div>
          </div>
        )}

        {levels.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--hairline)', paddingTop: 12 }}>
            {levels.map((lvl) => (
              <Tag
                key={lvl.id}
                color={lvl.id === summary?.level?.id ? 'orange' : undefined}
                style={{ marginBottom: 4 }}
              >
                {lvl.name} ({lvl.minGrowthPoints}+)
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Badge Wall Placeholder */}
      <Card title="我的徽章">
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <SafetyOutlined style={{ fontSize: 40, color: 'var(--ink-3)' }} />
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">徽章系统即将上线，敬请期待</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
