import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title } = Typography;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  { value: 'TOOL', label: '工具' },
  { value: 'MERCHANDISE', label: '周边' },
  { value: 'SERVICE', label: '服务' },
  { value: 'MEMBER_PRIVILEGE', label: '会员权益' },
];

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

interface RewardItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  cost: number;
  stock: number;
  redeemedCount: number;
  status: string;
}

export default function RewardsManagePage() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RewardItem | null>(null);
  const [form] = Form.useForm();

  const loadRewards = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/rewards', { params: { page: p, pageSize: 20 } });
      const data = res as unknown as { items: RewardItem[]; total: number };
      setRewards(data.items);
      setTotal(data.total);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRewards(page);
  }, [page, loadRewards]);

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: RewardItem) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      imageUrl: record.imageUrl,
      category: record.category,
      cost: record.cost,
      stock: record.stock,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await apiClient.put(`/admin/rewards/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await apiClient.post('/admin/rewards', values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadRewards(page);
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '操作失败');
    }
  };

  const handleToggleStatus = async (record: RewardItem) => {
    const newStatus = record.status === 'ON_SHELF' ? 'OFF_SHELF' : 'ON_SHELF';
    try {
      await apiClient.put(`/admin/rewards/${record.id}/status`, { status: newStatus });
      message.success(newStatus === 'ON_SHELF' ? '已上架' : '已下架');
      loadRewards(page);
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color={CATEGORY_COLORS[category] ?? 'default'}>
          {CATEGORY_LABELS[category] ?? category}
        </Tag>
      ),
    },
    {
      title: '积分',
      dataIndex: 'cost',
      key: 'cost',
      width: 80,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
    },
    {
      title: '已兑换',
      dataIndex: 'redeemedCount',
      key: 'redeemedCount',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'ON_SHELF' ? 'green' : 'default'}>
          {status === 'ON_SHELF' ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: RewardItem) => (
        <Space size="small">
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title={record.status === 'ON_SHELF' ? '确认下架？' : '确认上架？'}
            onConfirm={() => handleToggleStatus(record)}
          >
            <Button size="small" type={record.status === 'ON_SHELF' ? 'default' : 'primary'}>
              {record.status === 'ON_SHELF' ? '下架' : '上架'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>福利管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建福利</Button>
      </div>

      <Table
        dataSource={rewards}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        size="small"
      />

      <Modal
        title={editing ? '编辑福利' : '新建福利'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }, { max: 100 }]}>
            <Input placeholder="福利标题" />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类" options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={2} placeholder="福利描述" />
          </Form.Item>
          <Form.Item label="图片URL" name="imageUrl">
            <Input placeholder="图片链接" />
          </Form.Item>
          <Form.Item label="兑换积分" name="cost" rules={[{ required: true, message: '请输入积分' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="所需积分" />
          </Form.Item>
          <Form.Item label="库存" name="stock" rules={[{ required: true, message: '请输入库存' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="库存数量" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
