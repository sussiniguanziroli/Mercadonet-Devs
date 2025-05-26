// src/components/registroProveedor/steps/formSections/LogoUploadSection.jsx

import React from 'react';
import { Controller } from 'react-hook-form';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { FaTimes } from 'react-icons/fa';

// Assuming FileUploaderRHF and FileProgressIndicator are in a shared location or utilities
// Adjust the import path as per your project structure.
// For example, if they are in a 'common' or 'utils' folder within 'registroProveedor' or higher up:
import FileUploaderRHF from '../common/FileUploaderRHF'; // Or your actual path
import FileProgressIndicator from '../common/FileProgressIndicator'; // Or your actual path

const LogoUploadSection = ({
    control,                    // RHF control object
    errors,                     // RHF errors object
    rhfName = "logoFile",       // Name for RHF (Controller name)
    watchedValue,               // The output of watch(rhfName) from the parent form
    fileUploadProgress = {},    // Progress object from the parent form
    onInitiateUpload,           // Callback: ({ file: File, tempId: string }) => void
    onRemove,                   // Callback: () => void
    sectionLabel = "Logo",      // Label for the whole section
    uploaderLabel = "Arrastra tu logo",
    changeUploaderLabel = "Cambiar logo"
}) => {
    const currentTempId = watchedValue?.tempId;
    const progressInfoForThisFile = currentTempId ? fileUploadProgress[currentTempId] : null;

    return (
        <div className="form-section">
            <InputLabel htmlFor={`${rhfName}-uploader`} error={!!errors[rhfName]}>
                {sectionLabel}
            </InputLabel>

            {watchedValue?.preview && watchedValue?.status !== 'removed' && (
                <div className="logo-preview-container" style={{ position: 'relative', marginBottom: '10px', width: 'fit-content' }}>
                    <img 
                        src={watchedValue.preview} 
                        alt={watchedValue.name || "Vista previa del Logo"} 
                        style={{ maxWidth: '200px', maxHeight: '200px', display: 'block', border: '1px solid #ddd' }} 
                    />
                    <button 
                        type="button" 
                        onClick={onRemove} 
                        className="remove-button" // Ensure you have CSS for this class
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
            )}

            {(!watchedValue || watchedValue?.status === 'removed' || (progressInfoForThisFile?.status === 'error')) && (
                <Controller
                    name={rhfName}
                    control={control}
                    rules={{ 
                        validate: { 
                            fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo se permiten imágenes.' : true 
                        } 
                    }}
                    render={({ field }) => (
                        <FileUploaderRHF
                            field={field}
                            multiple={false}
                            acceptProp="image/*"
                            label={watchedValue?.preview && watchedValue?.status !== 'removed' ? changeUploaderLabel : uploaderLabel}
                            isLogo={true} // This prop might be used by FileUploaderRHF for specific styling/logic
                            maxFiles={1}
                            onFileProcessed={({ file, tempId }) => { // FileUploaderRHF calls this
                                if (onInitiateUpload) {
                                    onInitiateUpload({ file, tempId });
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

export default LogoUploadSection;