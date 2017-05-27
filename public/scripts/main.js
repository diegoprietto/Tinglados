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

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "Contacto",
		data: JSON.stringify({ content: datos }),
		success: function(response) { ContactoOk(response); },
		error: function(response) { ContactoError(response); }
	});
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