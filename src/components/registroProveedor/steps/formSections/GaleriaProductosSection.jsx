// src/components/registroProveedor/steps/formSections/GaleriaProductosSection.jsx
import React from 'react';
import GaleriaProductoItem from './GaleriaProductoItem';

const GaleriaProductosSection = ({
    control,
    register,
    errors,
    galeriaFields, // from useFieldArray in the parent
    watch,
    fileUploadProgress = {},
    onInitiateUpload,
    onRemoveImage,
    limiteProductos = 6,
    productosObligatorios = 3,
    sectionTitle = "Galería de Productos"
}) => {
    return (
        <div className="form-section galeria-productos">
            <h3>
                {sectionTitle} (Hasta {limiteProductos}, primeros {productosObligatorios} obligatorios)
            </h3>
            <div 
                className="galeria-grid" 
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '20px',
                    marginTop: '15px'
                }}
            >
                {galeriaFields.map((fieldItem, index) => (
                    <GaleriaProductoItem
                        key={fieldItem.id} // id from useFieldArray
                        index={index}
                        control={control}
                        register={register}
                        errors={errors}
                        watch={watch}
                        fileUploadProgress={fileUploadProgress}
                        onInitiateUpload={onInitiateUpload}
                        onRemoveImage={onRemoveImage}
                        esObligatorio={index < productosObligatorios}
                    />
                ))}
            </div>
        </div>
    );
};

export default GaleriaProductosSection;
