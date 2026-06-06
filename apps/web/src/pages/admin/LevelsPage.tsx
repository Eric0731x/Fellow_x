import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Typography, message } from 'antd';
import { apiClient } from '../../api/client';

const { Title, Text } = Typography;

interface LevelItem {
  id: number;
  name: string;
  minGrowthPoints: number;
  privileges: string | null;
  canApplyLauncher: boolean;
}

export default function LevelsPage() {
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LevelItem | null>(null);
  const [form] = Form.useForm();

  const loadLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/levels');
      setLevels(res as unknown as LevelItem[]);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  const handleEdit = (record: LevelItem) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      privileges: record.privileges,
      canApplyLauncher: record.canApplyLauncher,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!editing) return;
    try {
      const values = await form.validateFields();
      await apiClient.put(`/admin/levels/${editing.id}`, values);
      message.success('更新成功');
      setModalOpen(false);
      loadLevels();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '等级',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '最低成长积分',
      dataIndex: 'minGrowthPoints',
      key: 'minGrowthPoints',
      width: 140,
    },
    {
      title: '可申请发起人',
      dataIndex: 'canApplyLauncher',
      key: 'canApplyLauncher',
      width: 140,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: '权益说明',
      dataIndex: 'privileges',
      key: 'privileges',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: LevelItem) => (
        <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>等级管理</Title>

      <Table
        dataSource={levels}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
      />

      <Modal
        title="编辑等级"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="等级名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="最低成长积分">
            <Input disabled value={editing?.minGrowthPoints} />
            <Text type="secondary" style={{ fontSize: 12 }}>积分阈值不可修改 (BR-LV-03)</Text>
          </Form.Item>
          <Form.Item label="权益说明" name="privileges">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="可申请发起人" name="canApplyLauncher" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
