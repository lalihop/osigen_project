import React from "react";

const ReportExportTab = ({ data }) => {
  const handleGenerateReport = async () => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/${data._id}/export/pdf`);
      if (!res.ok) throw new Error("PDF 생성 실패");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${data.domain}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("❌ PDF 저장에 실패했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      {/* PDF 다운로드 섹션 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">📄 OSIGEN 보고서 저장</h3>
        <p className="text-sm text-gray-600">
          아래 항목들은 PDF 보고서에 자동 포함되는 구성 요소입니다.
        </p>

        <div className="space-y-2 text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked disabled />
            요약 포함
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked disabled />
            세부정보 포함
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked disabled />
            AI 요약 포함
          </label>
        </div>

        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          📥 PDF 다운로드
        </button>
      </div>

      {/* JSON 다운로드 섹션 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">📄 ZAP 원본 JSON 저장</h3>
        <p className="text-sm text-gray-600">
          ZAP 스캔 결과의 원본 데이터가 포함된 JSON 파일을 다운로드합니다.
        </p>

        <button
          onClick={async () => {
            try {
              if (!data || !data._id) {
                alert("❌ task_id가 정의되지 않았습니다.");
                return;
              }

              const res = await fetch(`http://localhost:8000/tasks/${data._id}/export/json`);
              if (!res.ok) throw new Error("JSON 다운로드 실패");

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);

              const now = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
              const filename = `zap_${data.domain || "site"}_${now}.json`;

              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (err) {
              alert("❌ JSON 다운로드에 실패했습니다.");
              console.error(err);
            }
          }}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
        >
          📥 원본 JSON 다운로드
        </button>
      </div>
    </div>
  );
};

export default ReportExportTab;
