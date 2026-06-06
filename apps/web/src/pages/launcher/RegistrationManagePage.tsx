import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Tag, Button, Space, Typography, message, Popconfirm, Input, Card } from 'antd';
import { getActivityRegistrationsApi, reviewRegistrationApi } from '../../api/registration';
import type { Registration } from '@fellowx/shared';

const { Title } = Typography;

const STATE_COLORS: Record<string, string> = {
  PENDING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

interface RegistrationWithUser extends Registration {
  user: { id: string; name: string; memberNo: string; avatarUrl: string | null };
}

export default function RegistrationManagePage() {
  const { id: activityId } = useParams<{ id: string }>();
  const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!activityId) return;
    setLoading(true);
    try {
      const res = await getActivityRegistrationsApi(activityId, { pageSize: 100 });
      setRegistrations(res.items as unknown as RegistrationWithUser[]);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activityId]);

  const handleReview = async (regId: string, approved: boolean, rejectReason?: string) => {
    try {
      await reviewRegistrationApi(regId, { approved, rejectReason });
      message.success(approved ? '已通过' : '已拒绝');
      load();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'ACTIVITY_FULL') {
        message.error('活动名额已满');
      } else {
        message.error(error.message || '操作失败');
      }
    }
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: unknown, record: RegistrationWithUser) => record.user?.name ?? '未知',
    },
    {
      title: '会员编号',
      key: 'memberNo',
      render: (_: unknown, record: RegistrationWithUser) => record.user?.memberNo,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state: string) => <Tag color={STATE_COLORS[state]}>{state}</Tag>,
    },
    {
      title: '留言',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: RegistrationWithUser) => (
        record.state === 'PENDING' ? (
          <Space>
            <Button size="small" type="primary" onClick={() => handleReview(record.id, true)}>
              通过
            </Button>
            <Popconfirm
              title="拒绝原因"
              description={
                <Input.TextArea
                  id={`reject-${record.id}`}
                  rows={2}
                  placeholder="请输入拒绝原因"
                />
              }
              onConfirm={() => {
                const input = document.getElementById(`reject-${record.id}`) as HTMLTextAreaElement;
                handleReview(record.id, false, input?.value || '未通过审核');
              }}
            >
              <Button size="small" danger>拒绝</Button>
            </Popconfirm>
          </Space>
        ) : null
      ),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>报名管理</Title>
      <Card>
        <Table
          dataSource={registrations}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
