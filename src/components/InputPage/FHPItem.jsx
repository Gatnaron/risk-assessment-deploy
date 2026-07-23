import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { calculateXS, calculateYS, calculateKS } from '../../utils/calculations';

const FHPItem = ({ fhp, title, onEdit, onDelete, index, settings }) => {
    const xs = calculateXS([fhp])[0];
    const ys = calculateYS([fhp])[0];
    const z = xs + ys;
    const kS = calculateKS([fhp])[0];

    const calculateK = (kS, customKValues) => {
        if (kS < 7 || kS > 21) {
            return null;
        }

        if (customKValues) {
            if (kS >= 7 && kS <= 11) return customKValues.range1;
            if (kS >= 12 && kS <= 16) return customKValues.range2;
            if (kS >= 17 && kS <= 21) return customKValues.range3;
        }

        // Стандартные значения, если пользовательские не заданы
        if (kS >= 7 && kS <= 11) return 1;
        if (kS >= 12 && kS <= 16) return 1.25;
        return 1.5;
    };

    const k = calculateK(kS, fhp.customKValues);

    return (
        <Card sx={{ mb: 2, position: 'relative' }}>
            <IconButton
                aria-label="edit"
                onClick={() => onEdit(index)}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 40,
                    zIndex: 10
                }}
            >
                <EditIcon />
            </IconButton>

            <IconButton
                aria-label="delete"
                onClick={() => onDelete(index)}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    color: 'error.main'
                }}
            >
                <DeleteIcon />
            </IconButton>

            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Уровень риска (Z):</Typography>
                    <Typography variant="body2" fontWeight="bold">{z.toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Вероятность нарушений (XS):</Typography>
                    <Typography variant="body2">{xs.toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Последствия нарушений (YS):</Typography>
                    <Typography variant="body2">{ys.toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Сложность проверки (kS):</Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: kS >= 7 && kS <= 21 ? 'inherit' : 'error.main' }}
                    >
                        {kS}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Коэффициент сложности (k):</Typography>
                    <Typography variant="body2">{k !== null ? k : 'Ошибка'}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default FHPItem;