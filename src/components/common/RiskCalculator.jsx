import React from 'react';
import { Card, CardContent, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RiskCalculator = ({ fhp, onChange, title, settings }) => {
    const criteriaGroups = [
        {
            name: 'Вероятность нарушений',
            prefix: 'X',
            count: 8,
            description: 'X1–X8',
            options: settings.xyOptions,
            criteria: settings.probabilityCriteria
        },
        {
            name: 'Последствия нарушений',
            prefix: 'Y',
            count: 8,
            description: 'Y1–Y8',
            options: settings.xyOptions,
            criteria: settings.consequenceCriteria
        },
        {
            name: 'Факторы сложности',
            prefix: 'k',
            count: 7,
            description: 'k1–k7',
            options: settings.kOptions,
            criteria: settings.complexityCriteria
        }
    ];

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>

                {criteriaGroups.map((group, groupIndex) => (
                    <Accordion key={groupIndex}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{group.name} ({group.description})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2}>
                                {group.criteria.map((criterion, i) => {
                                    const key = `${group.prefix}${i + 1}`;
                                    return (
                                        <Box key={key}>
                                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                {criterion.name}
                                            </Typography>
                                            <select
                                                value={fhp[key]}
                                                onChange={e => onChange(key, parseInt(e.target.value))}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >
                                                {group.options.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    );
};

export default RiskCalculator;