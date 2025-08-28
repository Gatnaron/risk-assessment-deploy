import React from 'react';

const RiskCalculator = ({ fhp, onChange, title }) => {
    const criteriaGroups = [
        {
            name: 'Вероятность нарушений',
            prefix: 'X',
            count: 8,
            description: 'X1–X8',
            options: [
                { value: 0, label: 'малозначимый' },
                { value: 1, label: 'низкий' },
                { value: 2, label: 'средний' },
                { value: 3, label: 'высокий' }
            ]
        },
        {
            name: 'Последствия нарушений',
            prefix: 'Y',
            count: 8,
            description: 'Y1–Y8',
            options: [
                { value: 0, label: 'малозначимый' },
                { value: 1, label: 'низкий' },
                { value: 2, label: 'средний' },
                { value: 3, label: 'высокий' }
            ]
        },
        {
            name: 'Факторы сложности',
            prefix: 'k',
            count: 7,
            description: 'k1–k7',
            options: [
                { value: 0, label: 'стандартный' },
                { value: 2, label: 'повышенный' },
                { value: 3, label: 'высокий' }
            ]
        }
    ];

    return (
        <div className="fhp-form">
            <h3>{title}</h3>

            {criteriaGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="criteria-group">
                    <h4>{group.name} ({group.description})</h4>
                    <div className="criteria-row">
                        {Array.from({ length: group.count }).map((_, i) => {
                            const key = `${group.prefix}${i + 1}`;
                            return (
                                <label key={key}>
                                    {key}:
                                    <select
                                        value={fhp[key]}
                                        onChange={e => onChange(key, parseInt(e.target.value))}
                                    >
                                        {group.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RiskCalculator;