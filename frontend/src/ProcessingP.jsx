import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingP from "./LoadingP";
import LoadedP from './LoadedP';
import FailedP from './FailedP';
import axios from 'axios';

function ProcessingP() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("processing");
    const [type, setType] = useState("quick");
  
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("type");
      setType(t || "quick");
  
      const interval = setInterval(() => {
        axios.get(`http://localhost:8000/analyze/status/${taskId}`)
          .then(res => {
            const s = res.data.status;
            if (s === "done" || s === "error") {
              clearInterval(interval);
              setStatus(s);
            }
          })
          .catch(err => {
            console.error("상태 조회 실패:", err);
          });
      }, 3000);  // 3초마다 확인

    return () => clearInterval(interval);
    }, [taskId]);

    if (status === "processing") return <LoadingP />;
    if (status === "done") return <LoadedP taskId={taskId} type={type} />;
    if (status === "error") return <FailedP taskId={taskId} />;
}   

export default ProcessingP;