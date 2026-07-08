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
        if (customKValues) {
            if (kS <= 7) return customKValues.range1;
            if (kS <= 14) return customKValues.range2;
            return customKValues.range3;
        }

        if (kS <= 7) return 1;
        if (kS <= 14) return 1.25;
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
                    <Typography variant="body2">{kS}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Коэффициент сложности (k):</Typography>
                    <Typography variant="body2">{k}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default FHPItem;