const { validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const Vacantes = require('../models/Vacantes');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena tu formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.agregarVacante = async (req, res) => {
    const vacante = new Vacantes(req.body);

    vacante.autor = req.user._id;

    vacante.skills = req.body.skills.split(',');

    const nuevaVacante = await vacante.save();

    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacantes.findOne({ url: req.params.url }).populate('autor');

    if (!vacante) return next();

    res.render('vacante', {
        nombrePagina: vacante.titulo,
        vacante,
        barra: true
    });
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacantes.findOne({ url: req.params.url });

    if (!vacante) return next();

    res.render('editar-vacante', {
        nombrePagina: `Editar - ${vacante.titulo}`,
        vacante,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacantes.findOneAndUpdate({ url: req.params.url }, 
    vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);
}

exports.validarVacante = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena tu formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        });

        return;
    }

    next();
}

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacantes.findById(id);

    if(verificarAutor(vacante, req.user)) {
        vacante.remove();
        res.status(200).send('Vacante eliminada correctamente');
    } else {
        res.status(401).send('No tienes permisos para eliminar esta vacante');
    }

}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }

    return true;
}

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
}

const configuracionMulter = {
    storage: fileStorage = multer.diskStorage({
        limits: { fileSize: 100000 },
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

exports.contactar = async (req, res, next) => {
    const vacante = await Vacantes.findOne({ url: req.params.url });

    if (!vacante) return next();

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    req.flash('correcto', 'Se ha enviado tu CV correctamente');

    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const { id } = req.params;

    const vacante = await Vacantes.findById(id);

    if (!vacante) return next();

    if(vacante.autor != req.user._id.toString()) {
        return next();
    }

    res.render('candidatos', {
        nombrePagina: `Candidatos - ${vacante.titulo}`,
        candidatos: vacante.candidatos,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacantes.find({
        $text: {
            $search: req.body.q
        }
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' }
    });

    res.render('home', {
        nombrePagina: `Resultados de la búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    });
}