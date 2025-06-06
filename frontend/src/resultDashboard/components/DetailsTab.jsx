// 📍 src/resultDashboard/components/DetailsTab.jsx

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// ✅ '**텍스트**' 강조 표현 파싱 함수
const renderWithEmphasis = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="text-blue-700 font-semibold italic">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const DetailsTab = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("전체");
  const [selected, setSelected] = useState(null);

  const alerts = data?.details || [];

  const filteredAlerts = alerts.filter((alert) => {
    const matchSeverity = severityFilter === "전체" || alert.risk === severityFilter;
    const matchSearch =
      alert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.url?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSeverity && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* ✅ 필터 */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="취약점 이름 또는 URL 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-1/2"
        />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-40"
        >
          <option>전체</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* ✅ 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">No.</th>
              <th className="p-2 border">취약점 이름</th>
              <th className="p-2 border">URL</th>
              <th className="p-2 border">심각도</th>
              <th className="p-2 border">자세히</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{alert.translated || alert.name}</td>
                <td className="p-2 border text-blue-600 break-all">{alert.url}</td>
                <td className="p-2 border text-center">{alert.risk}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => setSelected(alert)}
                    className="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">🔍 취약점 상세정보</h3>

            <div className="space-y-4 text-sm">
              <div><span className="font-semibold">📛 이름:</span> {selected.translated || selected.name}</div>
              <div><span className="font-semibold">⚠️ 심각도:</span> {selected.risk}</div>
              <div><span className="font-semibold">🔗 URL:</span> {selected.url}</div>
              <div>
                <span className="font-semibold">📝 설명:</span><br />
                <p className="mt-1">{renderWithEmphasis(selected.description || "(미제공)")}</p>
              </div>
              <div>
                <span className="font-semibold">🧾 증거:</span><br />
                {selected.evidence
                  ? selected.evidence.length > 100
                    ? <details className="mt-1"><summary>내용 보기</summary><pre>{selected.evidence}</pre></details>
                    : <pre className="mt-1">{selected.evidence}</pre>
                  : "(없음)"}
              </div>
              {selected.solution_guidelines && (
                <div>
                  <span className="font-semibold">🛠 대응방안:</span>
                  <ul className="mt-2 space-y-2">
                    {selected.solution_guidelines.map((line, i) => (
                      <li
                        key={i}
                        className="pl-5 relative before:content-['▶'] before:absolute before:left-0 before:text-gray-700"
                      >
                        {renderWithEmphasis(line)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* ✅ 예시 코드들 */}
              {selected.examples &&
                Object.entries(selected.examples).map(([key, value]) => (
                  <div key={key}>
                    <span className="block mt-4 font-semibold">📄 {key.replace("example_", "").toUpperCase()} 설정 예시:</span>
                    <SyntaxHighlighter
                      language={key.includes("nginx") ? "nginx" : "bash"}
                      style={oneDark}
                      wrapLongLines
                      className="rounded-md mt-2"
                    >
                      {value}
                    </SyntaxHighlighter>
                  </div>
                ))}
            </div>

            <div className="text-right mt-6">
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
    </div>
  );
};

export default DetailsTab;
