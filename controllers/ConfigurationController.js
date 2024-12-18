"use strict";
const {
    getAll, updateConfiguration
} = require('../models/ConfigurarionModel.js');

exports.getAll = async (req, res) => {
    try {
        let response = await getAll();
        if (response && response.length > 0) return res.status(200).json({ response });
        return res.status(404).json({ error: "No hay configuraciones cargadas" });
    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
};

exports.updateConfiguration = async (req, res) => {
    const { id } = req.params;
    const { fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, tasa_default } = req.body;
   
    // Verificar que los campos sean válidos
    if (!fecha_limite_ddjj || !monto_ddjj_defecto || !tasa_actual || !tasa_default) {
        return res.status(404).json({ error: 'Todos los campos son obligatorios' });
    }

    if (isNaN(fecha_limite_ddjj) || isNaN(monto_ddjj_defecto) || isNaN(tasa_actual) || isNaN(tasa_default)) {
        return res.status(404).json({ error: 'Los valores deben ser números válidos' });
    }

    try {
        // Llamar al modelo para actualizar la configuración
        const result = await updateConfiguration(
            id, fecha_limite_ddjj, monto_ddjj_defecto, tasa_actual, tasa_default
        );

        // Si la actualización fue exitosa
        if (result.success) {
            return res.status(200).json({ message: 'Configuración actualizada correctamente' });
        } else {
            return res.status(500).json({ error: 'Error al actualizar la configuración' });
        }
    } catch (error) {     
        return res.status(500).json({ error: 'Hubo un error al actualizar la configuración' });
    }
};


