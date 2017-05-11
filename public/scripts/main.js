"use strict";

$(document).ready(function () {
	actualizarAltoCarrusel();
	$(".botonLlamar").on( "click", llamarTel );
});

$(window).resize(function () {
	actualizarAltoCarrusel();
});

function actualizarAltoCarrusel(){
	var altoTitulo = $(".tituloFormulario").height() + parseInt($(".tituloFormulario").css("padding-top").replace("px","")) + parseInt($(".tituloFormulario").css("padding-bottom").replace("px",""));
	var altoCuerpo = $(".cuerpoFormulario").height() + parseInt($(".cuerpoFormulario").css("padding-top").replace("px","")) + parseInt($(".cuerpoFormulario").css("padding-bottom").replace("px",""));

	$("#carrusel").css("height",(altoTitulo + altoCuerpo) + "px");
	$(".carousel-inner img").css("height",(altoTitulo + altoCuerpo) + "px");
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