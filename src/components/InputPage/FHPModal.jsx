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
    MenuItem
} from '@mui/material';
import { calculateKS } from '../../utils/calculations';

const FHPModal = ({ open, onClose, fhp, onSave, onDelete, title }) => {
    const [formData, setFormData] = useState({ ...fhp });
    const [kS, setKS] = useState(0);
    const [k, setK] = useState(1);
    const [fhpTitle, setFhpTitle] = useState(title || `ФХП ${Date.now()}`);
    const [kValues, setKValues] = useState({
        range1: 1,  // Для диапазона 0-7
        range2: 1.25,  // Для диапазона 8-14
        range3: 1.5  // Для диапазона 15-21
    });
    const [inputValues, setInputValues] = useState({
        range1: '1',
        range2: '1.25',
        range3: '1.5'
    });

    // Обновляем данные при открытии модального окна
    useEffect(() => {
        if (open) {
            // Преобразуем все значения критериев в числа
            const numericFhp = {...fhp};
            ['X1','X2','X3','X4','X5','X6','X7','X8',
                'Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8',
                'k1','k2','k3','k4','k5','k6','k7'].forEach(key => {
                if (numericFhp[key] !== undefined) {
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
    }, [open, fhp, title]);

    // Пересчитываем kS при изменении данных
    useEffect(() => {
        const calculatedKS = ['k1','k2','k3','k4','k5','k6','k7']
            .reduce((sum, key) => sum + (formData[key] || 0), 0);
        setKS(calculatedKS);
        setK(calculateKFromKS(calculatedKS, kValues));
    }, [formData, kValues]);

    // Функция для вычисления k на основе пользовательских значений
    const calculateKFromKS = (kS, values = kValues) => {
        if (kS <= 7) return values.range1;
        if (kS <= 14) return values.range2;
        return values.range3;
    };

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
        const updatedFhp = {
            ...formData,
            k: k,
            customKValues: kValues
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
                    <h3>Критерии вероятности нарушений (X1-X8)</h3>
                    <div className="criteria-grid">
                        {['X1','X2','X3','X4','X5','X6','X7','X8'].map(key => (
                            <FormControl key={key} fullWidth margin="dense">
                                <InputLabel>{key}</InputLabel>
                                <Select
                                    value={formData[key]}
                                    label={key}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                >
                                    <MenuItem value={0}>малозначимый</MenuItem>
                                    <MenuItem value={1}>низкий</MenuItem>
                                    <MenuItem value={2}>средний</MenuItem>
                                    <MenuItem value={3}>высокий</MenuItem>
                                </Select>
                            </FormControl>
                        ))}
                    </div>

                    <h3>Критерии последствий нарушений (Y1-Y8)</h3>
                    <div className="criteria-grid">
                        {['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8'].map(key => (
                            <FormControl key={key} fullWidth margin="dense">
                                <InputLabel>{key}</InputLabel>
                                <Select
                                    value={formData[key]}
                                    label={key}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                >
                                    <MenuItem value={0}>малозначимый</MenuItem>
                                    <MenuItem value={1}>низкий</MenuItem>
                                    <MenuItem value={2}>средний</MenuItem>
                                    <MenuItem value={3}>высокий</MenuItem>
                                </Select>
                            </FormControl>
                        ))}
                    </div>

                    <h3>Факторы сложности (k1-k7)</h3>
                    <div className="criteria-grid">
                        {['k1','k2','k3','k4','k5','k6','k7'].map(key => (
                            <FormControl key={key} fullWidth margin="dense">
                                <InputLabel>{key}</InputLabel>
                                <Select
                                    value={formData[key]}
                                    label={key}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                >
                                    <MenuItem value={0}>стандартный</MenuItem>
                                    <MenuItem value={2}>повышенный</MenuItem>
                                    <MenuItem value={3}>высокий</MenuItem>
                                </Select>
                            </FormControl>
                        ))}
                    </div>

                    <div className="k-calculation" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <h3>Коэффициент сложности (k)</h3>
                        <p>Интегральный показатель сложности (kS): <strong>{kS}</strong></p>
                        <p>Текущее значение k: <strong>{k}</strong></p>

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
                                helperText="Диапазон 0 ≤ kS ≤ 7"
                            />
                            <TextField
                                label="Значение для 8-14"
                                type="text"
                                value={inputValues.range2}
                                onChange={(e) => handleKValueChange('range2', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Диапазон 8 ≤ kS ≤ 14"
                            />
                            <TextField
                                label="Значение для 15-21"
                                type="text"
                                value={inputValues.range3}
                                onChange={(e) => handleKValueChange('range3', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Диапазон 15 ≤ kS ≤ 21"
                            />
                        </div>

                        <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                            <p><strong>Правила определения k:</strong></p>
                            <ul>
                                <li>Если 0 ≤ kS ≤ 7, то k = {kValues.range1 === '' ? '—' : kValues.range1}</li>
                                <li>Если 8 ≤ kS ≤ 14, то k = {kValues.range2 === '' ? '—' : kValues.range2}</li>
                                <li>Если 15 ≤ kS ≤ 21, то k = {kValues.range3 === '' ? '—' : kValues.range3}</li>
                            </ul>
                        </div>
                    </div>
                </div>

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