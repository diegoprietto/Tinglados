var express = require('express');
var app = express();

//Definición de puerto
app.set('port', (process.env.PORT || 5000));

//Archivos públicos
app.use(express.static('public'));

//Usar el paquete Pug para Templates
app.set('view engine', 'pug');

//Renderizar usando Pug
app.get('/template', function(req, res){
    res.render('view');
});

//Ajax: Telefono
app.get('/getTel', function(req, res){
	console.log("Acceso a función Ajax getTel");

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ t1: '4321', t2: '-0000' }));
});

//Cualquier url que no existente
app.all('/*', function (req, res) {
   res.send('Has ingresado una url inexistente <img src="prohibido.png">');
   console.log("Acceso a url inexistente");
})

var server = app.listen(app.get('port'), function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})