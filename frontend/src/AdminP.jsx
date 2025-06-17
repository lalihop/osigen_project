import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminP = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("http://localhost:8000/admin/logs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs);
        setFilteredLogs(data.logs);
      });
  }, []);

  useEffect(() => {
    let result = logs.filter(log =>
      (log.domain || "").toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'all' || log.type === filter)
    );
    setFilteredLogs(result);
  }, [search, filter, logs]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const colors = { done: '#4ade80', error: '#f87171', full: '#3b82f6', quick: '#facc15' };

  const statusData = [
    { name: 'done', value: logs.filter(l => l.status === 'done').length },
    { name: 'error', value: logs.filter(l => l.status === 'error').length }
  ];
  const typeData = [
    { name: 'full', value: logs.filter(l => l.type === 'full').length },
    { name: 'quick', value: logs.filter(l => l.type === 'quick').length }
  ];

  const usageTrend = Object.values(logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString();
    acc[date] = acc[date] || { date, count: 0 };
    acc[date].count++;
    return acc;
  }, {}));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className='w-full py-4 bg-white shadow-sm'>
        <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
          <div className='flex-1'>
            <button
              onClick={handleLogout}
              className='text-gray-500 hover:text-red-600 transition text-sm font-medium'
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} className='mr-2' /> 로그아웃
            </button>
          </div>
          <div className='flex justify-center flex-1'>
            <h1 className='text-lg font-semibold'>OSIGEN 관리자 페이지</h1>
          </div>
          <div className='flex justify-end flex-1'>
          </div>
        </div>
      </header>

      <main className="flex-grow px-6 py-8">
        <div className="text-2xl font-bold text-gray-800 mb-6 text-center">관리자 대시보드</div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">분석 요청 추이</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usageTrend}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">상태 비율</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={70}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.name]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">분석 타입 비율</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={70}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.name]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="도메인 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="all">전체</option>
            <option value="full">Full 분석</option>
            <option value="quick">Quick 분석</option>
          </select>
        </div>

        {/* Log Table */}
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">도메인</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">분석타입</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">상태</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">요청시간</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">IP</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{log.domain}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-white text-xs ${log.type === 'full' ? 'bg-blue-500' : 'bg-yellow-400'}`}>{log.type}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-white text-xs ${log.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{log.client_ip}</td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => navigate(`/result/${log._id}`)}
                      className="text-sm px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      결과 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 푸터 */}
      <footer className='w-full py-6 bg-white border-t border-gray-200'>
        <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600'>
          © 2025 OSIGEN Scanner. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminP;
