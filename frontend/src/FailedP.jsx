import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function FailedP({ taskId, message }) {
    const navigate = useNavigate();

    return (
        <div className='min-w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
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
            <main className='flex-grow flex flex-col items-center max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <h1 className='text-3xl font-bold text-gray-900 mb-6'>분석 실패.</h1>
                <p className='text-gray-700 mb-4'>{message}</p>
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

export default FailedP