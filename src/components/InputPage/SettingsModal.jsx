import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {defaultSettings} from "../../utils/settings";

const SettingsModal = ({ open, onClose, settings, onSave }) => {
    const [currentSettings, setCurrentSettings] = useState({ ...settings });
    const [activeTab, setActiveTab] = useState(0);

    const handleCriterionNameChange = (section, criterionIndex, value) => {
        setCurrentSettings(prev => {
            const newSettings = { ...prev };
            if (newSettings[section] && Array.isArray(newSettings[section]) && newSettings[section][criterionIndex]) {
                newSettings[section] = [...newSettings[section]];
                newSettings[section][criterionIndex] = {
                    ...newSettings[section][criterionIndex],
                    name: value
                };
            }
            return newSettings;
        });
    };

    const handleOptionLabelChange = (section, criterionIndex, optionIndex, value) => {
        setCurrentSettings(prev => {
            const newSettings = { ...prev };
            // Проверяем, что все необходимые уровни существуют
            if (newSettings[section] &&
                Array.isArray(newSettings[section]) &&
                newSettings[section][criterionIndex] &&
                newSettings[section][criterionIndex].options &&
                Array.isArray(newSettings[section][criterionIndex].options) &&
                newSettings[section][criterionIndex].options[optionIndex]) {

                newSettings[section] = [...newSettings[section]];
                newSettings[section][criterionIndex] = {
                    ...newSettings[section][criterionIndex]
                };
                newSettings[section][criterionIndex].options = [
                    ...newSettings[section][criterionIndex].options
                ];
                newSettings[section][criterionIndex].options[optionIndex] = {
                    ...newSettings[section][criterionIndex].options[optionIndex],
                    label: value
                };
            }
            return newSettings;
        });
    };

    const handleOrgParamChange = (paramIndex, field, value) => {
        setCurrentSettings(prev => {
            const newSettings = { ...prev };
            if (newSettings.orgParams &&
                Array.isArray(newSettings.orgParams) &&
                newSettings.orgParams[paramIndex]) {

                newSettings.orgParams = [...newSettings.orgParams];
                newSettings.orgParams[paramIndex] = {
                    ...newSettings.orgParams[paramIndex],
                    [field]: value
                };
            }
            return newSettings;
        });
    };

    const saveSettings = () => {
        onSave(currentSettings);
    };

    const resetToDefaults = () => {
        setCurrentSettings({ ...defaultSettings });
    };

    const renderCriteriaOptions = (section, criterionIndex) => {
        // Проверяем, что секция существует и это массив
        if (!currentSettings[section] || !Array.isArray(currentSettings[section])) {
            return null;
        }

        // Проверяем, что критерий с таким индексом существует
        const criteria = currentSettings[section][criterionIndex];
        if (!criteria) {
            return null;
        }

        // Проверяем, что options существует и это массив
        const options = criteria.options && Array.isArray(criteria.options) ? criteria.options : [];

        return (
            <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, fontWeight: 'bold' }}>
                    Варианты ответов для "{criteria.name}":
                </Typography>
                {options.map((option, optionIndex) => (
                    <TextField
                        key={option.value}
                        label={`Значение ${option.value}: "${option.label}"`}
                        value={option.label}
                        onChange={(e) => handleOptionLabelChange(section, criterionIndex, optionIndex, e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                ))}
            </AccordionDetails>
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
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
            }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Настройки приложения
                </Typography>

                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Критерии вероятности" />
                    <Tab label="Критерии последствий" />
                    <Tab label="Критерии сложности" />
                    <Tab label="Параметры организации" />
                </Tabs>

                {activeTab === 0 && (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            Критерии оценки вероятности нарушений в ФХП
                        </Typography>
                        {Array.isArray(currentSettings.probabilityCriteria) && currentSettings.probabilityCriteria.map((criterion, index) => (
                            <Accordion key={criterion.id || index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>Критерий {criterion.id || `X${index + 1}`}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TextField
                                        label="Название критерия"
                                        value={criterion.name || ''}
                                        onChange={(e) => handleCriterionNameChange('probabilityCriteria', index, e.target.value)}
                                        fullWidth
                                        margin="normal"
                                    />
                                    {renderCriteriaOptions('probabilityCriteria', index)}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                )}

                {activeTab === 1 && (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            Критерии оценки последствий нарушений в ФХП
                        </Typography>
                        {Array.isArray(currentSettings.consequenceCriteria) && currentSettings.consequenceCriteria.map((criterion, index) => (
                            <Accordion key={criterion.id || index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>Критерий {criterion.id || `Y${index + 1}`}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TextField
                                        label="Название критерия"
                                        value={criterion.name || ''}
                                        onChange={(e) => handleCriterionNameChange('consequenceCriteria', index, e.target.value)}
                                        fullWidth
                                        margin="normal"
                                    />
                                    {renderCriteriaOptions('consequenceCriteria', index)}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                )}

                {activeTab === 2 && (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            Факторы влияния на сложность внутренней проверки
                        </Typography>
                        {Array.isArray(currentSettings.complexityCriteria) && currentSettings.complexityCriteria.map((criterion, index) => (
                            <Accordion key={criterion.id || index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>Критерий {criterion.id || `k${index + 1}`}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TextField
                                        label="Название критерия"
                                        value={criterion.name || ''}
                                        onChange={(e) => handleCriterionNameChange('complexityCriteria', index, e.target.value)}
                                        fullWidth
                                        margin="normal"
                                    />
                                    {renderCriteriaOptions('complexityCriteria', index)}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                )}

                {activeTab === 3 && (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            Параметры организации
                        </Typography>
                        {Array.isArray(currentSettings.orgParams) && currentSettings.orgParams.map((param, index) => (
                            <div key={param.key || index}>
                                <TextField
                                    label={`Название для ${param.key || `param${index}`}`}
                                    value={param.name || ''}
                                    onChange={(e) => handleOrgParamChange(index, 'name', e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <Button variant="outlined" onClick={resetToDefaults}>
                        По умолчанию
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="contained" onClick={saveSettings} color="primary">
                        Сохранить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default SettingsModal;