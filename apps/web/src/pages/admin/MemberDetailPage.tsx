import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Descriptions, Button, Spin, message, Popconfirm } from 'antd';
import { apiClient } from '../../api/client';

const { Title } = Typography;

interface MemberDetail {
  id: string;
  name: string;
  memberNo: string;
  phone: string;
  email: string | null;
  gender: string;
  role: string;
  status: string;
  growthPoints: number;
  exchangePoints: number;
  participationDays: number;
  streakDays: number;
  createdAt: string;
  lastLoginAt: string | null;
  level: { id: number; name: string };
  _count: {
    registrations: number;
    rewardOrders: number;
    pointLogs: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'green',
  SUSPENDED: 'orange',
  DEACTIVATING: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '正常',
  SUSPENDED: '已封禁',
  DEACTIVATING: '注销中',
};

const ROLE_LABELS: Record<string, string> = {
  MEMBER: '会员',
  LAUNCHER: '发起人',
  ADMIN: '管理员',
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMember = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/members/${id}`);
      setMember(res as unknown as MemberDetail);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!member) return;
    const newStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiClient.put(`/admin/members/${member.id}/status`, { status: newStatus });
      message.success(newStatus === 'ACTIVE' ? '已解封' : '已封禁');
      loadMember();
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '操作失败');
    }
  };

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>会员详情</Title>
        {(member.status === 'ACTIVE' || member.status === 'SUSPENDED') && (
          <Popconfirm
            title={member.status === 'ACTIVE' ? '确认封禁该会员？' : '确认解封该会员？'}
            onConfirm={handleToggleStatus}
          >
            <Button type={member.status === 'ACTIVE' ? 'default' : 'primary'} danger={member.status === 'ACTIVE'}>
              {member.status === 'ACTIVE' ? '封禁' : '解封'}
            </Button>
          </Popconfirm>
        )}
      </div>

      <Card>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="姓名">{member.name}</Descriptions.Item>
          <Descriptions.Item label="会员号">{member.memberNo}</Descriptions.Item>
          <Descriptions.Item label="手机号">{member.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{member.email ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag>{ROLE_LABELS[member.role] ?? member.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={STATUS_COLORS[member.status]}>
              {STATUS_LABELS[member.status] ?? member.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="等级">{member.level.name}</Descriptions.Item>
          <Descriptions.Item label="成长积分">{member.growthPoints}</Descriptions.Item>
          <Descriptions.Item label="兑换积分">{member.exchangePoints}</Descriptions.Item>
          <Descriptions.Item label="参与天数">{member.participationDays}</Descriptions.Item>
          <Descriptions.Item label="连续签到">{member.streakDays} 天</Descriptions.Item>
          <Descriptions.Item label="报名数">{member._count.registrations}</Descriptions.Item>
          <Descriptions.Item label="兑换订单">{member._count.rewardOrders}</Descriptions.Item>
          <Descriptions.Item label="积分记录">{member._count.pointLogs}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {new Date(member.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录">
            {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
