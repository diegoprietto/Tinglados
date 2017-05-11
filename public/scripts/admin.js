"use strict";

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

	//Asignar evento al control de carga de imagenes para procesar los archivos seleccionados
	document.getElementById('files').addEventListener('change', CargarFoto, false);

	//Cargar fotos dinámicamente
	CargaInicialFotos();
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

function CargarFoto(evt) {
  
    var files = evt.target.files; // FileList object
     
      //Obtenemos la imagen del campo "file". 
    for (var i = 0, f; f = files[i]; i++) {         
         //Solo admitimos imágenes.
         if (!f.type.match('image.*')) {
              continue;
         }
     
         var reader = new FileReader();
         
         reader.onload = (function(theFile) {
             return function(e) {
             	// Creamos la imagen (idFoto es el ID con el que se guarda en la BD, inicialmente esta vacío hasta que se guarde correctamente)
             	$("#list").append(['<div class="CampoFoto" idFoto="">\
             		<div style="margin-top: 15px">\
             			<span class="FotoEliminar" style="color: red; display: none;"><i class="fa fa-trash" onclick="EliminarFoto(this);"></i></span>\
						<span class="FotoSpin" style="color: black; display: none;"><i class="fa fa-spinner fa-spin"></i>Cargando al servidor...</span>\
						<span class="FotoCargar" style="color: red; cursor: pointer; display: block;" onclick="SubirFoto(this);"><i class="fa fa-upload"></i>Error, clic para volver a intentar...</span>\
             		</div>\
             		<img class="miniaturaFoto" src="', e.target.result,'" title="', escape(theFile.name), '"/> </div>'].join(''));

             	//Cargamos en el server la nueva imagen
             	SubirFotoIdFoto( $('#list div[idFoto=""]:last-child') );
             };
         })(f);

         reader.readAsDataURL(f);
     }
}

function EliminarFoto(elemento){
	var elementoIdFoto = $(elemento).closest('div.CampoFoto');
	var idFoto = elementoIdFoto.attr("idFoto");

	//Mostrar animación de cargando
	elementoIdFoto.find('.FotoEliminar').hide();
	elementoIdFoto.find('.FotoSpin').show();
	elementoIdFoto.find('.FotoCargar').hide();

	if (idFoto){
		$.ajax({
			contentType: "application/json",
			method: "POST",
			url: "BorrarFoto",
			data: JSON.stringify({ content: idFoto }),
			success: function(response) { BorrarFotoOk(response, elementoIdFoto); },
			error: function(response) { BorrarFotoError(response, elementoIdFoto); }
		});
	}else{
		alert("Se produjo un error inesperado, intente recargar la página, si el error persiste contacte al administrador del sitio para su corrección.")
	}
}

//Recibe como parámetro el elemento span con clase FotoCargar, se tiene que buscar el div con el atributo idFoto
function SubirFoto(elemento){
	var elementoIdFoto = $(elemento).closest('div[idFoto=""]');

	SubirFotoIdFoto(elementoIdFoto);
}

//Recibe como parámetro un selector JQuery que referencia al div que contiene el atributo idFoto
//Esta función realiza una llamada Ajax que almacena la foto codificada en el servidor
function SubirFotoIdFoto(elemento){
	//Mostrar animación de cargando
	elemento.find('.FotoEliminar').hide();
	elemento.find('.FotoSpin').show();
	elemento.find('.FotoCargar').hide();

	var dataFoto = elemento.find('.miniaturaFoto').attr("src");

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "GuardarFoto",
		data: JSON.stringify({ content: dataFoto }),
		success: function(response) { GuardarFotoOk(response, elemento); },
		error: function(response) { GuardarFotoError(response, elemento); }
	});
}

function GuardarFotoOk(response, elemento){
	//Mostrar el botón de eliminar
	elemento.find('.FotoEliminar').show();
	elemento.find('.FotoSpin').hide();
	elemento.find('.FotoCargar').hide();

	//Obtener el ID de la foto
	debugger;
	if (response && response.Resultado && response.Resultado==='OK' && response.Info && response.Info.insertedIds && response.Info.insertedIds.length === 1){
		var idFoto = response.Info.insertedIds[0];
		elemento.attr("idFoto", idFoto);
	}else
	{
		alert(alert("Se produjo un error inesperado en el sitio, intente recargar la página para trabajar normalmente, si este mensaje persiste contacte al administrador del sitio para su corrección."))
	}
}

function GuardarFotoError(response, elemento){
	//Mostrar el botón de error
	elemento.find('.FotoEliminar').hide();
	elemento.find('.FotoSpin').hide();
	elemento.find('.FotoCargar').show();
}

function BorrarFotoOk(response, elemento){
	//Eliminar html con efecto especial
	elemento.fadeOut(3000,function(){
		elemento.remove();
	});
}

function BorrarFotoError(response, elemento){
	//Mostrar el botón de eliminar
	elemento.find('.FotoEliminar').show();
	elemento.find('.FotoSpin').hide();
	elemento.find('.FotoCargar').hide();

	alert("Se produjo un error inesperado, intente recargar la página, si el error persiste contacte al administrador del sitio para su corrección.")
}

//Carga las fotos mediante AJAX una vez iniciada la página para que el usuario no tenga que esperar
function CargaInicialFotos(){
	$.ajax({
		contentType: "application/json",
		method: "GET",
		url: "ObtenerFotos",
		success: function(response) { ObtenerFotosOk(response); },
		error: function(response) { ObtenerFotosError(response); }
	});
}

function ObtenerFotosOk(response){
	//Renderizar fotos
	if (response && response.Resultado && response.Resultado==='OK' && response.Datos){
		$.each(response.Datos, function(index, value){

		 	$("#list").append(['<div class="CampoFoto" idFoto="', value._id, '">\
		 		<div style="margin-top: 15px">\
		 			<span class="FotoEliminar" style="color: red; display: block;"><i class="fa fa-trash" onclick="EliminarFoto(this);"></i></span>\
					<span class="FotoSpin" style="color: black; display: none;"><i class="fa fa-spinner fa-spin"></i>Cargando al servidor...</span>\
					<span class="FotoCargar" style="color: red; cursor: pointer; display: none;" onclick="SubirFoto(this);"><i class="fa fa-upload"></i>Error, clic para volver a intentar...</span>\
		 		</div>\
		 		<img class="miniaturaFoto" src="', value.Binario,'" title="', "Foto", '"/> </div>'].join(''));

		});
	}else{
		alert("No se pudieron obtener las fotos del servidor, para reintentar vuelva a recargar la página.")
	}
}

function ObtenerFotosError(response){
	//Se dispara si ocurre un error en la conexión con el servidor
}