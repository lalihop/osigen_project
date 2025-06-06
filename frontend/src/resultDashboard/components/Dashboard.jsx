// 📍 src/resultDashboard/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../App.css';
import SummaryTab from "./SummaryTab";
import DetailsTab from "./DetailsTab";
import SubdomainTab from "./SubdomainTab";
import AiSummaryTab from "./AiSummaryTab";
import ReportExportTab from "./ReportExportTab";

function Dashboard() {
    const navigate = useNavigate();
    const { task_id } = useParams();
    const [activeTab, setActiveTab] = useState("summary");
    const [taskData, setTaskData] = useState(null);
    const [loading, setLoading] = useState(true);

    const tabList = [
        { key: "summary", label: "요약" },
        { key: "details", label: "세부" },
        ...(taskData?.analysis_type === "full" ? [{ key: "subdomains", label: "서브도메인" }] : []),
        { key: "ai", label: "AI 요약" },
        { key: "report", label: "보고서 저장" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8000/analyze/result/${task_id}`);
                const json = await res.json();

                if (json.status === "done") {
                    setTaskData({
                        ...json.result,
                        _id: task_id,
                        domain: json.result.target || "(알 수 없음)"
                    });
                } else {
                    setTaskData({ status: "processing" });
                }
            } catch (err) {
                console.error("데이터 불러오기 실패:", err);
                setTaskData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [task_id]);

    if (loading) {
        return <div className="p-6">⏳ 데이터 불러오는 중...</div>;
    }

    if (!taskData || !taskData.zap_summary || !taskData.details) {
        return (
            <div className="p-6 text-red-600">
                ❌ 스캔 결과를 불러올 수 없습니다. 입력한 도메인이 유효한지 확인해주세요.
            </div>
        );
    }

    return (
        <div className='w-full min-w-screen min-h-screen px-6 py-4 bg-gray-50 flex flex-col items-center justify-center'>
            {/* header */}
            <header className='w-full py-4 bg-white shadow-sm'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                    <div className='flex-1'></div>
                    <div className='flex justify-center flex-1'>
                        <img
                            src='/logo.png'
                            alt='logo'
                            className='h-12 cursor-pointer'
                            onClick={() => navigate('/')}
                        />
                    </div>
                    <div className='flex justify-end flex-1'></div>
                </div>
            </header>

            {/* main */}
            <main className='w-full min-h-screen px-6 py-4 bg-gray-50'>
                <div className="flex space-x-4 border-b border-gray-300 pb-2 mb-4">
                    {tabList.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-t-lg font-medium ${
                                activeTab === tab.key
                                    ? "bg-white border border-b-0 border-gray-300 text-blue-600"
                                    : "text-gray-500 hover:text-blue-600"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    {activeTab === "summary" && <SummaryTab data={taskData} />}
                    {activeTab === "details" && <DetailsTab data={taskData} />}
                    {activeTab === "subdomains" && taskData.analysis_type === "full" && (
                        <SubdomainTab data={taskData} />
                    )}
                    {activeTab === "ai" && <AiSummaryTab data={taskData} />}
                    {activeTab === "report" && <ReportExportTab data={taskData} />}
                </div>
            </main>

            {/* footer */}
            <footer className='w-full py-6 bg-white border-t border-gray-200'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600'>
                    © 2025 OSIGEN Scanner. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Dashboard;
