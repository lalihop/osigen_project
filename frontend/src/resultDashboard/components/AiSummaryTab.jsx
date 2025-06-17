import React from "react";

const AiSummaryTab = ({ data }) => {
  const summaryList = data?.ai_summary?.summary || [];
  const promptExamples = data?.ai_summary?.prompt_examples || [];

  if (!summaryList.length && !promptExamples.length) {
    return <div className="text-red-600">❌ AI 요약 결과가 없습니다.</div>;
  }

  return (
    <div className="space-y-10">
      {/* 주요 취약점 요약 */}
      {summaryList.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">📌 주요 취약점 요약</h3>
          <div className="space-y-6">
            {summaryList.map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-300 rounded p-4 bg-white space-y-2"
              >
                <h4 className="text-lg font-bold text-gray-900">🎉 {item.name}</h4>
                <p className="text-sm text-gray-700">
                  <strong>위험도:</strong> {item.risk || "N/A"}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  <strong>왜 중요한가요?</strong> {item.why_important || "-"}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  <strong>설명:</strong> {item.description || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 질문 예시 */}
      {promptExamples.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">💬 AI에게 물어볼 수 있는 질문 예시</h3>
          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 ml-2">
            {promptExamples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AiSummaryTab;
