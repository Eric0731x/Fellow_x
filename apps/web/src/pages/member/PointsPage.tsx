import { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, Tabs, Table, Tag, message, Spin, Typography } from 'antd';
import { RocketOutlined, GiftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getPointsSummaryApi, getPointTransactionsApi, dailyCheckInApi } from '../../api/points';
import type { PointsSummary } from '@fellowx/shared';

const { Title } = Typography;

interface PointLogItem {
  id: string;
  pointsType: string;
  amount: number;
  balanceAfter: number;
  title: string;
  ruleCode: string | null;
  createdAt: string;
}

interface TransactionResponse {
  items: PointLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function PointsPage() {
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [transactions, setTransactions] = useState<TransactionResponse | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txType, setTxType] = useState<string>('');
  const [txPage, setTxPage] = useState(1);

  const loadSummary = useCallback(async () => {
    try {
      const data = await getPointsSummaryApi();
      setSummary(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (pointsType: string, page: number) => {
    setTxLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize: 15 };
      if (pointsType) params.pointsType = pointsType;
      const data = await getPointTransactionsApi(params as { page: number; pageSize: number; pointsType?: 'GROWTH' | 'EXCHANGE' });
      setTransactions(data as unknown as TransactionResponse);
    } catch {
      // silently fail
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTransactions(txType, txPage);
  }, [txType, txPage, loadTransactions]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await dailyCheckInApi();
      message.success('签到成功 +10 兑换积分');
      loadSummary();
      loadTransactions(txType, txPage);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'ALREADY_CHECKED_IN') {
        message.warning('今日已签到');
      } else {
        message.error(error.message || '签到失败');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap-page fade-up" style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'pointsType',
      key: 'pointsType',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'GROWTH' ? 'green' : 'blue'}>
          {type === 'GROWTH' ? '成长' : '兑换'}
        </Tag>
      ),
    },
    {
      title: '说明',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '变动',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount: number) => (
        <span style={{ color: amount > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {amount > 0 ? `+${amount}` : amount}
        </span>
      ),
    },
    {
      title: '余额',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 100,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>积分中心</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="成长积分"
              value={summary?.growthPoints ?? 0}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="兑换积分"
              value={summary?.exchangePoints ?? 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ marginBottom: 8, color: 'var(--ink-2)', fontSize: 14 }}>当前等级</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{summary?.level?.name ?? '-'}</div>
            {summary?.nextLevel && (
              <Progress
                percent={summary.progress}
                size="small"
                style={{ marginTop: 8 }}
                format={() => `${summary.progress}%`}
              />
            )}
            {!summary?.nextLevel && (
              <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 8 }}>已达最高等级</div>
            )}
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>每日签到</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>签到可获得 10 兑换积分</div>
          </div>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={checkingIn}
            onClick={handleCheckIn}
          >
            签到
          </Button>
        </div>
      </Card>

      <Card>
        <Tabs
          activeKey={txType}
          onChange={(key) => { setTxType(key); setTxPage(1); }}
          items={[
            { key: '', label: '全部' },
            { key: 'GROWTH', label: '成长积分' },
            { key: 'EXCHANGE', label: '兑换积分' },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={transactions?.items ?? []}
          columns={columns}
          rowKey="id"
          loading={txLoading}
          pagination={{
            current: txPage,
            pageSize: 15,
            total: transactions?.total ?? 0,
            onChange: (page) => setTxPage(page),
            showSizeChanger: false,
          }}
          size="small"
        />
      </Card>
    </div>
  );
}
