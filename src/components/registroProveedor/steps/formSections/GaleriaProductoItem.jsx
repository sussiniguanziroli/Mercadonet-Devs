// src/components/registroProveedor/steps/formSections/GaleriaProductoItem.jsx
import React from 'react';
import { Controller } from 'react-hook-form';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { FaTimes } from 'react-icons/fa';
import FileUploaderRHF from '../common/FileUploaderRHF';
import FileProgressIndicator from '../common/FileProgressIndicator';

const GaleriaProductoItem = ({
    index,
    control,
    register,
    errors,
    watch,
    fileUploadProgress = {},
    onInitiateUpload,
    onRemoveImage,
    esObligatorio,
    requiredSymbol = "*"
}) => {
    const rhfBaseName = `galeria.${index}`;
    const imagenFileRhfName = `${rhfBaseName}.imagenFile`;
    const tituloRhfName = `${rhfBaseName}.titulo`;
    const precioRhfName = `${rhfBaseName}.precio`;

    const currentImagenFile = watch(imagenFileRhfName);
    const currentTempId = currentImagenFile?.tempId;
    const progressInfoForThisFile = currentTempId ? fileUploadProgress[currentTempId] : null;

    const errorSpanStyle = { color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', display: 'block' };

    return (
        <div className="producto-card" style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <InputLabel 
                htmlFor={`${imagenFileRhfName}-uploader`} 
                error={!!errors.galeria?.[index]?.imagenFile} 
                sx={{ mb: 0.5, fontSize: '0.9rem', fontWeight: '500' }}
            >
                Producto {index + 1} {esObligatorio && <span style={{ color: 'red' }}>{requiredSymbol}</span>}
            </InputLabel>
            
            <div 
                className="single-preview" 
                style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: `1px dashed ${errors.galeria?.[index]?.imagenFile ? '#d32f2f' : '#ccc'}`, 
                    borderRadius: '4px', 
                    minHeight: '150px', 
                    padding: '10px',
                    backgroundColor: '#f9f9f9'
                }}
            >
                {currentImagenFile?.preview && currentImagenFile?.status !== 'removed' && (
                    <div style={{ position: 'relative', marginBottom: progressInfoForThisFile ? '25px' : '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img 
                            src={currentImagenFile.preview} 
                            alt={currentImagenFile.name || `Preview ${index + 1}`} 
                            style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', display: 'block' }} 
                        />
                        <button 
                            type="button" 
                            onClick={() => onRemoveImage(index)} 
                            className="remove-button"
                            style={{ 
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px', 
                                zIndex: 3, 
                                background: 'rgba(0,0,0,0.5)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '20px', 
                                height: '20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {(!currentImagenFile || currentImagenFile?.status === 'removed' || (progressInfoForThisFile?.status === 'error')) && (
                    <Controller
                        name={imagenFileRhfName}
                        control={control}
                        rules={esObligatorio ? {
                            required: 'Imagen requerida',
                            validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }
                        } : {
                            validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }
                        }}
                        render={({ field: controllerField }) => (
                            <FileUploaderRHF
                                field={controllerField}
                                multiple={false}
                                acceptProp="image/*"
                                label={(currentImagenFile?.preview && currentImagenFile?.status !== 'removed') ? "Cambiar" : "Subir imagen"}
                                isGaleria={true} // Prop for specific styling/logic in FileUploaderRHF if needed
                                maxFiles={1}
                                itemIndex={index} 
                                onFileProcessed={({ file, tempId, itemIndex: galleryItemIndex }) => {
                                    if (onInitiateUpload) {
                                        onInitiateUpload({ file, tempId, itemIndex: galleryItemIndex });
                                    }
                                }}
                            />
                        )}
                    />
                )}
                {progressInfoForThisFile && <FileProgressIndicator progressInfo={progressInfoForThisFile} />}
            </div>
            {errors.galeria?.[index]?.imagenFile && (
                <FormHelperText error sx={{ fontSize: '0.75rem', marginTop: '-5px', textAlign: 'center' }}>
                    {errors.galeria[index].imagenFile.message || errors.galeria[index].imagenFile.type}
                </FormHelperText>
            )}

            <div className="form-field-html-group">
                <label htmlFor={tituloRhfName}>Título {esObligatorio && <span style={{ color: 'red' }}>{requiredSymbol}</span>}</label>
                <input
                    type="text"
                    id={tituloRhfName}
                    placeholder="Título producto"
                    {...register(tituloRhfName, esObligatorio ? { required: 'Título requerido' } : {})}
                    className={errors.galeria?.[index]?.titulo ? 'input-error' : ''}
                />
                {errors.galeria?.[index]?.titulo && <span style={errorSpanStyle}>{errors.galeria[index].titulo.message}</span>}
            </div>

            <div className="form-field-html-group">
                <label htmlFor={precioRhfName}>Precio {esObligatorio && <span style={{ color: 'red' }}>{requiredSymbol}</span>}</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '4px', fontSize: '1em', color: errors.galeria?.[index]?.precio ? '#d32f2f' : 'inherit' }}>$</span>
                    <input
                        type="text"
                        id={precioRhfName}
                        placeholder="100.00"
                        {...register(precioRhfName, {
                            ...(esObligatorio && { required: 'Precio requerido' }),
                            pattern: { value: /^\d*([.,]\d{0,2})?$/, message: 'Precio inválido (ej: 100 o 100.99)' }
                        })}
                        className={errors.galeria?.[index]?.precio ? 'input-error' : ''}
                        style={{ flexGrow: 1 }}
                    />
                </div>
                {errors.galeria?.[index]?.precio && <span style={errorSpanStyle}>{errors.galeria[index].precio.message}</span>}
            </div>
        </div>
    );
};

export default GaleriaProductoItem;