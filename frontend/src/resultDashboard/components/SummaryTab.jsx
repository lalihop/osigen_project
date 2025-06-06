import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
} from "recharts";

const SummaryTab = ({ data }) => {
  if (!data || !data.details || !data.zap_summary) {
    return <div className="text-red-600">❌ 결과 데이터가 없습니다.</div>;
  }

  const allAlerts = data.details;

  const severityCount = {
    Critical: data.zap_summary.severity_counts?.Critical || 0,
    High: data.zap_summary.severity_counts?.High || 0,
    Medium: data.zap_summary.severity_counts?.Medium || 0,
    Low: data.zap_summary.severity_counts?.Low || 0,
    Informational: data.zap_summary.severity_counts?.Informational || 0,
  };

  const totalAlerts = allAlerts.length;

  const top5Alerts = data.zap_summary.top_vulns || [];

  const severityChartData = Object.entries(severityCount)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const typeChartData = top5Alerts.map(({ name, count }) => ({
    name,
    value: count,
  }));

  const TYPE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"];

  // ✅ 도메인별 취약점 수 계산
  const domainCountMap = {};
  allAlerts.forEach((alert) => {
    try {
      const domain = new URL(alert.url).hostname;
      domainCountMap[domain] = (domainCountMap[domain] || 0) + 1;
    } catch {
      domainCountMap["(알 수 없음)"] = (domainCountMap["(알 수 없음)"] || 0) + 1;
    }
  });

  const subdomainChartData = Object.entries(domainCountMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = {
    Critical: "#DC2626",
    High: "#F97316",
    Medium: "#FACC15",
    Low: "#60A5FA",
    Informational: "#9CA3AF",
  };

  return (
    <div className="space-y-6">
      {/* 🎯 대상 도메인 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">🎯 대상 도메인</h3>
        {Object.keys(domainCountMap).length > 0 ? (
          (() => {
            const subdomains = Object.keys(domainCountMap);
            const maxToShow = 10;
            const shown = subdomains.slice(0, maxToShow);
            const remainingCount = subdomains.length - shown.length;
            return (
              <p className="text-sm text-gray-700 break-words">
                {shown.join(", ")}
                {remainingCount > 0 && ` 외 ${remainingCount}건`}
              </p>
            );
          })()
        ) : (
          <p className="text-sm text-gray-700">{data.domain}</p>
        )}
      </div>

      {/* 숫자 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-blue-100 p-4 rounded">총 취약점 수: {totalAlerts}</div>
        <div className="bg-red-100 p-4 rounded">Critical: {severityCount["Critical"]}</div>
        <div className="bg-orange-100 p-4 rounded">High: {severityCount["High"]}</div>
        <div className="bg-yellow-100 p-4 rounded">Medium: {severityCount["Medium"]}</div>
        <div className="bg-blue-300 p-4 rounded">Low: {severityCount["Low"]}</div>
      </div>

      {/* 차트: 원형 + 막대 */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* PieChart */}
        <div className="w-full md:w-1/3 bg-gray-100 p-4 rounded">
          <h3 className="text-center font-semibold mb-2">심각도 분포</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={severityChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={70}
                label
              >
                {severityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 유형 */}
        <div className="w-full md:w-2/3 bg-gray-100 p-4 rounded">
          <h3 className="text-center font-semibold mb-2">상위 취약점 유형</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeChartData}>
              <XAxis
                dataKey="name"
                interval={0}
                height={60}
                tick={{ fontSize: 11 }}
                tickFormatter={(name) => name.length > 25 ? name.slice(0, 23) + "..." : name}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value">
                {typeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-bar-${index}`}
                    fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

        {/* 서브도메인별 취약점 수 */}
        <div className="bg-gray-100 p-4 rounded mt-6">
          <h3 className="text-center font-semibold mb-2">서브도메인별 취약점 수</h3>
          <div className="overflow-x-auto">
            <div style={{ width: "100%" }}>
              <ResponsiveContainer width="100%" height={Math.max(300, subdomainChartData.length * 35)}>
                <BarChart
                  data={subdomainChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={200}
                    tick={({ x, y, payload }) => {
                      const name = payload.value;
                      const display = name.length > 30 ? name.slice(0, 28) + "..." : name;
                      return (
                        <text x={x} y={y + 5} fontSize={12} textAnchor="end">
                          {display}
                        </text>
                      );
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      {/* Top 5 리스트 */}
      <div>
        <h3 className="font-semibold mb-2">Top 5 취약점 유형</h3>
        <ul className="list-disc list-inside">
          {top5Alerts.map(({ name, count }, idx) => (
            <li key={idx}>
              {name} : {count}건
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SummaryTab;
