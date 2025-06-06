import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

function MainP() {
    const navigate = useNavigate();
    const gotoGuide = () => {
        navigate('/guide');
    }

    const gotoAdmin = () => {
        navigate('/admin');
    }

    const handleAdminLogin = () => {
        axios.post("http://localhost:8000/login", { password: adminCode })
            .then((res) => {
                localStorage.setItem("token", res.data.access_token);
                alert("관리자 인증에 성공했습니다!");
                gotoAdmin();
            })
            .catch((err) => {
                alert("인증 실패: " + (err.response?.data?.detail || "알 수 없는 오류"));
                setAdminCode('');
            });
    };

    const startAnalysis = () => {
        if (!domain) {
          alert("도메인을 입력해주세요!");
          return;
        }
      
        const type = active === "com" ? "full" : "quick";
        
        axios.post("http://localhost:8000/analyze", {
            domain,
            analysis_type: type
        })
        .then(res => {
            console.log("응답:", res.data); // 디버깅용용
            const taskId = res.data.task_id;

            if (!taskId) {
                alert("작업 ID를 받아오지 못했습니다.");
                return;
            }
            
            navigate(`/processing/${taskId}?type=${type}`);
        })
        .catch(err => {
            console.error("분석 요청 실패:", err);

            if (err.response && err.response.data && err.response.data.detail) {
                alert(err.response.data.detail); // 서버에서 보내준 메시지 직접 표시
            } else {
                alert("분석 요청 중 오류가 발생했어요!");
            }
        });
    };
    
    const [active, setActive] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminCode, setAdminCode] = useState('');
    const [domain, setDomain] = useState('');

    return (
        <div className='min-w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
            {/* header */}
            <header className='w-full py-4 bg-white shadow-sm'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                    <div className='flex-1'>
                        <button onClick={gotoGuide}
                            className='rounded-full w-10 h-10 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition'>
                            <FontAwesomeIcon icon={faQuestion} className='text-gray-500'/>
                        </button>
                    </div>
                    <div className='flex justify-center flex-1'>
                        <img src='/logo.png' alt='' className='h-12'></img>
                    </div>
                    <div className='flex justify-end flex-1'>
                        <button 
                            onClick={() => setShowAdminModal(true)}
                            id='adminBtn' className='rounded bg-black text-white px-4 py-2 hover:bg-gray-800 transtition-colors'>
                            <FontAwesomeIcon icon={faLock}/> 관리자 인증
                        </button>
                    </div>
                </div>
            </header>

            {/* main */}
            <main className='flex-grow flex flex-col items-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <h1 className='text-3xl font-bold text-gray-900 mb-8'>OSIGEN SCANNER</h1>
                <div className='w-full max-w-md'>
                    <div className='space-y-6'>
                        {/* 버튼들 */}
                        <div className='flex gap-6'>
                            <button
                                onClick={() => setActive("quick")}
                                className='rounded flex-1 bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 hover:border-black hover:text-black transition-colors whitespace-nowrap'>
                                    <FontAwesomeIcon icon={faBolt} className='mr-2' /> 빠른 분석
                            </button>
                            <button
                                onClick={() => setActive("com")}
                                className='rounded flex-1 bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 hover:border-black hover:text-black transition-colors whitespace-nowrap'>
                                    <FontAwesomeIcon icon={faShieldHalved} className='mr-2' /> 통합 분석
                            </button>
                        </div>

                        {/* 설명 */}
                        {active && (
                            <div className='text-gray-600 text-center'>
                                {active === 'quick'
                                    ? '입력하신 도메인에 대하여 분석을 수행합니다.'
                                    : '입력하신 도메인과 서브도메인에 대하여 분석을 수행합니다.'}
                            </div>
                        )}

                        {/* 도메인 입력 */}
                        {active && (
                            <div className='space-y-4'>
                                <div className='relative'>
                                    <FontAwesomeIcon icon={faLink} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                                    <input
                                        type='text'
                                        placeholder='분석할 도메인을 입력하세요'
                                        className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded focus:border-gray-100 focus:ring-0'
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                    />
                                </div>
                                <button
                                    disabled={!domain}
                                    className='rounded-md w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors flex items-center justify-center text-center no-underline'
                                    onClick={startAnalysis}
                                >
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className='mr-2' /> 분석
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* footer */}
            <footer className='w-full py-6 bg-white border-t border-gray-200 fixed bottom-0'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600'>
                    © 2025 OSIGEN Scanner. All rights reserved.
                </div>
            </footer>

            {/* Admin */}
            {showAdminModal && (
                <div
                    className="fixed inset-0 bg-black/25 flex items-center justify-center z-50"
                    onClick={() => setShowAdminModal(false)} // 바깥 클릭 시 닫힘
                >
                    <div
                    className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
                    onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫히지 않도록
                    >
                    <h3 className="text-xl font-semibold text-gray-900">관리자 인증</h3>
                    <div className="relative mt-4">
                        <FontAwesomeIcon icon={faKey} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                            type="password"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            placeholder="관리자 코드를 입력하세요"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAdminLogin();
                                }
                            }}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-custom"
                        />
                    </div>
                    <button
                        className="w-full bg-black text-white py-3 mt-4 hover:bg-gray-800 transition-colors"
                        onClick={handleAdminLogin}>
                        Enter
                    </button>
                    </div>
                </div>
                )}
        </div>
    )
}

export default MainP
