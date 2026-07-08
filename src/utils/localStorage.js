export const safeLocalStorage = {
    getItem: (key) => {
        try {
            // Проверяем, доступен ли localStorage в текущем окружении
            if (typeof window === 'undefined' || !window.localStorage) {
                console.warn('localStorage недоступен в этом окружении');
                return null;
            }

            return localStorage.getItem(key);
        } catch (e) {
            console.error(`Ошибка при чтении из localStorage (key: ${key}):`, e);
            return null;
        }
    },

    setItem: (key, value) => {
        try {
            // Проверяем, доступен ли localStorage в текущем окружении
            if (typeof window === 'undefined' || !window.localStorage) {
                console.warn('localStorage недоступен в этом окружении');
                return;
            }

            localStorage.setItem(key, value);
        } catch (e) {
            console.error(`Ошибка при записи в localStorage (key: ${key}):`, e);

            // Если ошибка связана с превышением квоты, попробуем очистить и сохранить снова
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.warn('Квота localStorage превышена, попытка очистки и повторной записи');
                try {
                    // Очищаем localStorage и сохраняем только критически важные данные
                    const criticalData = {
                        orgParams: localStorage.getItem('orgParams'),
                        fhpTitles: localStorage.getItem('fhpTitles')
                    };

                    localStorage.clear();

                    // Сохраняем критические данные
                    if (criticalData.orgParams) localStorage.setItem('orgParams', criticalData.orgParams);
                    if (criticalData.fhpTitles) localStorage.setItem('fhpTitles', criticalData.fhpTitles);

                    // Пытаемся сохранить текущее значение
                    localStorage.setItem(key, value);
                } catch (clearError) {
                    console.error('Не удалось очистить localStorage:', clearError);
                }
            }
        }
    },

    removeItem: (key) => {
        try {
            // Проверяем, доступен ли localStorage в текущем окружении
            if (typeof window === 'undefined' || !window.localStorage) {
                console.warn('localStorage недоступен в этом окружении');
                return;
            }

            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Ошибка при удалении из localStorage (key: ${key}):`, e);
        }
    },

    clear: () => {
        try {
            // Проверяем, доступен ли localStorage в текущем окружении
            if (typeof window === 'undefined' || !window.localStorage) {
                console.warn('localStorage недоступен в этом окружении');
                return;
            }

            localStorage.clear();
        } catch (e) {
            console.error('Ошибка при очистке localStorage:', e);
        }
    }
};

export const isLocalStorageAvailable = () => {
    try {
        // Проверяем, доступен ли localStorage в текущем окружении
        if (typeof window === 'undefined' || !window.localStorage) {
            return false;
        }

        // Проверяем, можем ли мы записать и прочитать данные
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        const result = localStorage.getItem(testKey) === testKey;
        localStorage.removeItem(testKey);

        return result;
    } catch (e) {
        return false;
    }
};