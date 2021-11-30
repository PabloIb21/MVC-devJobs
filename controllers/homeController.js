const Vacantes = require('../models/Vacantes');

exports.mostrarTrabajos = async(req, res, next) => {

    const vacantes = await Vacantes.find();

    if(!vacantes) return next();

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y publica trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes
    });
}