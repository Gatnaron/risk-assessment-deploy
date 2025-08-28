// Расчет среднего расстояния Хэмминга для вероятности (XS)
export const calculateXS = (fhps) => {
    return fhps.map(fhp => {
        const sum = ['X1','X2','X3','X4','X5','X6','X7','X8']
            .reduce((acc, key) => acc + fhp[key], 0);
        return sum / 8;
    });
};

// Расчет среднего расстояния Хэмминга для последствий (YS)
export const calculateYS = (fhps) => {
    return fhps.map(fhp => {
        const sum = ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8']
            .reduce((acc, key) => acc + fhp[key], 0);
        return sum / 8;
    });
};

// Интегральный показатель риска (Z)
export const calculateZ = (xs, ys) => {
    return xs.map((x, i) => x + ys[i]);
};

// Интегральный показатель сложности (kS)
export const calculateKS = (fhps) => {
    return fhps.map(fhp => {
        return ['k1','k2','k3','k4','k5','k6','k7']
            .reduce((acc, key) => acc + fhp[key], 0);
    });
};

// Коэффициент сложности (k) с учетом пользовательских значений
export const calculateKWithCustomValues = (kS, customKValues) => {
    if (customKValues) {
        if (kS <= 7) return customKValues.range1;
        if (kS <= 14) return customKValues.range2;
        return customKValues.range3;
    }

    // Стандартные значения, если пользовательские не заданы
    if (kS <= 7) return 1;
    if (kS <= 14) return 1.25;
    return 1.5;
};

// Трудоемкость проверки (T)
export const calculateT = (n, t, k) => {
    return n * t * k;
};

// Доступные ресурсы (Fp)
export const calculateResources = (orgParams) => {
    const { St, Dr, Do, Rvp, Rom, Pt } = orgParams;
    const Fo = St * Dr;
    const Ff = Fo * (1 - Do / 100);
    const Fp = Ff * (1 - (Rvp + Rom + Pt) / 100);
    return Math.floor(Fp);
};