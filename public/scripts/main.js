$(document).ready(function () {
	actualizarAltoCarrusel();
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