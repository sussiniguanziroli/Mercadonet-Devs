// src/components/registroProveedor/steps/formSections/CarruselUploadSection.jsx
import React from 'react';
import { Controller } from 'react-hook-form';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { FaTimes } from 'react-icons/fa';
import FileUploaderRHF from '../common/FileUploaderRHF'; 
import FileProgressIndicator from '../common/FileProgressIndicator';

const CarruselUploadSection = ({
    control,
    errors,
    rhfName = "carruselMediaItems",
    watchedValue = [],
    fileUploadProgress = {},
    onInitiateUpload,
    onRemoveItem,
    limit = 7,
    sectionLabel = "Carrusel Multimedia",
    uploaderLabelPrefix = "Imágenes/Videos",
    acceptProp = "image/*,video/mp4,video/webm,video/ogg,video/quicktime"
}) => {
    const currentItemCount = (watchedValue || []).filter(item => item && item.status !== 'removed').length;

    return (
        <div className="form-section">
            <InputLabel htmlFor={`${rhfName}-uploader`} error={!!errors[rhfName]}>
                {sectionLabel} (máx. {limit})
            </InputLabel>

            {currentItemCount > 0 && (
                <div className="carrusel-previews" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', marginBottom: '10px' }}>
                    {(watchedValue || []).map((item, index) => {
                        if (!item || item.status === 'removed') return null;
                        
                        const currentTempId = item.tempId;
                        const progressInfoForThisFile = currentTempId ? fileUploadProgress[currentTempId] : null;

                        return (
                            <div 
                                key={item.tempId || item.url || index} 
                                className="carrusel-preview-item" 
                                style={{ 
                                    position: 'relative', 
                                    width: '120px', 
                                    height: '120px', 
                                    border: '1px solid #ddd',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {item.fileType === 'image' ? (
                                    <img 
                                        src={item.url || item.preview} 
                                        alt={item.name || `Contenido ${index + 1}`} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <video 
                                        controls 
                                        muted 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        src={item.url || item.preview} 
                                        type={item.mimeType}
                                    >
                                        Tu navegador no soporta video.
                                    </video>
                                )}
                                <button 
                                    type="button" 
                                    onClick={() => onRemoveItem(index)} 
                                    className="remove-button"
                                    style={{ 
                                        position: 'absolute', 
                                        top: '5px', 
                                        right: '5px', 
                                        zIndex: 3, 
                                        background: 'rgba(0,0,0,0.5)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '50%', 
                                        width: '24px', 
                                        height: '24px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    <FaTimes />
                                </button>
                                {progressInfoForThisFile && (
                                    <FileProgressIndicator progressInfo={progressInfoForThisFile} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {currentItemCount < limit && (
                <Controller
                    name={rhfName}
                    control={control}
                    rules={{
                        validate: {
                            maxItems: value => (value || []).filter(item => item && item.status !== 'removed').length <= limit || `No puedes exceder los ${limit} ítems.`
                        }
                    }}
                    render={({ field }) => (
                        <FileUploaderRHF
                            field={field}
                            multiple={true}
                            acceptProp={acceptProp}
                            label={`${uploaderLabelPrefix} (${currentItemCount}/${limit})`}
                            currentFilesCount={currentItemCount}
                            limit={limit}
                            isLogo={false} 
                            onFileProcessed={({ file, tempId, itemIndex }) => {
                                if (onInitiateUpload) {
                                    onInitiateUpload({ file, tempId, itemIndex });
                                }
                            }}
                        />
                    )}
                />
            )}
            {errors[rhfName] && (
                <FormHelperText error>
                    {errors[rhfName].message || errors[rhfName].type}
                </FormHelperText>
            )}
        </div>
    );
};

export default CarruselUploadSection;