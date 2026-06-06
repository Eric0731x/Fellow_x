import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getActivitiesApi, submitReviewApi, lifecycleApi, deleteActivityApi } from '../../api/activity';
import type { Activity } from '@fellowx/shared';

const { Title } = Typography;

const STATE_COLORS: Record<string, string> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'processing',
  PUBLISHED: 'success',
  REGISTRATION_OPEN: 'green',
  IN_PROGRESS: 'blue',
  ENDED: 'default',
  REJECTED: 'error',
  CANCELLED: 'default',
};

export default function LauncherActivitiesPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch all states for launcher's own activities
      const res = await getActivitiesApi({ state: 'DRAFT,PENDING_REVIEW,PUBLISHED,REGISTRATION_OPEN,IN_PROGRESS,ENDED,REJECTED,CANCELLED', pageSize: 100 });
      setActivities(res.items);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmitReview = async (id: string) => {
    try {
      await submitReviewApi(id);
      message.success('已提交审核');
      load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '提交失败');
    }
  };

  const handleLifecycle = async (id: string, action: string) => {
    try {
      await lifecycleApi(id, action);
      message.success('操作成功');
      load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActivityApi(id);
      message.success('已删除');
      load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state: string) => <Tag color={STATE_COLORS[state]}>{state}</Tag>,
    },
    {
      title: '报名',
      key: 'participants',
      render: (_: unknown, record: Activity) => `${record.approvedCount}/${record.maxParticipants}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Activity) => (
        <Space size="small" wrap>
          {(record.state === 'DRAFT' || record.state === 'REJECTED') && (
            <>
              <Button size="small" onClick={() => navigate(`/launcher/activities/${record.id}/edit`)}>编辑</Button>
              <Button size="small" type="primary" onClick={() => handleSubmitReview(record.id)}>提交审核</Button>
            </>
          )}
          {record.state === 'PUBLISHED' && (
            <Button size="small" type="primary" onClick={() => handleLifecycle(record.id, 'openRegistration')}>开放报名</Button>
          )}
          {record.state === 'REGISTRATION_OPEN' && (
            <Button size="small" onClick={() => navigate(`/launcher/activities/${record.id}/registrations`)}>管理报名</Button>
          )}
          {record.state === 'REGISTRATION_OPEN' && (
            <Button size="small" onClick={() => handleLifecycle(record.id, 'start')}>开始活动</Button>
          )}
          {record.state === 'IN_PROGRESS' && (
            <Button size="small" onClick={() => handleLifecycle(record.id, 'end')}>结束活动</Button>
          )}
          {!['ENDED', 'CANCELLED'].includes(record.state) && (
            <Popconfirm title="确认取消？" onConfirm={() => handleLifecycle(record.id, 'cancel')}>
              <Button size="small" danger>取消</Button>
            </Popconfirm>
          )}
          {record.state === 'DRAFT' && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>我的活动</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/launcher/activities/create')}>
          创建活动
        </Button>
      </div>

      <Card>
        <Table
          dataSource={activities}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
