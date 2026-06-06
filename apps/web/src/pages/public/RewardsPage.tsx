import { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Tag, Typography, Spin, Tabs, Button, Modal, message, Empty } from 'antd';
import { GiftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getRewardsApi, redeemRewardApi } from '../../api/reward';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import type { Reward } from '@fellowx/shared';

const { Title, Text } = Typography;

const CATEGORY_OPTIONS = [
  { key: '', label: '全部' },
  { key: 'TOOL', label: '工具' },
  { key: 'MERCHANDISE', label: '周边' },
  { key: 'SERVICE', label: '服务' },
  { key: 'MEMBER_PRIVILEGE', label: '会员权益' },
];

const CATEGORY_COLORS: Record<string, string> = {
  TOOL: 'blue',
  MERCHANDISE: 'purple',
  SERVICE: 'cyan',
  MEMBER_PRIVILEGE: 'gold',
};

const CATEGORY_LABELS: Record<string, string> = {
  TOOL: '工具',
  MERCHANDISE: '周边',
  SERVICE: '服务',
  MEMBER_PRIVILEGE: '会员权益',
};

export default function RewardsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const loadRewards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRewardsApi({ category: category || undefined });
      setRewards((res as unknown as { items: Reward[] }).items);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  useEffect(() => {
    if (isAuthenticated) fetchUser();
  }, [isAuthenticated, fetchUser]);

  const handleRedeem = (reward: Reward) => {
    Modal.confirm({
      title: '确认兑换',
      content: `确定使用 ${reward.cost} 兑换积分兑换「${reward.title}」？`,
      okText: '确认兑换',
      cancelText: '取消',
      onOk: async () => {
        setRedeeming(reward.id);
        try {
          await redeemRewardApi(reward.id);
          message.success('兑换成功');
          fetchUser();
          loadRewards();
        } catch (err: unknown) {
          const error = err as { code?: string; message?: string };
          if (error.code === 'BALANCE_INSUFFICIENT') {
            message.error('兑换积分不足');
          } else if (error.code === 'REWARD_OUT_OF_STOCK') {
            message.error('福利已售罄');
          } else if (error.code === 'REWARD_OFF_SHELF') {
            message.error('福利已下架');
          } else {
            message.error(error.message || '兑换失败');
          }
        } finally {
          setRedeeming(null);
        }
      },
    });
  };

  const exchangePoints = (user as { exchangePoints?: number })?.exchangePoints ?? 0;

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>福利商城</Title>
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GiftOutlined />
            <Text>兑换积分: <Text strong style={{ color: '#1890ff' }}>{exchangePoints}</Text></Text>
          </div>
        )}
      </div>

      <Tabs
        activeKey={category}
        onChange={(key) => setCategory(key)}
        items={CATEGORY_OPTIONS.map((c) => ({ key: c.key, label: c.label }))}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : rewards.length === 0 ? (
        <Empty description="暂无福利" />
      ) : (
        <Row gutter={[16, 16]}>
          {rewards.map((reward) => {
            const canRedeem = isAuthenticated && exchangePoints >= reward.cost && reward.stock > 0;
            const insufficient = isAuthenticated && exchangePoints < reward.cost;

            return (
              <Col key={reward.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  cover={reward.imageUrl ? (
                    <img alt={reward.title} src={reward.imageUrl} style={{ height: 180, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      <GiftOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    </div>
                  )}
                >
                  <Tag color={CATEGORY_COLORS[reward.category] ?? 'default'}>
                    {CATEGORY_LABELS[reward.category] ?? reward.category}
                  </Tag>
                  <Title level={5} style={{ marginTop: 8, marginBottom: 4 }} ellipsis>
                    {reward.title}
                  </Title>
                  {reward.description && (
                    <Text type="secondary" ellipsis style={{ display: 'block', marginBottom: 12 }}>
                      {reward.description}
                    </Text>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
                      {reward.cost} 积分
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      库存: {reward.stock}
                    </Text>
                  </div>
                  {reward.stock === 0 ? (
                    <Button block disabled>已售罄</Button>
                  ) : insufficient ? (
                    <Button block disabled>积分不足 (差 {reward.cost - exchangePoints})</Button>
                  ) : (
                    <Button
                      type="primary"
                      block
                      icon={<ShoppingCartOutlined />}
                      loading={redeeming === reward.id}
                      onClick={() => handleRedeem(reward)}
                    >
                      立即兑换
                    </Button>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
