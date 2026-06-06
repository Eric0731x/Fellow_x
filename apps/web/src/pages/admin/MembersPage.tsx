import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Typography, Input, Select, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

const { Title } = Typography;

const ROLE_COLORS: Record<string, string> = {
  MEMBER: 'blue',
  LAUNCHER: 'purple',
  ADMIN: 'red',
};

const ROLE_LABELS: Record<string, string> = {
  MEMBER: '会员',
  LAUNCHER: '发起人',
  ADMIN: '管理员',
};

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

interface MemberItem {
  id: string;
  name: string;
  memberNo: string;
  role: string;
  status: string;
  growthPoints: number;
  exchangePoints: number;
  createdAt: string;
  level: { id: number; name: string };
}

export default function MembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');

  const loadMembers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, pageSize: 20 };
      if (role) params.role = role;
      if (status) params.status = status;
      if (keyword) params.keyword = keyword;
      const res = await apiClient.get('/admin/members', { params });
      const data = res as unknown as { items: MemberItem[]; total: number };
      setMembers(data.items);
      setTotal(data.total);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [role, status, keyword]);

  useEffect(() => {
    loadMembers(page);
  }, [page, loadMembers]);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '会员号',
      dataIndex: 'memberNo',
      key: 'memberNo',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] ?? 'default'}>
          {ROLE_LABELS[role] ?? role}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] ?? 'default'}>
          {STATUS_LABELS[status] ?? status}
        </Tag>
      ),
    },
    {
      title: '等级',
      key: 'level',
      width: 100,
      render: (_: unknown, record: MemberItem) => record.level.name,
    },
    {
      title: '成长积分',
      dataIndex: 'growthPoints',
      key: 'growthPoints',
      width: 100,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div className="wrap-page fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>会员管理</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="搜索姓名/会员号"
          allowClear
          onSearch={(v) => { setKeyword(v); setPage(1); }}
          style={{ width: 200 }}
        />
        <Select
          placeholder="角色筛选"
          allowClear
          style={{ width: 120 }}
          onChange={(v) => { setRole(v); setPage(1); }}
          options={[
            { value: 'MEMBER', label: '会员' },
            { value: 'LAUNCHER', label: '发起人' },
            { value: 'ADMIN', label: '管理员' },
          ]}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 120 }}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={[
            { value: 'ACTIVE', label: '正常' },
            { value: 'SUSPENDED', label: '已封禁' },
          ]}
        />
      </Space>

      <Table
        dataSource={members}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/admin/members/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        size="small"
      />
    </div>
  );
}
