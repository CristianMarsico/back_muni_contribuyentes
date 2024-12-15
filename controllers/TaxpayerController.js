"use strict";
const {
    getAll, editActive, getWithTrade
} = require('../models/TaxpayerModel.js');

exports.getAll = async (req, res) => {
    try {
        let response = await getAll();
        if (response && response.length > 0)
            return res.status(200).json({ response });
     
        return res.status(404).json({ error: "No hay contribuyetes en la base de datos" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

exports.getWithTrade = async (req, res) => {
    const { id } = req.params;
    try {
        let response = await getWithTrade(id);
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "Ud no tiene comercios registrados" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

exports.editActive = async (req, res, io) => {
    const { id } = req.params;   
    if (!id) return res.status(400).json({ error: "Faltan datos necesarios para editar" });
    try {
        const updatedActive = await editActive(id);
        if (!updatedActive) return res.status(404).json({ error: "El estado no se pudo cambiar" });
       
        // Emitir el estado actualizado con los datos necesarios
        io.emit("estado-actualizado", {
            id_contribuyente: updatedActive.id_contribuyente,
            estado: updatedActive.estado
        });

        return res.status(200).json({
            message: "El contribuyente ha sido dado de alta",
            data: updatedActive
        });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};