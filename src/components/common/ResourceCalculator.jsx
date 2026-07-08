import React from 'react';

const ResourceCalculator = ({ orgParams, onChange, settings }) => {
    return (
        <section className="org-params">
            <h2>Параметры организации</h2>
            <div className="form-row">
                {settings.orgParams.slice(0, 4).map(param => (
                    <div key={param.key} style={{ flex: 1, minWidth: '200px' }}>
                        <label>
                            {param.name}:
                            <input
                                type="number"
                                value={orgParams[param.key] !== null ? orgParams[param.key] : ''}
                                onChange={e => onChange(param.key, parseInt(e.target.value) || 0)}
                                placeholder={param.description}
                                required
                            />
                        </label>
                    </div>
                ))}
            </div>
            <div className="form-row">
                {settings.orgParams.slice(4, 6).map(param => (
                    <div key={param.key} style={{ flex: 1, minWidth: '200px' }}>
                        <label>
                            {param.name}:
                            <input
                                type="number"
                                value={orgParams[param.key] !== null ? orgParams[param.key] : ''}
                                onChange={e => onChange(param.key, parseInt(e.target.value) || 0)}
                                placeholder={param.description}
                                required
                            />
                        </label>
                    </div>
                ))}
            </div>
            <div className="form-row">
                {settings.orgParams.slice(6).map(param => (
                    <div key={param.key} style={{ flex: 1, minWidth: '200px' }}>
                        <label>
                            {param.name}:
                            <input
                                type="number"
                                value={orgParams[param.key] !== null ? orgParams[param.key] : ''}
                                onChange={e => onChange(param.key, parseInt(e.target.value) || 0)}
                                placeholder={param.description}
                                required
                            />
                        </label>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ResourceCalculator;