import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceCalculator from '../common/ResourceCalculator';
import FHPList from './FHPList';
import SettingsModal from './SettingsModal';
import {Button, Container, Paper, Typography, Box} from '@mui/material';
import { safeLocalStorage } from '../../utils/localStorage';
import { defaultSettings } from '../../utils/settings';
import { useRef } from 'react';

const InputPage = () => {
    const navigate = useNavigate();
    const settingsInputRef = useRef(null);
    const dataInputRef = useRef(null);

    // Загрузка настроек из localStorage или использование стандартных
    const [settings, setSettings] = useState(() => {
        const savedSettings = safeLocalStorage.getItem('appSettings');
        return savedSettings ? JSON.parse(savedSettings) : { ...defaultSettings };
    });

    // Экспорт настроек в файл
    const exportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `настройки_ФХП_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Экспорт введенных данных в файл
    const exportData = () => {
        const data = {
            orgParams,
            fhps,
            fhpTitles
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `данные_ФХП_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Импорт настроек из файла
    const importSettings = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (window.confirm('Импорт настроек заменит текущие настройки. Продолжить?')) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    // Проверка структуры
                    if (importedSettings.probabilityCriteria &&
                        importedSettings.consequenceCriteria &&
                        importedSettings.complexityCriteria &&
                        importedSettings.orgParams) {
                        setSettings(importedSettings);
                        alert('Настройки успешно импортированы!');
                    } else {
                        alert('Неверный формат файла настроек');
                    }
                } catch (error) {
                    alert('Ошибка при чтении файла: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };

    // Импорт данных из файла
    const importData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                // Проверка структуры
                if (importedData.orgParams && importedData.fhps && importedData.fhpTitles) {
                    setOrgParams(importedData.orgParams);
                    setFhps(importedData.fhps);
                    setFhpTitles(importedData.fhpTitles);
                    alert('Данные успешно импортированы!');
                } else {
                    alert('Неверный формат файла данных');
                }
            } catch (error) {
                alert('Ошибка при чтении файла: ' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    // Начальные параметры организации
    const initialOrgParams = {};
    settings.orgParams.forEach(param => {
        initialOrgParams[param.key] = null;
    });

    // Начальные данные для ФХП
    const calculateDefaultFHP = () => {
        const fhp = {};

        // Добавляем X критерии
        settings.probabilityCriteria.forEach(criterion => {
            fhp[criterion.id] = 0;
        });

        // Добавляем Y критерии
        settings.consequenceCriteria.forEach(criterion => {
            fhp[criterion.id] = 0;
        });

        // Добавляем k критерии
        settings.complexityCriteria.forEach(criterion => {
            fhp[criterion.id] = 0;
        });

        // Добавляем usedSettings с текущими настройками
        fhp.usedSettings = {
            probabilityCriteria: settings.probabilityCriteria.map(c => ({...c})),
            consequenceCriteria: settings.consequenceCriteria.map(c => ({...c})),
            complexityCriteria: settings.complexityCriteria.map(c => ({...c}))
        };

        return fhp;
    };

    const [orgParams, setOrgParams] = useState(() => {
        const savedOrgParams = safeLocalStorage.getItem('orgParams');
        if (savedOrgParams) {
            return JSON.parse(savedOrgParams);
        }

        // Создаем безопасную инициализацию, проверяя существование settings
        if (!settings || !settings.orgParams) {
            return {
                St: null, Dr: null, Do: null, Rvp: null, Rom: null, Pt: null, N: null, t: null
            };
        }

        const initialOrgParams = {};
        settings.orgParams.forEach(param => {
            initialOrgParams[param.key] = null;
        });
        return initialOrgParams;
    });

    const [fhps, setFhps] = useState(() => {
        const savedFhps = safeLocalStorage.getItem('fhps');
        if (savedFhps) {
            const loadedFhps = JSON.parse(savedFhps);
            const updatedFhps = loadedFhps.map(fhp => {
                if (!fhp.usedSettings) {
                    // Если usedSettings отсутствует, добавляем текущие настройки
                    return {
                        ...fhp,
                        usedSettings: {
                            probabilityCriteria: settings.probabilityCriteria.map(c => ({...c})),
                            consequenceCriteria: settings.consequenceCriteria.map(c => ({...c})),
                            complexityCriteria: settings.complexityCriteria.map(c => ({...c}))
                        }
                    };
                }
                return fhp;
            });
            return updatedFhps;
        }

        // Создаем безопасную функцию для инициализации
        const calculateDefaultFHP = () => {
            const fhp = {};

            // Проверяем наличие всех необходимых данных
            if (settings && settings.probabilityCriteria) {
                settings.probabilityCriteria.forEach(criterion => {
                    fhp[criterion.id] = 0;
                });
            } else {
                // Стандартные значения, если settings не загружен
                ['X1','X2','X3','X4','X5','X6','X7','X8'].forEach(key => {
                    fhp[key] = 0;
                });
            }

            if (settings && settings.consequenceCriteria) {
                settings.consequenceCriteria.forEach(criterion => {
                    fhp[criterion.id] = 0;
                });
            } else {
                ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8'].forEach(key => {
                    fhp[key] = 0;
                });
            }

            if (settings && settings.complexityCriteria) {
                settings.complexityCriteria.forEach(criterion => {
                    fhp[criterion.id] = 0;
                });
            } else {
                ['k1','k2','k3','k4','k5','k6','k7'].forEach(key => {
                    fhp[key] = 0;
                });
            }

            // Добавляем usedSettings с текущими настройками
            fhp.usedSettings = {
                probabilityCriteria: settings.probabilityCriteria.map(c => ({...c})),
                consequenceCriteria: settings.consequenceCriteria.map(c => ({...c})),
                complexityCriteria: settings.complexityCriteria.map(c => ({...c}))
            };

            return fhp;
        };

        return [calculateDefaultFHP()];
    });

    const [fhpTitles, setFhpTitles] = useState(() => {
        const savedFhpTitles = safeLocalStorage.getItem('fhpTitles');
        return savedFhpTitles ? JSON.parse(savedFhpTitles) : ['ФХП 1'];
    });
    const [showSettings, setShowSettings] = useState(false);

    // Загрузка данных из localStorage при инициализации
    useEffect(() => {
        const savedOrgParams = safeLocalStorage.getItem('orgParams');
        const savedFhps = safeLocalStorage.getItem('fhps');
        const savedFhpTitles = safeLocalStorage.getItem('fhpTitles');
        const savedSettings = safeLocalStorage.getItem('appSettings');

        if (savedOrgParams) {
            setOrgParams(JSON.parse(savedOrgParams));
        }

        if (savedFhps) {
            const loadedFhps = JSON.parse(savedFhps);
            const updatedFhps = loadedFhps.map(fhp => {
                if (fhp.usedSettings) {
                    return {
                        ...fhp,
                        usedSettings: {
                            probabilityCriteria: fhp.usedSettings.probabilityCriteria.map(c => ({...c})),
                            consequenceCriteria: fhp.usedSettings.consequenceCriteria.map(c => ({...c})),
                            complexityCriteria: fhp.usedSettings.complexityCriteria.map(c => ({...c}))
                        }
                    };
                }
                return fhp;
            });
            setFhps(updatedFhps);
        }

        if (savedFhpTitles) {
            setFhpTitles(JSON.parse(savedFhpTitles));
        }

        if (savedSettings) {
            const loadedSettings = JSON.parse(savedSettings);
            setSettings(loadedSettings);

            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: обновляем usedSettings для всех ФХП при загрузке настроек
            setFhps(prevFhps => prevFhps.map(fhp => ({
                ...fhp,
                usedSettings: {
                    probabilityCriteria: loadedSettings.probabilityCriteria.map(c => ({...c})),
                    consequenceCriteria: loadedSettings.consequenceCriteria.map(c => ({...c})),
                    complexityCriteria: loadedSettings.complexityCriteria.map(c => ({...c}))
                }
            })));
        }
    }, []);

    // Сохранение данных в localStorage при изменении
    useEffect(() => {
        safeLocalStorage.setItem('orgParams', JSON.stringify(orgParams));
    }, [orgParams]);

    useEffect(() => {
        safeLocalStorage.setItem('fhps', JSON.stringify(fhps));
    }, [fhps]);

    useEffect(() => {
        safeLocalStorage.setItem('fhpTitles', JSON.stringify(fhpTitles));
    }, [fhpTitles]);

    useEffect(() => {
        safeLocalStorage.setItem('appSettings', JSON.stringify(settings));

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: обновляем usedSettings для всех ФХП при изменении настроек
        setFhps(prevFhps => prevFhps.map(fhp => ({
            ...fhp,
            usedSettings: {
                probabilityCriteria: settings.probabilityCriteria.map(c => ({...c})),
                consequenceCriteria: settings.consequenceCriteria.map(c => ({...c})),
                complexityCriteria: settings.complexityCriteria.map(c => ({...c}))
            }
        })));
    }, [settings]);

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

        const requiredFields = Object.keys(initialOrgParams);
        const missingFields = requiredFields.filter(field =>
            orgParams[field] === null || orgParams[field] === ''
        );

        if (missingFields.length > 0) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Сохранение данных в localStorage
        safeLocalStorage.setItem('orgParams', JSON.stringify(orgParams));
        safeLocalStorage.setItem('fhps', JSON.stringify(fhps));
        safeLocalStorage.setItem('fhpTitles', JSON.stringify(fhpTitles));

        // Переход на страницу результатов
        navigate('/results');
    };

    const handleClearMemory = () => {
        if (window.confirm("Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.")) {
            // Очищаем localStorage
            safeLocalStorage.clear();

            // Сбрасываем состояние к начальным значениям
            setOrgParams(initialOrgParams);
            setFhps([calculateDefaultFHP()]);
            setFhpTitles(['ФХП 1']);
            setSettings({ ...defaultSettings });
        }
    };

    const openSettings = () => {
        setShowSettings(true);
    };

    const closeSettings = () => {
        setShowSettings(false);
    };

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        closeSettings();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Планирование внутренних проверок
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            onClick={openSettings}
                            sx={{ mr: 1 }}
                        >
                            Настройки
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleClearMemory}
                        >
                            Очистить память
                        </Button>
                    </Box>
                </Box>

                {/* Блок экспорта/импорта */}
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Экспорт и импорт данных
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={exportSettings}
                        >
                            Скачать настройки
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={exportData}
                        >
                            Скачать данные
                        </Button>
                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Загрузить настройки
                            <input
                                ref={settingsInputRef}
                                type="file"
                                hidden
                                accept=".json"
                                onChange={importSettings}
                            />
                        </Button>
                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Загрузить данные
                            <input
                                ref={dataInputRef}
                                type="file"
                                hidden
                                accept=".json"
                                onChange={importData}
                            />
                        </Button>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <FHPList
                        fhps={fhps}
                        onAddFHP={handleAddFHP}
                        onEditFHP={handleEditFHP}
                        onDeleteFHP={handleDeleteFHP}
                        fhpTitles={fhpTitles}
                        settings={settings}
                    />

                    <ResourceCalculator
                        orgParams={orgParams}
                        onChange={handleOrgParamChange}
                        settings={settings}
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

            <SettingsModal
                open={showSettings}
                onClose={closeSettings}
                settings={settings}
                onSave={updateSettings}
            />
        </Container>
    );
};

export default InputPage;