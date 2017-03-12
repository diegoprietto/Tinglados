var express = require('express');
var app = express();

//Archivos públicos
app.use(express.static('public'));

//Usar el paquete Pug para Templates
app.set('view engine', 'pug');

//Renderizar usando Pug
app.get('/template', function(req, res){
    res.render('view');
});

//Cualquier url que no existente
app.all('/*', function (req, res) {
   res.send('Has ingresado una url inexistente <img src="prohibido.png">');
   console.log("Acceso a url inexistente");
})

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})