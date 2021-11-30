const multer = require('multer');
const shortid = require('shortid');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuarios');

exports.subirImagen = async (req, res, next) => {
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
            res.redirect('/administracion');
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
            cb(null, __dirname + '../../public/uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = async (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear Cuenta en devJobs',
        tagline: 'Empieza a publicar tus vacantes gratis, solo debes crear una cuenta',
    });
}

exports.validarUsuario = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg));

        res.render('crear-cuenta', {
            nombrePagina: 'Crear tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        });

        return;
    }

    next();
}

exports.crearUsuario = async (req, res, next) => {
    const usuario = new Usuario(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión en devJobs'
    });
}

exports.formEditarPerfil = async (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuario.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if (req.body.password) {
        usuario.password = req.body.password;
    }

    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Perfil actualizado correctamente');

    res.redirect('/administracion');
}

exports.validarPerfil = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg));

        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        });

        return;
    }

    next();
}