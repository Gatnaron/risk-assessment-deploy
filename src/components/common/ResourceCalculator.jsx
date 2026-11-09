import React from 'react';

const ResourceCalculator = ({ orgParams, onChange, settings }) => {
    return (
        <section className="org-params">
            <h2>Параметры организации</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {settings.orgParams.map(param => (
                    <div
                        key={param.key}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}
                    >
                        <label
                            style={{
                                fontWeight: '500',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal'
                            }}
                        >
                            {param.name}:
                        </label>
                        <input
                            type="number"
                            value={orgParams[param.key] !== null ? orgParams[param.key] : ''}
                            onChange={e => onChange(param.key, parseInt(e.target.value) || 0)}
                            placeholder={param.description}
                            required
                            style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ResourceCalculator;