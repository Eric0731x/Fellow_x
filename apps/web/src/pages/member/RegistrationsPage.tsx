import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Typography, message, Popconfirm, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrationsApi, cancelRegistrationApi } from '../../api/registration';
import type { Registration } from '@fellowx/shared';

const { Title } = Typography;

const STATE_COLORS: Record<string, string> = {
  PENDING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

interface RegistrationWithActivity extends Registration {
  activity: {
    id: string;
    title: string;
    category: string;
    startTime: string | null;
    location: string;
    state: string;
  };
}

export default function RegistrationsPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<RegistrationWithActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyRegistrationsApi({ pageSize: 100 });
      setRegistrations(res.items as unknown as RegistrationWithActivity[]);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    try {
      await cancelRegistrationApi(id);
      message.success('已取消报名');
      load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '取消失败');
    }
  };

  const columns = [
    {
      title: '活动',
      key: 'activity',
      render: (_: unknown, record: RegistrationWithActivity) => (
        <a onClick={() => navigate(`/activities/${record.activity?.id}`)}>
          {record.activity?.title ?? '未知活动'}
        </a>
      ),
    },
    {
      title: '分类',
      key: 'category',
      render: (_: unknown, record: RegistrationWithActivity) => record.activity?.category,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state: string) => <Tag color={STATE_COLORS[state]}>{state}</Tag>,
    },
    {
      title: '开始时间',
      key: 'startTime',
      render: (_: unknown, record: RegistrationWithActivity) =>
        record.activity?.startTime ? new Date(record.activity.startTime).toLocaleString('zh-CN') : '-',
    },
    {
      title: '地点',
      key: 'location',
      render: (_: unknown, record: RegistrationWithActivity) => record.activity?.location,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: RegistrationWithActivity) => (
        (record.state === 'PENDING' || record.state === 'APPROVED') ? (
          <Popconfirm title="确认取消报名？" onConfirm={() => handleCancel(record.id)}>
            <Button size="small" danger>取消</Button>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>我的报名</Title>
      <Card>
        <Table
          dataSource={registrations}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="暂无报名记录" /> }}
        />
      </Card>
    </div>
  );
}
