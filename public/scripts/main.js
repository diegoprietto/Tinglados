"use strict";

$(document).ready(function () {
	actualizarAltoCarrusel();
	$(".botonLlamar").on( "click", llamarTel );
	//Solicitar fotos del server para el carrousel
	CargaInicialFotos();
});

$(window).resize(function () {
	actualizarAltoCarrusel();
});

function actualizarAltoCarrusel(){
	var altoTitulo = $(".tituloFormulario").height() + parseInt($(".tituloFormulario").css("padding-top").replace("px","")) + parseInt($(".tituloFormulario").css("padding-bottom").replace("px",""));
	var altoCuerpo = $(".cuerpoFormulario").height() + parseInt($(".cuerpoFormulario").css("padding-top").replace("px","")) + parseInt($(".cuerpoFormulario").css("padding-bottom").replace("px",""));

	var altoTotal = altoTitulo + altoCuerpo;
	var anchoTotal = (26/17)*altoTotal;
	$("#carrusel").css("height",altoTotal + "px");
	$(".carousel-inner img").css("height", altoTotal + "px");
	$(".carousel-inner img").css("width", anchoTotal + "px");
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
		$(".botonLlamar").html(data.t1 + data.t2);
		$(".botonLlamar").off( "click" );
	}
}

function Contacto(){
	var datos = ObtenerDatosContacto();

	if (ValidarDatos(datos)){
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


	/////TERMINAR DESARROLLO
	if (msjError.length > 0){
		////Mostrar errores al usuario

		return false;
	}else{
		//Todo Ok

		////Quitar colores rojos a los campos que pudieran haberse marcado como inválido

		return true;
	}
}

function ContactoOk(){
	$("#ContactButton").attr("disabled", "disabled");
	alert("Gracias por su contacto, en breve se comunicarán con usted.");
}

function ContactoError(){
	alert("Error en el servidor, por favor vuelva a reintentar.");
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