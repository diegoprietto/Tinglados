"use strict";

$(document).ready(function () {
	actualizarAltoCarrusel();
	$(".botonLlamar").on( "click", llamarTel );
	//Solicitar fotos del server para el carrousel
	CargaInicialFotos();

	//Inicializar tooltips
	$('[data-toggle="tooltip"]').tooltip();
});

$(window).resize(function () {
	actualizarAltoCarrusel();
});

function actualizarAltoCarrusel(){
	if ($(window).width() <= 975){
		var anchoContenedor = $("#carrusel").width();
		var altoContenedor = (17/26)*anchoContenedor;

		$("#carrusel").css("height",altoContenedor + "px");
		$(".carousel-inner img").css("height", altoContenedor + "px");
		$(".carousel-inner img").css("width", anchoContenedor + "px");

	}else{

		var altoTitulo = $(".tituloFormulario").height() + parseInt($(".tituloFormulario").css("padding-top").replace("px","")) + parseInt($(".tituloFormulario").css("padding-bottom").replace("px",""));
		var altoCuerpo = $(".cuerpoFormulario").height() + parseInt($(".cuerpoFormulario").css("padding-top").replace("px","")) + parseInt($(".cuerpoFormulario").css("padding-bottom").replace("px",""));

		var altoTotal = altoTitulo + altoCuerpo;
		var anchoTotal = (26/17)*altoTotal;
		$("#carrusel").css("height",altoTotal + "px");
		$(".carousel-inner img").css("height", altoTotal + "px");
		$(".carousel-inner img").css("width", anchoTotal + "px");
	}
}

function llamarTel(){
	$.ajax({
		dataType: "json",
		url: "getTel",
		data: "",
		success: llamarTelCallback
	});
}

function llamarTelCallback(data, textStatus, jqXHR){
	if (textStatus === 'success' && data && data.t1 && data.t2){
		$(".botonLlamar").html("<a href='tel:" + data.t1 + data.t2 + "'>" + data.t1 + data.t2 + "</a>");
		$(".botonLlamar").off( "click" );
	}
}

function Contacto(){
	$("#ContactButton").attr("disabled", "disabled");
	var datos = ObtenerDatosContacto();

	if (ValidarDatos(datos)){
		$("#ContactButtonNormal").hide();
		$("#ContactButtonSpin").show();
		$.ajax({
			contentType: "application/json",
			method: "POST",
			url: "Contacto",
			data: JSON.stringify({ content: datos }),
			success: function(response) { ContactoOk(response); },
			error: function(response) { ContactoError(response); }
		});
	}
}

function ObtenerDatosContacto(){
	var datos = {
		nombre: $("#first_name").val(),
		apellido: $("#last_name").val(),
		mail: $("#email").val(),
		telCodigo: $("#area_code").val(),
		telNro: $("#phone_number").val(),
		mensaje: $("#message").val()
	}

	return datos;
}

function ValidarDatos(datos){
	var msjError = new Array();

	datos.nombre = datos.nombre.trim();
	datos.apellido = datos.apellido.trim();
	datos.mail = datos.mail.trim();
	datos.telCodigo = datos.telCodigo.trim();
	datos.telNro = datos.telNro.trim();
	datos.mensaje = datos.mensaje.trim();

	//Verificar campos
	if (datos.nombre.length === 0){
		msjError.push("Ingrese su nombre");
		$("#first_name").css("background-color", "#efdce1");
	}
	if (datos.apellido.length === 0){
		msjError.push("Ingrese su apellido");
		$("#last_name").css("background-color", "#efdce1");
	}
	if (datos.mail.length === 0){
		msjError.push("Ingrese su mail, esto permitirá que lo podamos contactar por este medio");
		$("#email").css("background-color", "#efdce1");
	}else if (!validarEmail){
		msjError.push("Ingrese un mail válido");
		$("#email").css("background-color", "#efdce1");
	}
	if (datos.telCodigo.length === 0){
		msjError.push("Ingrese el código de área");
		$("#area_code").css("background-color", "#efdce1");
	}else if(!permitirSoloCaracteres(datos.telCodigo, "0123456789 -")){
		msjError.push("Ingrese un código de área válido");
		$("#area_code").css("background-color", "#efdce1");
	}
	if (datos.telNro.length === 0){
		msjError.push("Ingrese su número de telefono, esto permitirá que lo podamos contactar por este medio");
		$("#phone_number").css("background-color", "#efdce1");
	} if(!permitirSoloCaracteres(datos.telNro, "0123456789 -")){
		msjError.push("Ingrese un teléfono válido");
		$("#phone_number").css("background-color", "#efdce1");
	}
	if (datos.mensaje.length === 0){
		msjError.push("Ingrese algún mensaje");
		$("#message").css("background-color", "#efdce1");
	}


	//Verificar resultados
	if (msjError.length > 0){
		//Mostrar errores al usuario
		$("#ContactButton").removeAttr("disabled");

		$("#AlertErrorContacto").show();
		$("#AlertExitoContacto").hide();

		var texto = null;
		for(var i = 0; i < msjError.length; i++){
			if (i===0)
				texto = "<i class='fa fa-exclamation-triangle'></i> " + msjError[i];
			else
				texto += "<br><i class='fa fa-exclamation-triangle'></i> " + msjError[i];
		}

		$("#AlertErrorContacto").html(texto);

		return false;
	}else{
		//Todo Ok

		//Quitar color de advertencia en los controles
		QuitarColorAdvertenciaPresupuesto();

		$("#AlertErrorContacto").hide();
		$("#AlertExitoContacto").hide();

		return true;
	}
}

