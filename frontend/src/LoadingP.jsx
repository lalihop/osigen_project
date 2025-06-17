import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './App.css'

function LoadingP({ progress = 0, stage = "분석 준비 중..."}) {

    return (
        <div className='min-w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
            {/* header */}
            <header className='w-full py-4 bg-white shadow-sm'>
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                    <div className='flex-1'>
                        
                    </div>
                    <div className='flex justify-center flex-1'>
                        <img src='/logo.png' alt='' className='h-12'></img>
                    </div>
                    <div className='flex justify-end flex-1'>
                        
                    </div>
                </div>
            </header>

            {/* main */}
            <main className='flex-grow flex flex-col items-center max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <p className='text-lg font-medium text-gray-700 mb-2'>현재 단계</p>
                <p className='text-xl font-bold text-blue-700 mb-4'>{stage}</p>

                <div className="w-3/4 max-w-md bg-gray-200 rounded-full h-6">
                    <div
                        className="bg-blue-500 h-6 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}% 완료</p>
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

export default LoadingP