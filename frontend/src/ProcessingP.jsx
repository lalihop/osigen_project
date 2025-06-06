import React, { useEffect, useState } from 'react';
import LoadingP from './LoadingP';
import LoadedP from './LoadedP';
import FailedP from './FailedP';
import { useParams } from 'react-router-dom';

function ProcessingP() {
  const { taskId } = useParams();
  const [status, setStatus] = useState('processing');
  const [stage, setStage] = useState('');
  const [percent, setPercent] = useState(0);
  const [type, setType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(() => {
      fetch(`http://localhost:8000/analyze/status/${taskId}`)
        .then((res) => {
          if (!res.ok) throw new Error("서버 응답 실패");
          return res.json();
        })
        .then((data) => {
          setStatus(data.status);
          setStage(data.progress?.stage || '분석 준비 중...');
          setPercent(data.progress?.percent || 0);
          if (data.type) {
            setType(data.type);
          }
        })
        .catch((err) => {
          console.error(err);
          clearInterval(interval);
          setStatus('error');
          setError("서버 연결 실패 또는 응답 오류");
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId]);

  if (status === 'done') return <LoadedP taskId={taskId} type={type} />;
  if (status === 'error') return <FailedP message={error} />;
  return <LoadingP progress={percent} stage={stage} />;
}

export default ProcessingP;
