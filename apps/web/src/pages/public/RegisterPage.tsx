import { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { registerApi, sendSmsCodeApi } from '../../api/auth';

const { Title } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const fetchUser = useUserStore((s) => s.fetchUser);

  const onFinish = async (values: { phone: string; password: string; name: string; smsCode: string }) => {
    setLoading(true);
    try {
      const res = await registerApi(values);
      login({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      await fetchUser();
      message.success('注册成功');
      navigate('/me', { replace: true });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'PHONE_EXISTS') {
        message.error('该手机号已注册');
      } else if (error.code === 'SMS_INVALID') {
        message.error('验证码无效或已过期');
      } else {
        message.error(error.message || '注册失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    const phoneInput = document.querySelector('input#phone') as HTMLInputElement;
    const phone = phoneInput?.value;
    if (!phone) {
      message.warning('请先输入手机号');
      return;
    }
    try {
      await sendSmsCodeApi(phone, 'register');
      message.success('验证码已发送（测试码: 123456）');
    } catch {
      message.error('发送失败');
    }
  };

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 80 }}>
      <Title level={2}>注册</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
          <Input id="phone" placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item label="昵称" name="name" rules={[{ required: true, message: '请输入昵称' }]}>
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item label="验证码" name="smsCode" rules={[{ required: true, message: '请输入验证码' }]}>
          <Input
            placeholder="请输入验证码"
            suffix={
              <Button type="link" size="small" onClick={handleSendSms}>
                发送
              </Button>
            }
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            注册
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        已有账号？ <Button type="link" onClick={() => navigate('/login')}>登录</Button>
      </div>
    </div>
  );
}
