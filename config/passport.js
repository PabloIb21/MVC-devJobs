const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { model } = require('mongoose');
const Usuarios = model('Usuarios');

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    const usuario = await Usuarios.findOne({ email });
    if (!usuario) {
        return done(null, false, { message: 'El usuario no existe' });
    }
    if (!usuario.compararPassword(password)) {
        return done(null, false, { message: 'El password es incorrecto' });
    }
    return done(null, usuario);
}));

passport.serializeUser((usuario, done) => {
    done(null, usuario._id);
});

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuarios.findById(id);
    done(null, usuario);
});

module.exports = passport;
