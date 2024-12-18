"use strict";
const {
    getAll, updateExipirationDate
} = require('../models/ExpirationDatesModel.js');

exports.getAll = async (req, res) => {
    try {
        let response = await getAll();
        if (response && response.length > 0)
            return res.status(200).json({ response });

        return res.status(404).json({ error: "No hay fechas cargadas" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

exports.updateExipirationDate = async (req, res, io) => {
    const { id, date } = req.params;   
    if (!id) return res.status(400).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await updateExipirationDate(id, date);     
        if (!updatedActive) return res.status(404).json({ error: "La fecha no se pudo cambiar" });
        io.emit('fecha-nueva', { updatedActive });
        return res.status(200).json({ message: "La fecha ha sifo cambiada con éxito", data: updatedActive });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

