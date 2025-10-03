import React from 'react';

const ResourceCalculator = ({ orgParams, onChange }) => {
    return (
        <section className="org-params">
            <h2>Ресурсы</h2>
            <div className="form-row">
                <label>
                    Количество сотрудников (St):
                    <input
                        type="number"
                        value={orgParams.St}
                        onChange={e => onChange('St', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
                <label>
                    Рабочих дней (Dr):
                    <input
                        type="number"
                        value={orgParams.Dr}
                        onChange={e => onChange('Dr', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Отпуска и болезни (%):
                    <input
                        type="number"
                        value={orgParams.Do}
                        onChange={e => onChange('Do', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
                <label>
                    Резерв на внеплановые проверки (%):
                    <input
                        type="number"
                        value={orgParams.Rvp}
                        onChange={e => onChange('Rvp', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Резерв на методику (%):
                    <input
                        type="number"
                        value={orgParams.Rom}
                        onChange={e => onChange('Rom', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
                <label>
                    Непроизводительные потери (%):
                    <input
                        type="number"
                        value={orgParams.Pt}
                        onChange={e => onChange('Pt', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Количество сотрудников для проверки (N):
                    <input
                        type="number"
                        value={orgParams.N}
                        onChange={e => onChange('N', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
                <label>
                    Длительность проверки (t):
                    <input
                        type="number"
                        value={orgParams.t}
                        onChange={e => onChange('t', parseInt(e.target.value) || 0)}
                        required
                    />
                </label>
            </div>
        </section>
    );
};

export default ResourceCalculator;