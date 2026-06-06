import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Typography, Spin, Empty } from 'antd';
import { getMyOrdersApi } from '../../api/reward';

const { Title } = Typography;

const CATEGORY_LABELS: Record<string, string> = {
  TOOL: '工具',
  MERCHANDISE: '周边',
  SERVICE: '服务',
  MEMBER_PRIVILEGE: '会员权益',
};

const CATEGORY_COLORS: Record<string, string> = {
  TOOL: 'blue',
  MERCHANDISE: 'purple',
  SERVICE: 'cyan',
  MEMBER_PRIVILEGE: 'gold',
};

const STATE_LABELS: Record<string, string> = {
  COMPLETED: '已完成',
  PENDING: '待处理',
  CANCELLED: '已取消',
  FULFILLED: '已发放',
};

const STATE_COLORS: Record<string, string> = {
  COMPLETED: 'green',
  PENDING: 'orange',
  CANCELLED: 'default',
  FULFILLED: 'blue',
};

interface OrderItem {
  id: string;
  cost: number;
  state: string;
  createdAt: string;
  reward: {
    id: string;
    title: string;
    imageUrl: string | null;
    category: string;
  };
}

interface OrderResponse {
  items: OrderItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getMyOrdersApi({ page: p, pageSize: 15 });
      setOrders(res as unknown as OrderResponse);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(page);
  }, [page, loadOrders]);

  const columns = [
    {
      title: '福利',
      dataIndex: ['reward', 'title'],
      key: 'title',
      render: (title: string, record: OrderItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.reward.imageUrl && (
            <img src={record.reward.imageUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
          )}
          <span>{title}</span>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: ['reward', 'category'],
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color={CATEGORY_COLORS[category] ?? 'default'}>
          {CATEGORY_LABELS[category] ?? category}
        </Tag>
      ),
    },
    {
      title: '消耗积分',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{cost}</span>,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state: string) => (
        <Tag color={STATE_COLORS[state] ?? 'default'}>
          {STATE_LABELS[state] ?? state}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>我的订单</Title>
      <Card>
        <Table
          dataSource={orders?.items ?? []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 15,
            total: orders?.total ?? 0,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          size="small"
          locale={{ emptyText: <Empty description="暂无订单" /> }}
        />
      </Card>
    </div>
  );
}
