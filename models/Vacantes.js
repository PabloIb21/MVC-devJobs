const { Schema, model } = require('mongoose');
const slug = require('slug');
const shortid = require('shortid');

const vacantesSchema = Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        trim: true,
        default: 0
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
});
vacantesSchema.pre('save', function(next) {
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
    next();
});
vacantesSchema.index({ titulo: 'text' });

module.exports = model('Vacante', vacantesSchema);