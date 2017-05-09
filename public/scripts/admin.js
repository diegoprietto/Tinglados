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
									<h4 class="media-heading CampoTitulo" contenteditable="true">Nuevo</h4>\
									<label class="CampoCuerpo" contenteditable="true">Contenido</label>\
								</div>\
							</li>';


$(document).ready(function () {

});

function AgregarInfo(){

	$("#ListaInfo").append(estructuraDocumento);

	habilitarGuardadoInfo();
}

function HabilitarInfo(elemento){
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
		$(elemento).closest('.Documento').remove();
	}
}

function habilitarGuardadoInfo(){
	$("#BotonGuardarInfo").removeAttr("disabled");
}

function GuardarInfo(){
	var datos = ObtenerDatosInfo();

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "GuardarInfo",
		data: JSON.stringify({ content: datos }),
		success: function(response) { GuardarInfoOk(response); },
		error: function(response) { console.log(response); }
	});
}

function GuardarInfoOk(resultado){
	$("#BotonGuardarInfo").attr("disabled", "disabled");
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