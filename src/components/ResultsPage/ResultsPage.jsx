import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    Card,
    CardContent,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Modal,
    Fade,
    Backdrop
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    calculateXS,
    calculateYS,
    calculateZ,
    calculateKS,
    calculateKWithCustomValues,
    calculateT,
    calculateResources
} from '../../utils/calculations';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Paragraph, Table as DocxTable, TableRow as DocxTableRow,
    TableCell as DocxTableCell, WidthType, Packer } from 'docx';

const ResultsPage = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [fhpTitles, setFhpTitles] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);

    useEffect(() => {
        const orgParams = JSON.parse(localStorage.getItem('orgParams'));
        const fhps = JSON.parse(localStorage.getItem('fhps'));
        const titles = JSON.parse(localStorage.getItem('fhpTitles')) || [];

        if (!orgParams || !fhps) {
            navigate('/');
            return;
        }

        // Расчеты
        const xs = calculateXS(fhps);
        const ys = calculateYS(fhps);
        const z = calculateZ(xs, ys);
        const kS = calculateKS(fhps);

        // Обновленная функция для расчета k с учетом пользовательских значений
        const k = fhps.map((fhp, index) =>
            calculateKWithCustomValues(kS[index], fhp.customKValues)
        );

        const T = k.map(ki => calculateT(orgParams.N, orgParams.t, ki));
        const Fp = calculateResources(orgParams);

        // Формирование плана проверок
        const sorted = z.map((zi, i) => ({
            index: i,
            z: zi,
            t: T[i],
            k: k[i],
            kS: kS[i],
            xs: xs[i],
            ys: ys[i],
            customKValues: fhps[i].customKValues
        })).sort((a, b) => b.z - a.z);

        let remaining = Fp;
        const plan = [];

        for (const item of sorted) {
            if (remaining >= item.t) {
                plan.push({
                    ...item,
                    remaining: remaining
                });
                remaining -= item.t;
            }
        }

        setResults({
            orgParams,
            Fp,
            plan,
            remaining,
            totalT: Fp - remaining
        });

        setFhpTitles(titles);
    }, [navigate]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Открытие модального окна экспорта
    const handleOpenExportModal = () => {
        setExportModalOpen(true);
    };

    // Закрытие модального окна экспорта
    const handleCloseExportModal = () => {
        setExportModalOpen(false);
    };

    // Экспорт в Excel
    const exportToExcel = () => {
        if (!results) return;

        const { orgParams, Fp, plan, remaining, totalT } = results;

        // Подготовка данных для таблицы
        const excelData = plan.map((item, pos) => ({
            Позиция: pos + 1,
            ФХП: fhpTitles[item.index] || `ФХП ${item.index + 1}`,
            Z: item.z.toFixed(2),
            N: orgParams.N,
            t: orgParams.t,
            k: item.k,
            'Трудоемкость (T)': item.t,
            'Остаток ресурсов': Math.floor(item.remaining - item.t)
        }));

        // Создание рабочей книги
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Добавление заголовка
        XLSX.utils.sheet_add_aoa(ws, [['План проверок финансово-хозяйственной деятельности']], {origin: 'A1'});

        // Добавление информации об организации
        const orgInfo = [
            ['Доступные ресурсы (Fp):', `${Fp} чел-дн`],
            ['Количество сотрудников (N):', orgParams.N],
            ['Длительность проверки (t):', `${orgParams.t} дней`],
            ['Использовано ресурсов:', `${totalT} чел-дн (${((totalT / Fp) * 100).toFixed(1)}%)`],
            ['Остаток ресурсов:', `${remaining} чел-дн`]
        ];

        XLSX.utils.sheet_add_aoa(ws, orgInfo, {origin: `A${plan.length + 4}`});

        // Создание рабочей книги
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "План проверок");

        // Генерация и сохранение файла
        const fileName = `План_проверок_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        handleCloseExportModal();
    };

    // Экспорт в Word
    const exportToWord = async () => {
        if (!results) return;

        const { orgParams, Fp, plan, remaining, totalT } = results;

        // Создание стилей для документа
        const styles = {
            paragraphStyles: [
                {
                    id: "normal",
                    name: "Normal",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 28, // 14pt = 28 half-points
                        font: "Times New Roman"
                    },
                    paragraph: {
                        alignment: "BOTH"
                    }
                },
                {
                    id: "heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    quickFormat: true,
                    run: {
                        size: 28,
                        font: "Times New Roman",
                        bold: true
                    },
                    paragraph: {
                        alignment: "BOTH"
                    }
                }
            ]
        };

        // Создание документа с правильной структурой
        const doc = new Document({
            styles: styles,
            sections: [{
                properties: {},
                children: [
                    // Информация об организации
                    new Paragraph({
                        text: "Информация об организации",
                        style: "heading2"
                    }),
                    new Paragraph({
                        text: `Доступные ресурсы (Fp): ${Fp} чел-дн`,
                        style: "normal"
                    }),
                    new Paragraph({
                        text: `Количество сотрудников (N): ${orgParams.N}`,
                        style: "normal"
                    }),
                    new Paragraph({
                        text: `Длительность проверки (t): ${orgParams.t} дней`,
                        style: "normal"
                    }),
                    new Paragraph({
                        text: `Использовано ресурсов: ${totalT} чел-дн (${((totalT / Fp) * 100).toFixed(1)}%)`,
                        style: "normal"
                    }),
                    new Paragraph({
                        text: `Остаток ресурсов: ${remaining} чел-дн`,
                        style: "normal"
                    }),
                    new Paragraph({ text: "\n" }),

                    // Таблица
                    new DocxTable({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE
                        },
                        rows: [
                            new DocxTableRow({
                                children: [
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "Позиция", style: "heading2" })],
                                        width: { size: 10, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "ФХП", style: "heading2" })],
                                        width: { size: 20, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "Z", style: "heading2" })],
                                        width: { size: 10, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "N", style: "heading2" })],
                                        width: { size: 10, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "t", style: "heading2" })],
                                        width: { size: 10, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "k", style: "heading2" })],
                                        width: { size: 10, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "Трудоемкость (T)", style: "heading2" })],
                                        width: { size: 15, type: WidthType.PERCENTAGE }
                                    }),
                                    new DocxTableCell({
                                        children: [new Paragraph({ text: "Остаток ресурсов", style: "heading2" })],
                                        width: { size: 15, type: WidthType.PERCENTAGE }
                                    })
                                ]
                            }),
                            ...plan.map((item, pos) =>
                                new DocxTableRow({
                                    children: [
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: (pos + 1).toString(), style: "normal" })],
                                            width: { size: 10, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: fhpTitles[item.index] || `ФХП ${item.index + 1}`, style: "normal" })],
                                            width: { size: 20, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: item.z.toFixed(2), style: "normal" })],
                                            width: { size: 10, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: orgParams.N.toString(), style: "normal" })],
                                            width: { size: 10, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: orgParams.t.toString(), style: "normal" })],
                                            width: { size: 10, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: item.k.toString(), style: "normal" })],
                                            width: { size: 10, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: item.t.toString(), style: "normal" })],
                                            width: { size: 15, type: WidthType.PERCENTAGE }
                                        }),
                                        new DocxTableCell({
                                            children: [new Paragraph({ text: Math.floor(item.remaining - item.t).toString(), style: "normal" })],
                                            width: { size: 15, type: WidthType.PERCENTAGE }
                                        })
                                    ]
                                })
                            )
                        ]
                    }),
                    new Paragraph({ text: "\n" }),

                    // Итоговая информация
                    new Paragraph({
                        text: "Итоговая информация",
                        style: "heading2"
                    }),
                    new Paragraph({
                        text: `Всего в план проверок включено: ${plan.length} финансово-хозяйственных процессов.`,
                        style: "normal"
                    }),
                    new Paragraph({
                        text: `Процент использования ресурсов: ${((totalT / Fp) * 100).toFixed(1)}%`,
                        style: "normal"
                    }),
                    new Paragraph({
                        text: remaining > 0
                            ? `Оставшиеся ресурсы: ${remaining} чел-дн могут быть использованы для внеплановых проверок.`
                            : "Все ресурсы полностью использованы для плановых проверок.",
                        style: "normal"
                    })
                ]
            }]
        });

        // Генерация и сохранение файла
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `План_проверок_${new Date().toISOString().slice(0, 10)}.docx`);

        handleCloseExportModal();
    };

    if (!results) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h6">Загрузка результатов...</Typography>
            </Container>
        );
    }

    const { orgParams, Fp, plan, remaining, totalT } = results;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Результаты оценки</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            onClick={handleOpenExportModal}
                            sx={{ mr: 1 }}
                        >
                            Экспорт
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/')}
                        >
                            Назад к вводу данных
                        </Button>
                    </Box>
                </Box>

                {/* Детализация расчетов по каждому ФХП */}
                <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Детализация расчетов по каждому ФХП</Typography>

                {plan.map((item, index) => (
                    <Accordion
                        key={index}
                        expanded={expanded === `panel${index}`}
                        onChange={handleChange(`panel${index}`)}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel${index}a-content`}
                            id={`panel${index}a-header`}
                        >
                            <Box display="flex" justifyContent="space-between" width="100%">
                                <Typography variant="h6">{fhpTitles[item.index] || `ФХП ${item.index + 1}`}</Typography>
                                <Box>
                                    <Typography component="span" sx={{ mr: 2 }}>
                                        <strong>Уровень риска (Z):</strong> {item.z.toFixed(2)}
                                    </Typography>
                                    <Typography component="span">
                                        <strong>Трудоемкость (T):</strong> {item.t} чел-дн
                                    </Typography>
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Оценка риска</Typography>
                                            <Typography><strong>XS</strong> = {item.xs.toFixed(2)}</Typography>
                                            <Typography><strong>YS</strong> = {item.ys.toFixed(2)}</Typography>
                                            <Typography><strong>Z</strong> = {item.z.toFixed(2)}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Оценка сложности проверки</Typography>
                                            <Typography><strong>kS</strong> = {item.kS}</Typography>
                                            <Typography><strong>k</strong> = {item.k}</Typography>

                                            {item.customKValues && (
                                                <Box mt={1}>
                                                    <Typography variant="body2" fontWeight="bold">Пользовательские значения:</Typography>
                                                    <Typography variant="body2">Диапазон 0-7: {item.customKValues.range1}</Typography>
                                                    <Typography variant="body2">Диапазон 8-14: {item.customKValues.range2}</Typography>
                                                    <Typography variant="body2">Диапазон 15-21: {item.customKValues.range3}</Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Трудоемкость проверки</Typography>
                                            <Typography>
                                                <strong>T</strong> = {orgParams.N} × {orgParams.t} × {item.k} = {item.t} чел-дн
                                            </Typography>
                                            <Box mt={1}>
                                                <Typography variant="body2">
                                                    <strong>Количество сотрудников (N):</strong> {orgParams.N}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Длительность проверки (t):</strong> {orgParams.t} дней
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {/* План проверок */}
                <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>План проверок</Typography>

                <Box mb={2}>
                    <Typography><strong>Доступные ресурсы (Fp):</strong> {Fp} чел-дн</Typography>
                    <Typography><strong>Количество сотрудников (N):</strong> {orgParams.N}</Typography>
                    <Typography><strong>Длительность проверки (t):</strong> {orgParams.t} дней</Typography>
                    <Typography><strong>Использовано ресурсов:</strong> {totalT} чел-дн ({((totalT / Fp) * 100).toFixed(1)}%)</Typography>
                    <Typography><strong>Остаток ресурсов:</strong> {remaining} чел-дн</Typography>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Позиция</TableCell>
                                <TableCell>ФХП</TableCell>
                                <TableCell align="right">Z</TableCell>
                                <TableCell align="right">N</TableCell>
                                <TableCell align="right">t</TableCell>
                                <TableCell align="right">k</TableCell>
                                <TableCell align="right">Трудоемкость (T)</TableCell>
                                <TableCell align="right">Остаток ресурсов</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {plan.map((item, pos) => (
                                <TableRow key={pos}>
                                    <TableCell>{pos + 1}</TableCell>
                                    <TableCell>{fhpTitles[item.index] || `ФХП ${item.index + 1}`}</TableCell>
                                    <TableCell align="right">{item.z.toFixed(2)}</TableCell>
                                    <TableCell align="right">{orgParams.N}</TableCell>
                                    <TableCell align="right">{orgParams.t}</TableCell>
                                    <TableCell align="right">{item.k}</TableCell>
                                    <TableCell align="right">{item.t}</TableCell>
                                    <TableCell align="right">{Math.floor(item.remaining - item.t)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Итоговая информация */}
                <Box mt={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Итоговая информация</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography gutterBottom>
                                Всего в план проверок включено <strong>{plan.length}</strong> финансово-хозяйственных процессов.
                            </Typography>
                            <Typography gutterBottom>
                                Процент использования ресурсов: <strong>{((totalT / Fp) * 100).toFixed(1)}%</strong>
                            </Typography>
                            {remaining > 0 && (
                                <Typography>
                                    Оставшиеся ресурсы: <strong>{remaining} чел-дн</strong> могут быть использованы для внеплановых проверок.
                                </Typography>
                            )}
                            {remaining === 0 && (
                                <Typography>
                                    Все ресурсы полностью использованы для плановых проверок.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Модальное окно экспорта */}
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={exportModalOpen}
                    onClose={handleCloseExportModal}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Fade in={exportModalOpen}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2
                        }}>
                            <Typography id="transition-modal-title" variant="h6" component="h2" gutterBottom>
                                Выберите формат экспорта
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={exportToExcel}
                                    fullWidth
                                >
                                    Экспорт в Excel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={exportToWord}
                                    fullWidth
                                >
                                    Экспорт в Word
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseExportModal}
                                    fullWidth
                                >
                                    Отмена
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>
            </Paper>
        </Container>
    );
};

export default ResultsPage;