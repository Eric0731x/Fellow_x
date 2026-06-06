import { useState } from 'react';
import { Button, Form, Input, InputNumber, Select, DatePicker, Typography, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createActivityApi } from '../../api/activity';

const { Title } = Typography;
const { TextArea } = Input;

export default function CreateActivityPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        title: values.title,
        summary: values.summary,
        location: values.location,
        maxParticipants: values.maxParticipants,
      };
      if (values.category) data.category = values.category;
      if (values.content) data.content = values.content;
      if (values.startTime) data.startTime = (values.startTime as { toISOString: () => string }).toISOString();
      if (values.endTime) data.endTime = (values.endTime as { toISOString: () => string }).toISOString();
      if (values.registrationDeadline) data.registrationDeadline = (values.registrationDeadline as { toISOString: () => string }).toISOString();

      await createActivityApi(data as unknown as Parameters<typeof createActivityApi>[0]);
      message.success('活动已创建');
      navigate('/launcher/activities');
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>创建活动</Title>
      <Card>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }, { max: 100 }]}>
            <Input placeholder="活动标题" />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Select placeholder="选择分类" allowClear options={[
              { value: '共学', label: '共学' },
              { value: '精读', label: '精读' },
              { value: '分享', label: '分享' },
              { value: '训练', label: '训练' },
              { value: '线下', label: '线下' },
              { value: '共建', label: '共建' },
              { value: '投稿', label: '投稿' },
            ]} />
          </Form.Item>
          <Form.Item label="摘要" name="summary" rules={[{ required: true, message: '请输入摘要' }, { max: 200 }]}>
            <TextArea rows={2} placeholder="一句话描述活动" />
          </Form.Item>
          <Form.Item label="详情" name="content">
            <TextArea rows={6} placeholder="活动详细内容" />
          </Form.Item>
          <Form.Item label="地点" name="location" rules={[{ required: true, message: '请输入地点' }, { max: 200 }]}>
            <Input placeholder="活动地点" />
          </Form.Item>
          <Form.Item label="最大参与人数" name="maxParticipants" rules={[{ required: true, message: '请输入人数' }]}>
            <InputNumber min={1} max={10000} style={{ width: '100%' }} placeholder="1-10000" />
          </Form.Item>
          <Form.Item label="报名截止时间" name="registrationDeadline">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="开始时间" name="startTime">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="结束时间" name="endTime">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              创建活动
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
