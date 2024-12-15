"use strict";
const {
    getByYearTradeMonth
} = require('../models/DdjjModel.js');


exports.getByYearTradeMonth = async (req, res) => {   
    const { id_taxpayer, id_trade,  year,  month } = req.params;   
    console.log(id_taxpayer, id_trade, year, month)  
    try {
        let response = await getByYearTradeMonth(id_taxpayer, id_trade, year, month);
        if (response && response.length > 0) return res.status(200).json({ response });
        if (!month) return res.status(404).json({ error: "No hay DDJJ"});
        else return res.status(404).json({ error: "No hay DDJJ correspondientes al mes " + month });
    } catch (error) {
         return res.status(500).json({ error: "Error de servidor" });
    }
};