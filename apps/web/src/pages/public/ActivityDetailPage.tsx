import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Descriptions, message, Spin, Space, Progress } from 'antd';
import { EnvironmentOutlined, ScheduleOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { getActivityApi } from '../../api/activity';
import { registerForActivityApi } from '../../api/registration';
import { useAuthStore } from '../../stores/authStore';
import type { Activity } from '@fellowx/shared';

const { Title, Text, Paragraph } = Typography;

const CATEGORY_COLORS: Record<string, string> = {
  CO_LEARNING: 'blue',
  READING: 'purple',
  SHARING: 'cyan',
  TRAINING: 'orange',
  OFFLINE: 'green',
  CO_BUILDING: 'magenta',
  SUBMISSION: 'gold',
};

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const act = await getActivityApi(id!);
        setActivity(act);
      } catch {
        message.error('活动不存在');
        navigate('/activities');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  const handleRegister = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/activities/${id}`);
      return;
    }
    setRegistering(true);
    try {
      await registerForActivityApi(id);
      message.success('报名成功，等待审核');
      const act = await getActivityApi(id);
      setActivity(act);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'DUPLICATE_REGISTRATION') {
        message.warning('已报名该活动');
      } else if (error.code === 'LEVEL_TOO_LOW') {
        message.error('等级不满足要求');
      } else if (error.code === 'ACTIVITY_FULL') {
        message.error('活动名额已满');
      } else if (error.code === 'REGISTRATION_CLOSED') {
        message.error('报名未开放');
      } else {
        message.error(error.message || '报名失败');
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) return null;

  const canRegister = activity.state === 'REGISTRATION_OPEN';
  const registrationRatio = activity.maxParticipants > 0
    ? Math.round((activity.approvedCount / activity.maxParticipants) * 100)
    : 0;

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {activity.coverImageUrl && (
        <img
          src={activity.coverImageUrl}
          alt={activity.title}
          style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 24 }}
        />
      )}

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Tag color={CATEGORY_COLORS[activity.category] ?? 'default'}>{activity.category}</Tag>
          <Tag>{activity.state}</Tag>
        </Space>

        <Title level={2}>{activity.title}</Title>
        <Paragraph type="secondary">{activity.summary}</Paragraph>

        <Descriptions column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label={<><EnvironmentOutlined /> 地点</>}>
            {activity.location}
          </Descriptions.Item>
          {activity.startTime && (
            <Descriptions.Item label={<><ScheduleOutlined /> 开始时间</>}>
              {new Date(activity.startTime).toLocaleString('zh-CN')}
            </Descriptions.Item>
          )}
          {activity.endTime && (
            <Descriptions.Item label={<><ScheduleOutlined /> 结束时间</>}>
              {new Date(activity.endTime).toLocaleString('zh-CN')}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={<><UserOutlined /> 发起人</>}>
            {(activity as Activity & { launcher?: { name: string } }).launcher?.name ?? '未知'}
          </Descriptions.Item>
          <Descriptions.Item label={<><TeamOutlined /> 报名人数</>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress percent={registrationRatio} size="small" style={{ width: 120 }} />
              <Text>{activity.approvedCount}/{activity.maxParticipants}</Text>
            </div>
          </Descriptions.Item>
        </Descriptions>

        {activity.content && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--hairline)', paddingTop: 16 }}>
            <Title level={4}>活动详情</Title>
            <div dangerouslySetInnerHTML={{ __html: activity.content }} />
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {canRegister ? (
            <Button type="primary" size="large" loading={registering} onClick={handleRegister}>
              立即报名
            </Button>
          ) : activity.state === 'ENDED' ? (
            <Button disabled>活动已结束</Button>
          ) : activity.state === 'IN_PROGRESS' ? (
            <Button disabled>进行中</Button>
          ) : (
            <Button disabled>暂不可报名</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
