import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SubdomainTab = ({ data }) => {
  const details = data?.details || [];

  // URL → 도메인 추출
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "(알 수 없음)";
    }
  };

  // 위험도 → 점수 부여 기준
  const riskScores = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  // 도메인별 취약점 그룹화 및 통계
  const domainStatsMap = {};
  details.forEach((item) => {
    const domain = extractDomain(item.url);
    if (!domainStatsMap[domain]) {
      domainStatsMap[domain] = {
        domain,
        alerts: [],
        severity: { Critical: 0, High: 0, Medium: 0, Low: 0 },
        score: 0
      };
    }

    domainStatsMap[domain].alerts.push(item);
    if (riskScores[item.risk]) {
      domainStatsMap[domain].severity[item.risk]++;
      domainStatsMap[domain].score += riskScores[item.risk];
    }
  });

  const domainStats = Object.values(domainStatsMap);

  const [selected, setSelected] = useState(null);
  const [sortOption, setSortOption] = useState("severity");
  const [ascending, setAscending] = useState(true);

  const COLOR_SCALE = ["#DC2626", "#F97316", "#FACC15", "#60A5FA", "#9CA3AF"];
  const getColorByRank = (index) => index < 5 ? COLOR_SCALE[index] : "#9CA3AF";

  const chartData = domainStats
    .map(({ domain, score }) => ({ name: domain, value: score }))
    .sort((a, b) => b.value - a.value);

  const sortAlerts = (alerts) => {
    const severityRank = { Critical: 1, High: 2, Medium: 3, Low: 4 };
    const sorted = [...alerts].sort((a, b) => {
      if (sortOption === "severity") {
        return severityRank[a.risk] - severityRank[b.risk];
      } else if (sortOption === "url") {
        return a.url.localeCompare(b.url);
      } else if (sortOption === "name") {
        return a.translated?.localeCompare(b.translated || a.name) || 0;
      } else {
        return 0;
      }
    });
    return ascending ? sorted : sorted.reverse();
  };

  return (
    <div className="space-y-6">
      {/* 카드형 서브도메인 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainStats.map((d, i) => (
          <div
            key={i}
            className="border rounded shadow p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelected(d)}
          >
            <h4 className="font-bold text-lg mb-1">{d.domain}</h4>
            <p>총 취약점: {d.alerts.length}</p>
            <div className="text-sm space-y-1 mt-2">
              <div className="text-red-600">Critical: {d.severity.Critical}</div>
              <div className="text-orange-600">High: {d.severity.High}</div>
              <div className="text-yellow-600">Medium: {d.severity.Medium}</div>
              <div className="text-blue-600">Low: {d.severity.Low}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">{selected.domain} - 취약점 상세</h3>

            <div className="mb-4 flex items-center gap-4">
              <div>
                <label className="text-sm mr-2">정렬 기준:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-sm border px-2 py-1 rounded"
                >
                  <option value="severity">심각도순</option>
                  <option value="name">취약점명순</option>
                  <option value="url">URL순</option>
                </select>
              </div>
              <button
                onClick={() => setAscending(!ascending)}
                className="text-sm border px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                {ascending ? "⬆ 오름차순" : "⬇ 내림차순"}
              </button>
            </div>

            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {sortAlerts(selected.alerts).map((alert, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{alert.translated || alert.name}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      alert.risk === "Critical" ? "bg-red-100 text-red-800" :
                      alert.risk === "High" ? "bg-orange-100 text-orange-800" :
                      alert.risk === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {alert.risk}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 break-all mt-1">{alert.url}</p>
                </li>
              ))}
            </ul>
            <div className="text-right mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 위험도 점수 기반 랭킹 차트 */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="text-center font-semibold mb-2">서브도메인 위험도 점수 랭킹</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={({ x, y, payload }) => {
                const name = payload.value;
                const display = name.length > 25 ? name.slice(0, 23) + "..." : name;
                return (
                  <text x={x} y={y + 5} fontSize={12} textAnchor="end">
                    {display}
                  </text>
                );
              }}
            />
            <Tooltip />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorByRank(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubdomainTab;
