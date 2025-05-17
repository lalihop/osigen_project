import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function AdminP() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");         // ✅ 저장된 토큰 제거
        alert("로그아웃 되었습니다.");           // (선택) 사용자 알림
        navigate("/");                            // 메인 페이지로 이동
    };
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("접근 권한이 없습니다.");
          navigate("/");
        }
    }, []);

    return (
        <div className='min-w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
            {/* header */}
            <header className='w-full py-4 bg-white shadow-sm'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                    <div className='flex-1'>
                        
                    </div>
                    <div className='flex justify-center flex-1'>
                        <img src='logo.png' alt='' className='h-12'></img>
                    </div>
                    <div className='flex justify-end flex-1'>
                        <button onClick={handleLogout}
                            className='rounded bg-red-500 text-white px-4 py-2 hover:bg-red-600 transition'>
                            <FontAwesomeIcon icon={faRightFromBracket} className='text-white mr-2'/> 로그아웃
                        </button>
                    </div>
                </div>
            </header>

            {/* main */}
            <main className='flex-grow flex flex-col items-center max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <h1 className='text-3xl font-bold text-gray-900 mb-6'>관리자 페이지</h1>
                <br></br>

                {/* 검색 기록 리스트 */}
                <div className='w-full bg-white shadow-md rounded-lg p-6'>
                    <h2 className='text-lg font-semibold text-gray-700 mb-4'>로그</h2>
                    <ul id='searchList' className='space-y-4'>
                        {/* 검색 기록이 동적으로 추가되는 곳 */}
                    </ul>
                </div>
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

export default AdminP