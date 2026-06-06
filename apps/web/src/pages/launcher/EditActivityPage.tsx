import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Input, InputNumber, Select, DatePicker, Typography, Card, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { getActivityApi, updateActivityApi } from '../../api/activity';

const { Title } = Typography;
const { TextArea } = Input;

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const act = await getActivityApi(id!);
        form.setFieldsValue({
          title: act.title,
          category: act.category,
          summary: act.summary,
          content: act.content,
          location: act.location,
          maxParticipants: act.maxParticipants,
          startTime: act.startTime ? dayjs(act.startTime) : undefined,
          endTime: act.endTime ? dayjs(act.endTime) : undefined,
          registrationDeadline: act.registrationDeadline ? dayjs(act.registrationDeadline) : undefined,
        });
      } catch {
        message.error('活动不存在');
        navigate('/launcher/activities');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, form, navigate]);

  const onFinish = async (values: Record<string, unknown>) => {
    if (!id) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = {};
      if (values.title) data.title = values.title;
      if (values.summary) data.summary = values.summary;
      if (values.location) data.location = values.location;
      if (values.maxParticipants) data.maxParticipants = values.maxParticipants;
      if (values.category) data.category = values.category;
      if (values.content) data.content = values.content;
      if (values.startTime) data.startTime = (values.startTime as { toISOString: () => string }).toISOString();
      if (values.endTime) data.endTime = (values.endTime as { toISOString: () => string }).toISOString();
      if (values.registrationDeadline) data.registrationDeadline = (values.registrationDeadline as { toISOString: () => string }).toISOString();

      await updateActivityApi(id, data as Parameters<typeof updateActivityApi>[1]);
      message.success('已保存');
      navigate('/launcher/activities');
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>编辑活动</Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
            <Button type="primary" htmlType="submit" block loading={saving}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
