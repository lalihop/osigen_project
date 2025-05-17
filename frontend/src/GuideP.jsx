import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function GuideP() {
    const navigate = useNavigate();
    const gotoMain = () => {
        navigate('/');
    }

    return (
        <div className='min-w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
            {/* header */}
            <header className='w-full py-4 bg-white shadow-sm'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                    <div className='flex-1'>
                        <button onClick={gotoMain}
                            className='text-gray-500 hover:text-gray-500/50 transition'>
                            <FontAwesomeIcon icon={faArrowLeft} className='text-gray-500 hover:text-gray-500/50 mr-2'/> 돌아가기
                        </button>
                    </div>
                    <div className='flex justify-center flex-1'>
                        <h1 className='justify-centertext-lg font-semibold'>OSIGEN 사용 설명서</h1>
                    </div>
                    <div className='flex justify-end flex-1'></div>
                </div>
            </header>

            {/* main */}
            <main className='flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10'>
                <section>
                    <h2 className="text-2xl font-bold mb-4">🔍 사용자 모드</h2>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li><strong>빠른 분석:</strong> 입력한 도메인에 대한 빠른 취약점 분석을 수행합니다.</li>
                        <li><strong>통합 분석:</strong> 입력한 도메인 및 서브도메인까지 포함하여 통합 취약점 분석을 수행합니다.</li>
                        <li>도메인을 입력하고 <strong>분석</strong> 버튼을 클릭하면 분석이 시작됩니다.</li>
                        <li>결과는 분석 완료 후 결과 페이지에서 확인할 수 있습니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">💥 오류 코드</h2>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>오류 코드 <strong>1.1</strong>: 유효하지 않은 도메인</li>
                        <li>오류 코드 <strong>1.2</strong>: 도메인 형식 오류</li>
                        <li>오류 코드 <strong>1.3</strong>: 접근할 수 없는 웹 서버</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">🧱 시스템 구성 아키텍처</h2>
                    <p className="text-gray-700 mb-2">본 도구는 다음과 같은 구조로 구성되어 있습니다:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>🕸️ <strong>OSINT 수집:</strong> 자체 subdomain 크롤러</li>
                        <li>🔎 <strong>취약점 분석:</strong> OWASP ZAP 기반 자동화 도구</li>
                        <li>🧠 <strong>AI 요약:</strong> 결과 요약을 위한 GPT API 사용</li>
                    </ul>
                </section>
            </main>

            {/* footer */}
            <footer className='w-full py-6 bg-white border-t border-gray-200'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600'>
                    © 2025 OSIGEN Scanner. All rights reserved.
                </div>
            </footer>

        </div>
    )
}

export default GuideP