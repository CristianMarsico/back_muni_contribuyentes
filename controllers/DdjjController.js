"use strict";
const {
    getByYeasTradeBimester
} = require('../models/DdjjModel.js');


exports.getByYearTradeBimester = async (req, res) => {   
    const { id_taxpayer, id_trade,  year,  bimester } = req.params;     
    try {
        let response = await getByYeasTradeBimester(id_taxpayer, id_trade, year, bimester);
        if (response && response.length > 0)
            return res.status(200).json({ response });
        if(!bimester){
            return res.status(404).json({ error: "No hay DDJJ"});
        }else{
            return res.status(404).json({ error: "No hay DDJJ correspondientes a " + bimester });
        }
    } catch (error) {
         return res.status(500).json({ error: "Error de servidor" });
    }
};