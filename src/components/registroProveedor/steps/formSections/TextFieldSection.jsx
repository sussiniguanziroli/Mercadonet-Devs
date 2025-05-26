// src/components/registroProveedor/steps/formSections/TextFieldSection.jsx
import React from 'react';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel'; // Optional: if you want a separate label above

const TextFieldSection = ({
    control,
    errors,
    rhfName,
    label,
    rules = {},
    multiline = false,
    rows = 1,
    maxLength,
    placeholder = '',
    type = 'text',
    sectionLabel // Optional: if you want a label for the whole section distinct from the TextField label
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
                render={({ field, fieldState: { error } }) => {
                    const currentLength = field.value?.length || 0;
                    let helperText = error ? error.message : '';
                    if (maxLength && !error) {
                        helperText = `${currentLength}/${maxLength}`;
                    } else if (maxLength && error) {
                        helperText = `${error.message} (${currentLength}/${maxLength})`;
                    }

                    return (
                        <TextField
                            {...field}
                            id={rhfName}
                            type={type}
                            label={label}
                            multiline={multiline}
                            rows={rows}
                            variant="outlined"
                            fullWidth
                            placeholder={placeholder}
                            error={!!error}
                            helperText={helperText}
                            inputProps={{ maxLength: maxLength }}
                            InputLabelProps={{ shrink: true }}
                        />
                    );
                }}
            />
        </div>
    );
};

export default TextFieldSection;
