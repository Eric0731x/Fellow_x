import { useEffect, useState } from 'react';
import { Card, Typography, Button, Input, Form, Tag, Spin, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Application {
  id: string;
  description: string;
  status: string;
  rejectReason: string | null;
  createdAt: string;
}

export default function LauncherApplyPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadApplication = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/launchers/apply/mine');
      setApplication(res as unknown as Application | null);
    } catch {
      // no existing application
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await apiClient.post('/launchers/apply', values);
      message.success('申请已提交');
      form.resetFields();
      loadApplication();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    PENDING: { color: 'processing', icon: <ClockCircleOutlined />, label: '审核中' },
    APPROVED: { color: 'success', icon: <CheckCircleOutlined />, label: '已通过' },
    REJECTED: { color: 'error', icon: <CloseCircleOutlined />, label: '未通过' },
  };

  const canReapply = !application || application.status === 'REJECTED';

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>发起人申请</Title>

      {application && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Text strong>申请状态:</Text>
            <Tag color={statusConfig[application.status]?.color} icon={statusConfig[application.status]?.icon}>
              {statusConfig[application.status]?.label ?? application.status}
            </Tag>
          </div>
          <Paragraph>
            <Text type="secondary">申请说明: </Text>
            {application.description}
          </Paragraph>
          {application.status === 'REJECTED' && application.rejectReason && (
            <Paragraph>
              <Text type="danger">拒绝原因: {application.rejectReason}</Text>
            </Paragraph>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交时间: {new Date(application.createdAt).toLocaleString('zh-CN')}
          </Text>
        </Card>
      )}

      {canReapply && (
        <Card>
          <Title level={4}>{application?.status === 'REJECTED' ? '重新申请' : '提交申请'}</Title>
          <Form form={form} layout="vertical">
            <Form.Item
              label="申请说明"
              name="description"
              rules={[
                { required: true, message: '请填写申请说明' },
                { max: 500, message: '不超过500字' },
              ]}
            >
              <TextArea rows={4} placeholder="请说明您申请成为发起人的理由和计划" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={submitting} onClick={handleSubmit}>
                提交申请
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {application?.status === 'APPROVED' && (
        <Card>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>恭喜您已成为发起人</Title>
            <Text type="secondary">您现在可以发起活动了</Text>
          </div>
        </Card>
      )}

      {application?.status === 'PENDING' && (
        <Card>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <ClockCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>审核中</Title>
            <Text type="secondary">您的申请正在审核中，请耐心等待</Text>
          </div>
        </Card>
      )}
    </div>
  );
}
