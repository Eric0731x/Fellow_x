import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Spin, Tabs, Segmented, Empty } from 'antd';
import { EnvironmentOutlined, ScheduleOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getActivitiesApi } from '../../api/activity';
import type { Activity } from '@fellowx/shared';

const { Title, Text } = Typography;

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: '共学', label: '共学' },
  { key: '精读', label: '精读' },
  { key: '分享', label: '分享' },
  { key: '训练', label: '训练' },
  { key: '线下', label: '线下' },
  { key: '共建', label: '共建' },
  { key: '投稿', label: '投稿' },
];

const CATEGORY_COLORS: Record<string, string> = {
  CO_LEARNING: 'blue',
  READING: 'purple',
  SHARING: 'cyan',
  TRAINING: 'orange',
  OFFLINE: 'green',
  CO_BUILDING: 'magenta',
  SUBMISSION: 'gold',
};

const STATE_LABELS: Record<string, string> = {
  PUBLISHED: '即将开始',
  REGISTRATION_OPEN: '报名中',
  IN_PROGRESS: '进行中',
  ENDED: '已结束',
};

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'new' | 'hot'>('new');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getActivitiesApi({ category: category || undefined, sort });
        setActivities(res.items);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, sort]);

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>活动广场</Title>
        <Segmented
          options={[{ label: '最新', value: 'new' }, { label: '热门', value: 'hot' }]}
          value={sort}
          onChange={(v) => setSort(v as 'new' | 'hot')}
        />
      </div>

      <Tabs
        activeKey={category}
        onChange={(key) => setCategory(key)}
        items={CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : activities.length === 0 ? (
        <Empty description="暂无活动" />
      ) : (
        <Row gutter={[16, 16]}>
          {activities.map((act) => (
            <Col key={act.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/activities/${act.id}`)}
                cover={act.coverImageUrl ? <img alt={act.title} src={act.coverImageUrl} style={{ height: 180, objectFit: 'cover' }} /> : undefined}
              >
                <Tag color={CATEGORY_COLORS[act.category] ?? 'default'}>
                  {act.category}
                </Tag>
                {STATE_LABELS[act.state] && (
                  <Tag color={act.state === 'REGISTRATION_OPEN' ? 'green' : undefined}>
                    {STATE_LABELS[act.state]}
                  </Tag>
                )}
                <Title level={5} style={{ marginTop: 8, marginBottom: 4 }} ellipsis>
                  {act.title}
                </Title>
                <Text type="secondary" ellipsis style={{ display: 'block', marginBottom: 8 }}>
                  {act.summary}
                </Text>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  <div><EnvironmentOutlined /> {act.location}</div>
                  {act.startTime && (
                    <div><ScheduleOutlined /> {new Date(act.startTime).toLocaleDateString('zh-CN')}</div>
                  )}
                  <div><TeamOutlined /> {act.approvedCount}/{act.maxParticipants}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
