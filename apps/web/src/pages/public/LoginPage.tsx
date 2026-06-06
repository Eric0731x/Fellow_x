import { useState } from 'react';
import { Button, Form, Input, Typography, message, Divider } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { loginApi, sendSmsCodeApi } from '../../api/auth';

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [useSms, setUseSms] = useState(false);
  const login = useAuthStore((s) => s.login);
  const fetchUser = useUserStore((s) => s.fetchUser);

  const onFinish = async (values: { phone: string; password?: string; smsCode?: string }) => {
    setLoading(true);
    try {
      const res = await loginApi(values);
      login({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      await fetchUser();
      message.success('登录成功');
      const redirect = searchParams.get('redirect') || '/me';
      navigate(redirect, { replace: true });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'CREDENTIAL_INVALID') {
        message.error('手机号或密码错误');
      } else if (error.code === 'USER_SUSPENDED') {
        message.error('账号已被封禁');
      } else if (error.code === 'SMS_INVALID') {
        message.error('验证码无效或已过期');
      } else {
        message.error(error.message || '登录失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async (phone: string) => {
    if (!phone) {
      message.warning('请先输入手机号');
      return;
    }
    try {
      await sendSmsCodeApi(phone, 'login');
      message.success('验证码已发送（测试码: 123456）');
    } catch {
      message.error('发送失败');
    }
  };

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 80 }}>
      <Title level={2}>登录</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
          <Input placeholder="请输入手机号" />
        </Form.Item>

        {useSms ? (
          <Form.Item label="验证码" name="smsCode" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              placeholder="请输入验证码"
              suffix={
                <Button type="link" size="small" onClick={() => {
                  const phone = (document.querySelector('input[id="phone"]') as HTMLInputElement)?.value;
                  handleSendSms(phone);
                }}>
                  发送
                </Button>
              }
            />
          </Form.Item>
        ) : (
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Button type="link" onClick={() => setUseSms(!useSms)}>
          {useSms ? '使用密码登录' : '使用验证码登录'}
        </Button>
      </div>

      <Divider />

      <div style={{ textAlign: 'center' }}>
        还没有账号？ <Button type="link" onClick={() => navigate('/register')}>注册</Button>
      </div>
    </div>
  );
}