function ContactoOk(){
	$("#ContactButton").hide();

	//Quitar color de advertencia en los controles
	QuitarColorAdvertenciaPresupuesto();

	$("#AlertErrorContacto").hide();
	$("#AlertExitoContacto").show();
	$("#AlertExitoContacto").html("<i class='fa fa-check'></i> Gracias por su contacto, en breve se comunicarán con usted.");
}

function ContactoError(){
	$("#ContactButton").removeAttr("disabled");
	$("#ContactButtonNormal").show();
	$("#ContactButtonSpin").hide();

	//Quitar color de advertencia en los controles
	QuitarColorAdvertenciaPresupuesto();

	$("#AlertErrorContacto").show();
	$("#AlertExitoContacto").hide();
	$("#AlertErrorContacto").html("<i class='fa fa-exclamation-triangle'></i> Error en el servidor, por favor vuelva a reintentar.");
}

function QuitarColorAdvertenciaPresupuesto(){
	$("#first_name").css("background-color", "");
	$("#last_name").css("background-color", "");
	$("#email").css("background-color", "");
	$("#area_code").css("background-color", "");
	$("#phone_number").css("background-color", "");
	$("#message").css("background-color", "");
}

//Solicitar fotos mas adecuadas para el tamaño de pantalla actual
function CargaInicialFotos(){
	$.ajax({
		contentType: "application/json",
		method: "POST",
		data: JSON.stringify({ content: $("#carrusel").width() }),
		url: "ObtenerFotos",
		success: function(response) { ObtenerFotosOk(response); },
		error: function(response) { ObtenerFotosError(response); }
	});
}

function ObtenerFotosOk(response){

	//Buscar propiedad que ontenga la cadena Binario
	var nombrePropiedad = null;
	if (response && response.Datos && response.Datos[0]){
		for (var propiedad in response.Datos[0]){
	    	if (propiedad.includes("Binario")){
				nombrePropiedad = propiedad;
	    	}
		}
	}

	if (nombrePropiedad){

		var coleccionContenedores = $(".carousel-inner img");
		var coleccionSpinners = $(".carousel-inner .fa-spinner");


		//Recorrer fotos
		$.each(response.Datos, function(index, value){

			try
			{
				//Colocar imagen
				$(coleccionContenedores[index]).attr("src", value[nombrePropiedad]);
				//Mostrar la imagen
				$(coleccionContenedores[index]).css("display", "inline-block");
				//Ocultar spinner
				$(coleccionSpinners[index]).css("display", "none");
			}catch(ex){}

		});
	}
}

function ObtenerFotosError(response){
	//Se dispara si ocurre un error en la conexión con el servidor
}

function validarEmail(valor) {
  if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(valor)){
   return true;
  } else {
   return false;
  }
}

function permitirSoloCaracteres(texto, caracteres){
	var result = true;

	for(var i = 0; i < texto.length; i++){
		if (!caracteres.includes(texto[i])){
			result=false;
			break;
		}
	}

	return result;
}


//******************************************************// Extra

var tempoManzanable = null;
var tempoManzanableInfinite = null;
var gravedadManzanable = 0.2;
var velocidadTerminalManzanable = 5;
var xCursor = 0;
var yCursor = 0;

function Manzanable(){
	//var posInicial = ($("body").width() * Math.random()).toString();
	var velInicialX = (Math.random()*2 - 1).toString();

	$("body").append( '<span class="glyphicon glyphicon-apple manzana fa-spin" velX="' + velInicialX + '" velY="-5" style="left: ' + xCursor + 'px; top: ' + yCursor + 'px;" aria-hidden="true"></span>' );

	if (!tempoManzanable){
		tempoManzanable = setInterval(function(){ vidaManzanable() }, 1);
	}
}


function vidaManzanable(){
	var objManzanas = $(".manzana");

	//Actuar sobre cada manzana
	$.each(objManzanas, function(index, item){
		var nuevaPosY = parseFloat($(item).css("top").replace("px", "")) + parseFloat($(item).attr("velY"));
		var nuevaVelY = parseFloat($(item).attr("velY")) + gravedadManzanable;
		var nuevaPosX = parseFloat($(item).css("left").replace("px", "")) + parseFloat($(item).attr("velX"));

		//Velocidad terminal
		if (nuevaVelY > velocidadTerminalManzanable)
			nuevaVelY = velocidadTerminalManzanable;

		$(item).css("top", nuevaPosY.toString() + "px");
		$(item).attr("velY", nuevaVelY.toString());
		$(item).css("left", nuevaPosX.toString() + "px");

		//Eliminar las que se salgan de la pantalla
		if(nuevaPosY > $("body").height())
			item.remove();
	});
}

function ManzanableInfinite(intervalo){
	if (!intervalo)
		intervalo = 500;

	if (tempoManzanableInfinite){
		clearInterval(tempoManzanableInfinite);
		tempoManzanableInfinite=null;
		$("body").removeAttr("onMouseMove");
	}
	else{
		tempoManzanableInfinite = setInterval(function(){ Manzanable() }, intervalo);
		$("body").attr("onMouseMove", "coordenadas(event);");
	}
}

function ManzanableInfiniteX2(){
	ManzanableInfinite(100);
}

function coordenadas(event) {
	 xCursor = event.clientX;
	 yCursor = event.clientY;
}
//******************************************************// Fin Extra