const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Rutas de vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        [
            check('titulo', 'El titulo es obligatorio').not().isEmpty(),
            check('empresa', 'La empresa es obligatoria').not().isEmpty(),
            check('ubicacion', 'La ubicacion es obligatoria').not().isEmpty(),
            check('contrato', 'Selecciona el tipo de contrato').not().isEmpty(),
            check('skills', 'Agrega al menos una habilidad').not().isEmpty()
        ],
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );
    router.get('/vacantes/:url', vacantesController.mostrarVacante);
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );
    router.delete('/vacantes/eliminar/:id',
        authController.verificarUsuario,
        vacantesController.eliminarVacante
    );
    router.post('/buscador', vacantesController.buscarVacantes);
    
    // Rutas de autenticación
    router.get('/crear-cuenta' , usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        [
            check('nombre', 'El nombre es obligatorio').not().isEmpty(),
            check('email', 'El email no es válido').isEmail(),
            check('password', 'El password es obligatorio').not().isEmpty(),
            check('confirmar', 'La confirmación de password es obligatoria').not().isEmpty(),
            // check('confirmar', 'El password es diferente').equals(req.body.password),
        ],
        usuariosController.validarUsuario,
        usuariosController.crearUsuario
    );
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    router.get('/cerrar-sesion', 
        authController.verificarUsuario,
        authController.cerrarSesion
    );
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);

    // Rutas de administración
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel
    );
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        [
            check('nombre', 'El nombre es obligatorio').not().isEmpty(),
            check('email', 'El email no es válido').isEmail()
        ],
        authController.verificarUsuario,
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );
    router.post('/vacantes/:url',
        vacantesController.subirCV,
        vacantesController.contactar
    );
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    );

    return router;
}
