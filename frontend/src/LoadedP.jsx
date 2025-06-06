import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './App.css'
import { useParams } from 'react-router-dom';

function LoadedP({ taskId, type }) {
    const navigate = useNavigate();

    const gotoResult = () => {
        navigate(`/result/${taskId}`, {
            state: {
                taskId: taskId,
                type: type
            }
        });
    };

    return (
        <div className='min-w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
        {/* header */}
        <header className='w-full py-4 bg-white shadow-sm'>
            <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                <div className='flex-1'>
                    
                </div>
                <div className='flex justify-center flex-1'>
                    <img
                        src='/logo.png'
                        alt='logo'
                        className='h-12 cursor-pointer'
                        onClick={() => navigate('/')}
                    />
                </div>
                <div className='flex justify-end flex-1'>
                    
                </div>
            </div>
        </header>

        {/* main */}
        <main className='flex-grow flex flex-col items-center max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16'>
            <h1 className='text-3xl font-bold text-gray-900 mb-6'>분석 성공!</h1>
            <br></br>
            <div>
                <button onClick={gotoResult} className='rounded bg-gray-700 text-white px-4 py-2 hover:bg-green-600 transition-colors'>
                    결과 보기
                </button>
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

export default LoadedP