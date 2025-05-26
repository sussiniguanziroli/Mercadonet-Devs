// src/components/registroProveedor/steps/formSections/AutocompleteSection.jsx
import React from 'react';
import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputLabel from '@mui/material/InputLabel'; // Optional for a section label

const AutocompleteSection = ({
    control,
    errors,
    rhfName,
    options = [],
    label, // This will be the label for the Autocomplete's TextField
    placeholder = "Escribí o seleccioná",
    rules = {},
    multiple = true,
    sectionLabel, // Optional: if you want a label for the whole section distinct from the TextField label
    limitTags = -1 // MUI Autocomplete prop to limit displayed tags
}) => {
    return (
        <div className="form-section">
            {sectionLabel && (
                 <InputLabel htmlFor={rhfName} error={!!errors[rhfName]} sx={{ mb: 1.5 }}>
                    {sectionLabel}
                </InputLabel>
            )}
            <Controller
                name={rhfName}
                control={control}
                rules={rules}
                render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                        multiple={multiple}
                        id={rhfName}
                        options={options}
                        value={field.value || (multiple ? [] : null)}
                        onChange={(event, newValue) => {
                            field.onChange(newValue);
                        }}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
                        isOptionEqualToValue={(option, value) => option === value}
                        filterSelectedOptions={multiple}
                        limitTags={limitTags}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label={label}
                                placeholder={placeholder}
                                error={!!error}
                                helperText={error ? error.message : ''}
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            multiple && Array.isArray(value) ? value.map((option, index) => (
                                <Chip
                                    key={option + index}
                                    label={option}
                                    {...getTagProps({ index })}
                                    sx={{ margin: '2px' }}
                                />
                            )) : null
                        }
                        sx={{minWidth: '200px'}} // Ensure Autocomplete has a decent min-width
                    />
                )}
            />
        </div>
    );
};

export default AutocompleteSection;
