import React, { useState } from 'react';
import FHPItem from './FHPItem';
import FHPModal from './FHPModal';
import { Button } from '@mui/material';

const FHPList = ({ fhps, onAddFHP, onEditFHP, onDeleteFHP, fhpTitles, settings }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentFHPIndex, setCurrentFHPIndex] = useState(null);

    const handleEdit = (index) => {
        setCurrentFHPIndex(index);
        setModalOpen(true);
    };

    const handleDelete = (index) => {
        onDeleteFHP(index);
    };

    const handleDeleteFromModal = () => {
        if (currentFHPIndex !== null) {
            onDeleteFHP(currentFHPIndex);
        }
    };

    const handleSave = (title, fhpData) => {
        onEditFHP(currentFHPIndex, title, fhpData);
    };

    return (
        <div>
            <div id="fhps">
                {fhps.map((fhp, index) => (
                    <FHPItem
                        key={index}
                        fhp={fhp}
                        title={fhpTitles[index] || `ФХП ${index + 1}`}
                        onEdit={handleEdit}
                        onDelete={() => handleDelete(index)}
                        index={index}
                    />
                ))}
            </div>

            <Button
                variant="outlined"
                onClick={onAddFHP}
                sx={{ mt: 2, mb: 3 }}
            >
                Добавить ФХП
            </Button>

            {currentFHPIndex !== null && (
                <FHPModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    fhp={fhps[currentFHPIndex]}
                    onSave={handleSave}
                    onDelete={handleDeleteFromModal}
                    title={fhpTitles[currentFHPIndex] || `ФХП ${currentFHPIndex + 1}`}
                    settings={settings}
                />
            )}
        </div>
    );
};

export default FHPList;