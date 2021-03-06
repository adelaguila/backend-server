var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

app.use(fileUpload());

var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

app.put('/:tipo/:id', function (req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no válida',
            errors: { messaje: 'Los tipos válidos son ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No existen archivos para subir',
            errors: { messaje: 'Debe seleccionar un archovo' }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo se aceptan esta extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensipon no válida',
            errors: { messaje: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo del tempora a un PATH 
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res)


    })

})


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'usuario no existe',
                    errors: {messaje: 'Usuario no existe'}
                })
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });
            })
        })
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no existe',
                    errors: {messaje: 'Medico no existe'}
                })
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medicoActualizado
                });
            })
        })
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no existe',
                    errors: {messaje: 'Hospital no existe'}
                })
            }

            var pathViejo = './uploads/medicos/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                });
            })
        })
    }
}

module.exports = app;