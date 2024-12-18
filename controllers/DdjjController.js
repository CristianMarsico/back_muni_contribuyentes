"use strict";
const {
    getByYearTradeMonth, addDdjj
} = require('../models/DdjjModel.js');


exports.getByYearTradeMonth = async (req, res) => {   
    const { id_taxpayer, id_trade,  year,  month } = req.params;      
    try {
        let response = await getByYearTradeMonth(id_taxpayer, id_trade, year, month);
        if (response && response.length > 0) return res.status(200).json({ response });
        if (!month) return res.status(404).json({ error: "Ud. aún no ha cargado ninguna ddjj"});
        else return res.status(404).json({ error: "No hay DDJJ correspondientes al mes " + month });
    } catch (error) {
         return res.status(500).json({ error: "Error de servidor" });
    }
};


exports.addDdjj = async (req, res) => {
    const { id_contribuyente, id_comercio, monto, descripcion } = req.body;

    console.log(id_contribuyente, id_comercio, monto, descripcion)
    try {       
        const nuevaDdjj = await addDdjj(id_contribuyente, id_comercio, monto, descripcion);

        if (!nuevaDdjj) return res.status(404).json({ error: 'No se pudo agregar la DDJJ.' });

        return res.status(200).json({ message: 'DDJJ registrada exitosamente.', data: nuevaDdjj });
    } catch (error) {       
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};