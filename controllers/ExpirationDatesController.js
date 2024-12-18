"use strict";
const {
    getAll
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
