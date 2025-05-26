// src/components/registroProveedor/common/FileProgressIndicator.jsx
import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const FileProgressIndicator = ({ progressInfo }) => {
    if (!progressInfo || progressInfo.status === 'removed') {
        return null;
    }

    const { progress, status, errorMsg } = progressInfo;

    if (status === 'uploading') {
        return (
            <Box sx={{ width: '100%', position: 'absolute', bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2 }}>
                <LinearProgress variant="determinate" value={progress || 0} sx={{ height: '6px' }} />
                <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', display: 'block', fontSize: '0.7rem', lineHeight: '1.2' }}>
                    {`${Math.round(progress || 0)}%`}
                </Typography>
            </Box>
        );
    }

    if (status === 'success') {
        return (
            <Box sx={{ position: 'absolute', top: '5px', right: '5px', color: 'green', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '3px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCheckCircle size={16} />
            </Box>
        );
    }

    if (status === 'error') {
        return (
            <Box sx={{ position: 'absolute', top: '5px', right: '5px', color: 'red', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '3px', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={errorMsg || "Error al subir"}>
                <FaExclamationTriangle size={16} />
            </Box>
        );
    }

    return null;
};

export default FileProgressIndicator;