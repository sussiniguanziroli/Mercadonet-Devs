// src/components/registroProveedor/common/FileUploaderRHF.jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';

const generateClientSideId = () => `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const parseAcceptString = (acceptString) => {
    if (typeof acceptString !== 'string') return acceptString;
    const types = acceptString.split(',');
    const parsed = {};
    types.forEach(type => {
        const trimmedType = type.trim();
        if (trimmedType) {
            parsed[trimmedType] = [];
        }
    });
    return parsed;
};

const FileUploaderRHF = ({
    field,
    multiple = true,
    accept: acceptProp,
    label = 'Arrastra archivos aquí o haz clic',
    currentFilesCount = 0,
    limit = 7, // Default relevant for carousel
    isLogo = false,
    isGaleria = false, // To distinguish gallery item uploads
    onFileProcessed,  // Callback: ({ file: File, tempId: string, itemIndex?: number }) => void
    itemIndex         // Used for gallery items to pass their index
}) => {
    const processedAccept = parseAcceptString(acceptProp);

    const onDrop = useCallback(acceptedFiles => {
        if (isLogo || isGaleria) {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const tempId = generateClientSideId();
                const fileData = {
                    file: file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    type: file.type,
                    isExisting: false,
                    tempId: tempId,
                    status: 'selected'
                };

                if (field.value && field.value.preview && field.value.preview.startsWith('blob:') && !field.value.isExisting && field.value.status !== 'loaded') {
                    URL.revokeObjectURL(field.value.preview);
                }
                field.onChange(fileData);

                if (onFileProcessed) {
                    onFileProcessed({ file: fileData.file, tempId: fileData.tempId, itemIndex });
                }
            }
        } else { // For carousel (multiple files)
            const espaciosDisponibles = limit - currentFilesCount;
            const archivosAAgregar = acceptedFiles.slice(0, espaciosDisponibles);

            if (archivosAAgregar.length > 0) {
                const processedNewFiles = [];
                const nuevosMediaItemsRHF = archivosAAgregar.map((file, idx) => {
                    const tempId = generateClientSideId();
                    const rhfItem = {
                        file: file,
                        url: URL.createObjectURL(file),
                        fileType: file.type.startsWith('video/') ? 'video' : 'image',
                        mimeType: file.type,
                        name: file.name,
                        isExisting: false,
                        tempId: tempId,
                        status: 'selected'
                    };
                    processedNewFiles.push({ 
                        file: rhfItem.file, 
                        tempId: rhfItem.tempId, 
                        itemIndex: (field.value || []).length + idx // Index in the context of the RHF array
                    });
                    return rhfItem;
                });

                const currentItems = field.value || [];
                field.onChange([...currentItems, ...nuevosMediaItemsRHF]);

                if (onFileProcessed) {
                    processedNewFiles.forEach(newFilePayload => {
                        onFileProcessed(newFilePayload);
                    });
                }
            }
            if (acceptedFiles.length > archivosAAgregar.length) {
                alert(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite de ${limit}.`);
            }
        }
    }, [
        field, 
        multiple, 
        limit, 
        currentFilesCount, 
        processedAccept, 
        isLogo, 
        isGaleria, 
        onFileProcessed, 
        itemIndex
    ]);

    const maxFilesConfig = isLogo || isGaleria ? 1 : (multiple ? undefined : 1);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple: !isLogo && !isGaleria && multiple, // Multiple only if not logo/galeria and multiple prop is true
        maxFiles: maxFilesConfig,
        onDrop
    });

    const uploaderClassName = `file-uploader-container ${isDragActive ? 'drag-active' : ''} ${isGaleria ? 'galeria-uploader' : ''}`;
    const iconSize = isGaleria ? 20 : 24;
    const textSizeStyle = isGaleria ? { fontSize: '0.8em' } : {};

    return (
        <div {...getRootProps()} className={uploaderClassName}>
            <input {...getInputProps()} />
            <div className="file-uploader-content">
                <FaFileCirclePlus size={iconSize} />
                <p style={textSizeStyle}>{label}</p>
            </div>
        </div>
    );
};

export default FileUploaderRHF;
