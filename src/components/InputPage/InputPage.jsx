import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceCalculator from '../common/ResourceCalculator';
import FHPList from './FHPList';
import {Button, Container, Paper, Typography, Box} from '@mui/material';

const InputPage = () => {
    const navigate = useNavigate();

    // Начальные параметры организации
    const initialOrgParams = {
        St: null,
        Dr: null,
        Do: null,
        Rvp: null,
        Rom: null,
        Pt: null,
        N: null,
        t: null
    };

    // Начальные данные для ФХП
    const calculateDefaultFHP = () => ({
        // Вероятность нарушений (X1-X8)
        X1: 0, X2: 0, X3: 0, X4: 0, X5: 0, X6: 0, X7: 0, X8: 0,
        // Последствия нарушений (Y1-Y8)
        Y1: 0, Y2: 0, Y3: 0, Y4: 0, Y5: 0, Y6: 0, Y7: 0, Y8: 0,
        // Факторы сложности (k1-k7)
        k1: 0, k2: 0, k3: 0, k4: 0, k5: 0, k6: 0, k7: 0
    });

    const [orgParams, setOrgParams] = useState(initialOrgParams);
    const [fhps, setFhps] = useState([calculateDefaultFHP()]);
    const [fhpTitles, setFhpTitles] = useState(['ФХП 1']);

    // Загрузка данных из localStorage при инициализации
    useEffect(() => {
        const savedOrgParams = localStorage.getItem('orgParams');
        const savedFhps = localStorage.getItem('fhps');
        const savedFhpTitles = localStorage.getItem('fhpTitles');

        if (savedOrgParams) {
            setOrgParams(JSON.parse(savedOrgParams));
        }

        if (savedFhps) {
            setFhps(JSON.parse(savedFhps));
        }

        if (savedFhpTitles) {
            setFhpTitles(JSON.parse(savedFhpTitles));
        }
    }, []);

    // Сохранение данных в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('orgParams', JSON.stringify(orgParams));
    }, [orgParams]);

    useEffect(() => {
        localStorage.setItem('fhps', JSON.stringify(fhps));
    }, [fhps]);

    useEffect(() => {
        localStorage.setItem('fhpTitles', JSON.stringify(fhpTitles));
    }, [fhpTitles]);

    const handleOrgParamChange = (key, value) => {
        setOrgParams(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAddFHP = () => {
        setFhps(prev => [...prev, calculateDefaultFHP()]);
        const newTitle = `ФХП ${fhps.length + 1}`;
        setFhpTitles(prev => [...prev, newTitle]);
    };

    const handleEditFHP = (index, title, fhpData) => {
        const newFhps = [...fhps];
        newFhps[index] = fhpData;
        setFhps(newFhps);

        const newTitles = [...fhpTitles];
        newTitles[index] = title;
        setFhpTitles(newTitles);
    };

    const handleDeleteFHP = (index) => {
        if (window.confirm("Вы уверены, что хотите удалить этот ФХП?")) {
            const newFhps = fhps.filter((_, i) => i !== index);
            const newTitles = fhpTitles.filter((_, i) => i !== index);

            setFhps(newFhps);
            setFhpTitles(newTitles);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const requiredFields = ['St', 'Dr', 'Do', 'Rvp', 'Rom', 'Pt', 'N', 't'];
        const missingFields = requiredFields.filter(field => orgParams[field] === null || orgParams[field] === '');

        if (missingFields.length > 0) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Сохранение данных в localStorage
        localStorage.setItem('orgParams', JSON.stringify(orgParams));
        localStorage.setItem('fhps', JSON.stringify(fhps));
        localStorage.setItem('fhpTitles', JSON.stringify(fhpTitles));

        // Переход на страницу результатов
        navigate('/results');
    };

    const handleClearMemory = () => {
        if (window.confirm("Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.")) {
            // Очищаем localStorage
            localStorage.clear();

            // Сбрасываем состояние к начальным значениям
            setOrgParams(initialOrgParams);
            setFhps([calculateDefaultFHP()]);
            setFhpTitles(['ФХП 1']);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Планирование внутренних проверок
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClearMemory}
                    >
                        Очистить память
                    </Button>
                </Box>

                <form onSubmit={handleSubmit}>
                    <ResourceCalculator
                        orgParams={orgParams}
                        onChange={handleOrgParamChange}
                    />

                    <FHPList
                        fhps={fhps}
                        onAddFHP={handleAddFHP}
                        onEditFHP={handleEditFHP}
                        onDeleteFHP={handleDeleteFHP}
                        fhpTitles={fhpTitles}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
                    >
                        Рассчитать
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default InputPage;