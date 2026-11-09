import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem, Collapse, Alert
} from '@mui/material';
import { calculateKS } from '../../utils/calculations';
import { defaultSettings } from '../../utils/settings';

const calculateKFromKS = (kS, values) => {
    if (kS >= 0 && kS <= 7) return values.range1;
    if (kS >= 8 && kS <= 14) return values.range2;
    if (kS >= 15 && kS <= 21) return values.range3;

    return null;
};

const FHPModal = ({ open, onClose, fhp, onSave, onDelete, title, settings = defaultSettings }) => {
    const [formData, setFormData] = useState({ ...fhp });
    const [kS, setKS] = useState(0);
    const [k, setK] = useState(1);
    const [fhpTitle, setFhpTitle] = useState(title || `ФХП ${Date.now()}`);
    const [kValues, setKValues] = useState({
        range1: 1,
        range2: 1.25,
        range3: 1.5
    });
    const [inputValues, setInputValues] = useState({
        range1: '1',
        range2: '1.25',
        range3: '1.5'
    });
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    // Обновляем данные при открытии модального окна
    useEffect(() => {
        if (open && settings) {

            // Проверяем, что fhp содержит все необходимые поля
            const numericFhp = {...fhp};
            const allKeys = [...Array(8).keys()].map(i => `X${i+1}`)
                .concat([...Array(8).keys()].map(i => `Y${i+1}`))
                .concat([...Array(7).keys()].map(i => `k${i+1}`));

            allKeys.forEach(key => {
                if (numericFhp[key] === undefined) {
                    if (key.startsWith('k')) {
                        numericFhp[key] = 1;
                    } else {
                        numericFhp[key] = 0;
                    }
                } else {
                    numericFhp[key] = Number(numericFhp[key]);
                }
            });

            setFormData(numericFhp);

            // Проверяем, есть ли сохраненные пользовательские значения k
            let newKValues, newInputValues;
            if (fhp.customKValues) {
                newKValues = {
                    range1: Number(fhp.customKValues.range1),
                    range2: Number(fhp.customKValues.range2),
                    range3: Number(fhp.customKValues.range3)
                };
                newInputValues = {
                    range1: fhp.customKValues.range1.toString(),
                    range2: fhp.customKValues.range2.toString(),
                    range3: fhp.customKValues.range3.toString()
                };
            } else {
                newKValues = {
                    range1: 1,
                    range2: 1.25,
                    range3: 1.5
                };
                newInputValues = {
                    range1: '1',
                    range2: '1.25',
                    range3: '1.5'
                };
            }

            setKValues(newKValues);
            setInputValues(newInputValues);
            setFhpTitle(title || `ФХП ${Date.now()}`);

            const calculatedKS = calculateKS([numericFhp])[0];
            setKS(calculatedKS);
            setK(calculateKFromKS(calculatedKS, newKValues));
        }
    }, [open, fhp, title, settings]);

    // Пересчитываем kS при изменении данных
    useEffect(() => {
        const calculatedKS = ['k1','k2','k3','k4','k5','k6','k7']
            .reduce((sum, key) => sum + (formData[key] || 0), 0);
        setKS(calculatedKS);
        setK(calculateKFromKS(calculatedKS, kValues));
    }, [formData, kValues]);

    const handleChange = (key, value) => {
        // Преобразуем значение в число
        const numericValue = Number(value);
        setFormData(prev => ({
            ...prev,
            [key]: numericValue
        }));
    };

    const handleKValueChange = (range, value) => {
        // Разрешаем только цифры, точку и пустую строку
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
            return;
        }

        // Проверяем количество точек (должна быть не больше одной)
        if ((value.match(/\./g) || []).length > 1) {
            return;
        }

        // Обновляем временное значение для отображения
        setInputValues(prev => ({
            ...prev,
            [range]: value
        }));

        // Если значение является валидным числом, обновляем kValues
        if (value === '' || !isNaN(Number(value))) {
            const numValue = value === '' ? '' : Number(value);
            setKValues(prev => ({
                ...prev,
                [range]: numValue
            }));
        }
    };

    const handleSave = () => {
        if (kS < 0 || kS > 21) {
            setError(`Значение ConS (${kS}) должно быть в диапазоне от 0 до 21`);
            setShowError(true);

            // Скрываем сообщение об ошибке через 5 секунд
            setTimeout(() => {
                setShowError(false);
            }, 5000);

            return;
        }

        const updatedFhp = {
            ...formData,
            k: k,
            customKValues: kValues
        };

        // ВСЕГДА сохраняем ТЕКУЩИЕ глобальные настройки в usedSettings
        updatedFhp.usedSettings = {
            probabilityCriteria: settings.probabilityCriteria.map(c => ({...c})),
            consequenceCriteria: settings.consequenceCriteria.map(c => ({...c})),
            complexityCriteria: settings.complexityCriteria.map(c => ({...c}))
        };

        onSave(fhpTitle, updatedFhp);
        onClose();
    };

    const handleDelete = () => {
        onClose();
        onDelete();
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh',
        overflow: 'auto'
    };

    const isKSValid = kS >= 7 && kS <= 21;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
                    Редактирование ФХП
                </Typography>

                <FormControl fullWidth margin="normal">
                    <TextField
                        label="Название ФХП"
                        value={fhpTitle}
                        onChange={(e) => setFhpTitle(e.target.value)}
                        variant="outlined"
                    />
                </FormControl>


                <div className="modal-criteria">
                    {[
                        { logic: 'X', display: 'P', type: 'probabilityCriteria', title: 'Критерии вероятности нарушений' },
                        { logic: 'Y', display: 'C', type: 'consequenceCriteria', title: 'Критерии последствий нарушений' }
                    ].map(({logic, display, type, title})  => (
                        <div key={logic}>
                            <h3>{title} ({display}1-{display}8)</h3>
                            <div className="criteria-grid">
                                {Array.from({ length: 8 }).map((_, i) => {
                                    const key = `${logic}${i + 1}`;

                                    const criterion = settings && settings[type] &&
                                    Array.isArray(settings[type]) &&
                                    settings[type][i] &&
                                    settings[type][i].name &&
                                    Array.isArray(settings[type][i].options)
                                        ? settings[type][i]
                                        : {
                                            name: key.replace('X', 'P').replace('Y', 'C'),
                                            options: [
                                                { value: 0, label: 'малозначимый' },
                                                { value: 1, label: 'низкий' },
                                                { value: 2, label: 'средний' },
                                                { value: 3, label: 'высокий' }
                                            ]
                                        };

                                    return (
                                        <FormControl key={key} fullWidth margin="dense">
                                            <InputLabel>{criterion.name}</InputLabel>
                                            <Select
                                                value={formData[key]}
                                                label={criterion.name}
                                                onChange={(e) => handleChange(key, e.target.value)}
                                            >
                                                {criterion.options && criterion.options.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <h3>Факторы сложности (Con1-Con7)</h3>
                    <div className="criteria-grid">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const key = `k${i + 1}`;
                            // Добавлена проверка на существование всех необходимых свойств
                            const criterion = settings && settings.complexityCriteria &&
                            settings.complexityCriteria[i] && settings.complexityCriteria[i].name &&
                            settings.complexityCriteria[i].options
                                ? settings.complexityCriteria[i]
                                : {
                                    name: key,
                                    options: [
                                        { value: 0, label: 'стандартный' },
                                        { value: 2, label: 'повышенный' },
                                        { value: 3, label: 'высокий' }
                                    ]
                                };
                            return (
                                <FormControl key={key} fullWidth margin="dense">
                                    <InputLabel>{criterion.name}</InputLabel>
                                    <Select
                                        value={formData[key]}
                                        label={criterion.name}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                    >
                                        {criterion.options && criterion.options.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            );
                        })}
                    </div>

                    <div className="k-calculation" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <h3>Коэффициент сложности (Con)</h3>
                        <p style={{ color: isKSValid ? 'inherit' : 'error.main' }}>
                            Интегральный показатель сложности (ConS): <strong>{kS}</strong>
                        </p>
                        <p>Текущее значение Con: <strong>{k}</strong></p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px',
                            marginTop: '15px'
                        }}>
                            <TextField
                                label="Значение для 0-7"
                                type="text"
                                value={inputValues.range1}
                                onChange={(e) => handleKValueChange('range1', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Диапазон 0 ≤ ConS ≤ 7"
                            />
                            <TextField
                                label="Значение для 8-14"
                                type="text"
                                value={inputValues.range2}
                                onChange={(e) => handleKValueChange('range2', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Диапазон 8 ≤ ConS ≤ 14"
                            />
                            <TextField
                                label="Значение для 15-21"
                                type="text"
                                value={inputValues.range3}
                                onChange={(e) => handleKValueChange('range3', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Диапазон 15 ≤ ConS ≤ 21"
                            />
                        </div>

                        <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                            <p><strong>Правила определения k:</strong></p>
                            <ul>
                                <li style={{ color: kS >= 0 && kS <= 7 ? 'inherit' : '#666' }}>Если 0 ≤ ConS ≤ 7, то k = {kValues.range1 === '' ? '—' : kValues.range1}</li>
                                <li style={{ color: kS >= 8 && kS <= 14 ? 'inherit' : '#666' }}>Если 8 ≤ ConS ≤ 14, то k = {kValues.range2 === '' ? '—' : kValues.range2}</li>
                                <li style={{ color: kS >= 15 && kS <= 21 ? 'inherit' : '#666' }}>Если 15 ≤ ConS ≤ 21, то k = {kValues.range3 === '' ? '—' : kValues.range3}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Отображаем сообщение об ошибке, если оно есть */}
                <Collapse in={showError}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                </Collapse>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                    <Button variant="outlined" color="error" onClick={handleDelete}>
                        Удалить
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="contained" onClick={handleSave} color="primary">
                        Сохранить
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default FHPModal;