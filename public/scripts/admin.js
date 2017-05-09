var estructuraDocumento = '	<li class="media Documento">\
								<div class="media-left">\
									<span style="color: #337ab7;">\
										<i class="fa fa-toggle-on CampoMostrar" onclick="HabilitarInfo(this);"></i>\
									</span>\
									<span style="color: red;">\
										<i class="fa fa-trash" onclick="EliminarInfo(this);"></i>\
									</span>\
								</div>\
								<div class="media-body">\
									<h4 class="media-heading CampoTitulo" contenteditable="true" onblur="habilitarGuardadoInfo()">Nuevo</h4>\
									<label class="CampoCuerpo" contenteditable="true" onblur="habilitarGuardadoInfo()">Contenido</label>\
								</div>\
							</li>';


$(document).ready(function () {
	//Contenedor de fotos desactivado
	$("#ContenedorFotos").hide();
	//Spin oculto inicialmente
	$("#BotonGuardarInfo .fa-spinner").hide();
});

function AgregarInfo(){

	$("#ListaInfo").append(estructuraDocumento);

	habilitarGuardadoInfo();
}

function HabilitarInfo(elemento){
	habilitarGuardadoInfo();

	if ($(elemento).hasClass("fa-toggle-on")){
		$(elemento).removeClass("fa-toggle-on").addClass("fa-toggle-off");
	}else{
		$(elemento).removeClass("fa-toggle-off").addClass("fa-toggle-on");
	}
}

function EliminarInfo(elemento){
	var titulo = $(elemento).closest('.Documento').find('.CampoTitulo').text();
	var rta = confirm("¿Esta seguro que desea eliminar el registro " + titulo + "?\nUna vez guardado no se puede recuperar");

	if (rta){
		habilitarGuardadoInfo();
		$(elemento).closest('.Documento').remove();
	}
}

function habilitarGuardadoInfo(){
	$("#BotonGuardarInfo").removeAttr("disabled");
}

function GuardarInfo(){
	//Mostrar spinner y deshabilitar el botón
	$("#BotonGuardarInfo").attr("disabled", "disabled");
	$("#BotonGuardarInfo .fa-floppy-o").hide();
	$("#BotonGuardarInfo .fa-spinner").show();

	var datos = ObtenerDatosInfo();

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "GuardarInfo",
		data: JSON.stringify({ content: datos }),
		success: function(response) { GuardarInfoOk(response); },
		error: function(response) { GuardarInfoError(response); }
	});
}

function GuardarInfoOk(resultado){
	//Ocultar spinner
	$("#BotonGuardarInfo .fa-floppy-o").show();
	$("#BotonGuardarInfo .fa-spinner").hide();
}

function GuardarInfoError(resultado){
	//Ocultar spinner y habilitar el botón
	alert("Se produjo un error al intentar actualizar la información, vuelva a reintentar.");

	$("#BotonGuardarInfo").removeAttr("disabled");
	$("#BotonGuardarInfo .fa-floppy-o").show();
	$("#BotonGuardarInfo .fa-spinner").hide();
}

function ObtenerDatosInfo(){
	var itemTitulos = $(".CampoTitulo");
	var itemCuerpos = $(".CampoCuerpo");
	var itemMostrar = $(".CampoMostrar");

	var dataInfo = new Array();

	$.each(itemTitulos, function(index, value){
		dataInfo.push(
			{
				Titulo: value.innerText,
				Cuerpo: itemCuerpos[index].innerText,
				Mostrar: $(itemMostrar[index]).hasClass("fa-toggle-on") ? "S" : "N"
			}
		);
	});

	return dataInfo;
}

function VisionInfo(){
	$("#ContenedorFotos").hide();
	$("#ContenedorInfo").show();
}

function VisionFotos(){
	$("#ContenedorFotos").show();
	$("#ContenedorInfo").hide();
}