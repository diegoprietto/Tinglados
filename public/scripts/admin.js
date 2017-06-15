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

//Indica cual vistas ya fueron cargadas y no deben volver a cargarse de nuevo
var VistasCargadas = {
	fotos: false,
	solicitudes: false,
	usuario: false,
	exportBd: false
}

$(document).ready(function () {
	//Contenedor de fotos desactivado
	$("#ContenedorFotos").hide();
	//Spin oculto inicialmente
	$("#BotonGuardarInfo .fa-spinner").hide();

	//Asignar evento al control de carga de imagenes para procesar los archivos seleccionados
	document.getElementById('files').addEventListener('change', CargarFoto, false);

	//Inicializar tooltips
	$('[data-toggle="tooltip"]').tooltip();
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
	$("#ContenedorSolicitudes").hide();
	$("#ContenedorUsuario").hide();
	$("#ContenedorExportBd").hide();
}

function VisionFotos(){
	$("#ContenedorFotos").show();
	$("#ContenedorInfo").hide();
	$("#ContenedorSolicitudes").hide();
	$("#ContenedorUsuario").hide();
	$("#ContenedorExportBd").hide();

	//Cargar fotos dinámicamente
	if (!VistasCargadas.fotos){
		VistasCargadas.fotos = true;
		CargaInicialFotos();
	}
}

function VisionSolicitudes(){
	$("#ContenedorFotos").hide();
	$("#ContenedorInfo").hide();
	$("#ContenedorSolicitudes").show();
	$("#ContenedorUsuario").hide();
	$("#ContenedorExportBd").hide();

	//Carga de solicitudes
	if (!VistasCargadas.solicitudes){
		VistasCargadas.solicitudes = true;
		ObtenerSolicitudes();
	}
}

function VisionUsuario(){
	$("#ContenedorFotos").hide();
	$("#ContenedorInfo").hide();
	$("#ContenedorSolicitudes").hide();
	$("#ContenedorUsuario").show();
	$("#ContenedorExportBd").hide();

	//Carga de datos
	if (!VistasCargadas.usuario){
		VistasCargadas.usuario = true;
		ObtenerDatosUsuario();
	}
}

function VisionExportBd(){
	$("#ContenedorFotos").hide();
	$("#ContenedorInfo").hide();
	$("#ContenedorSolicitudes").hide();
	$("#ContenedorUsuario").hide();
	$("#ContenedorExportBd").show();
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
             	$("#list").append(['<div class="CampoFoto col-lg-4 col-md-4 col-sm-6 col-xs-12" idFoto="">\
             		<div style="margin-top: 15px">\
             			<span class="FotoEliminar" style="color: red; display: none;"><i class="fa fa-trash" onclick="EliminarFoto(this);"></i></span>\
						<span class="FotoSpin" style="color: black; display: none;"><i class="fa fa-spinner fa-spin"></i>Cargando al servidor...</span>\
						<span class="FotoCargar" style="color: red; cursor: pointer; display: block;" onclick="SubirFoto(this);"><i class="fa fa-upload"></i>Error, clic para volver a intentar...</span>\
             		</div>\
             		<img class="miniaturaFoto" height="196px" width="300px" src="', e.target.result,'" title="', escape(theFile.name), '"/> </div>'].join(''));

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
	if (response && response.Resultado && response.Resultado==='OK' && response.Info && response.Info.insertedIds && response.Info.insertedIds.length === 1){
		var idFoto = response.Info.insertedIds[0];
		elemento.attr("idFoto", idFoto);
	}else
	{
		alert("Se produjo un error inesperado en el sitio, intente recargar la página para trabajar normalmente, si este mensaje persiste contacte al administrador del sitio para su corrección.");
		//Mostrar el botón de error
		elemento.find('.FotoEliminar').hide();
		elemento.find('.FotoSpin').hide();
		elemento.find('.FotoCargar').show();
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

	alert("Se produjo un error inesperado, intente recargar la página, si el error persiste contacte al administrador del sitio para su corrección.");
}

//Carga las fotos mediante AJAX una vez iniciada la página para que el usuario no tenga que esperar
function CargaInicialFotos(){
	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "ObtenerFotos",
		success: function(response) { ObtenerFotosOk(response); },
		error: function(response) { ObtenerFotosError(response); }
	});
}

function ObtenerFotosOk(response){
	//Renderizar fotos
	$("#list").empty();
	if (response && response.Resultado && response.Resultado==='OK' && response.Datos){

		$.each(response.Datos, function(index, value){

		 	$("#list").append(['<div class="CampoFoto col-lg-4 col-md-4 col-sm-6 col-xs-12" idFoto="', value._id, '">\
		 		<div style="margin-top: 15px">\
		 			<span class="FotoEliminar" style="color: red; display: block;"><i class="fa fa-trash" onclick="EliminarFoto(this);"></i></span>\
					<span class="FotoSpin" style="color: black; display: none;"><i class="fa fa-spinner fa-spin"></i>Cargando al servidor...</span>\
					<span class="FotoCargar" style="color: red; cursor: pointer; display: none;" onclick="SubirFoto(this);"><i class="fa fa-upload"></i>Error, clic para volver a intentar...</span>\
		 		</div>\
		 		<img class="miniaturaFoto" src="', value.BinarioS,'" title="', "Foto", '"/> </div>'].join(''));

		});
	}else{
		//Insertar en el HTML el alerta de error
		$("#list").append('\
			<div class="col-sm-12">\
					<div class="alert alert-danger" role="danger" ><i class="fa fa-exclamation-triangle"></i> No se pudieron obtener las fotos del servidor, para reintentar vuelva a recargar la página.</div>\
			</div>'
			);
	}
}

function ObtenerFotosError(response){
	//Insertar en el HTML el alerta de error
	$("#list").empty();
	$("#list").append('\
		<div class="col-sm-12">\
				<div class="alert alert-danger" role="danger" ><i class="fa fa-exclamation-triangle"></i> No se pudieron obtener las fotos del servidor, para reintentar vuelva a recargar la página.</div>\
		</div>');
}

//Carga las solicitudes realizadas por los usuarios
function ObtenerSolicitudes(){
	$.ajax({
		contentType: "application/json",
		method: "GET",
		url: "ObtenerSolicitudes",
		success: function(response) { ObtenerSolicitudesOk(response); },
		error: function(response) { ObtenerSolicitudesError(response); }
	});
}

function ObtenerSolicitudesOk(result){
	var htmlPanel;

	$("#ContenedorSolicitudes").empty();

	if (result && result.Datos && result.Datos.length){

		var lista = result.Datos;

		//Escribir html
		for (var i=0; i < lista.length; i++){

			htmlPanel = '\
				<div class="col-sm-12" id="' + lista[i]._id + '">\
				   <div class="panel panel-info" >\
				      <div class="panel-heading">' + VerificarSiEsNuevoHtml(lista[i].Nuevo) + ' ' + ConvertirFechaToString(lista[i].Fecha) + ' </div>\
				      <div class="panel-body">\
				         <ul class="list-group">\
				            <li class="list-group-item">\
				               <div class="tituloSolicitud">Nombre:</div>\
				               ' + lista[i].Nombre + '\
				            </li>\
				            <li class="list-group-item">\
				               <div class="tituloSolicitud">Apellido:</div>\
				               ' + lista[i].Apellido + '\
				            </li>\
				            <li class="list-group-item">\
				               <div class="tituloSolicitud">Mail:</div>\
				               ' + lista[i].Mail + '\
				            </li>\
				            <li class="list-group-item">\
				               <div class="tituloSolicitud">Teléfono:</div>\
				               ' + lista[i].TelCodigo + ' - ' + lista[i].TelNro + '\
				            </li>\
				            <li class="list-group-item">\
				               <div class="tituloSolicitud">Mensaje:</div>\
				               ' + lista[i].Mensaje + '\
				            </li>\
				         </ul>\
				      </div>\
				   </div>\
				</div>'

			//Insertar en el HTML
			$("#ContenedorSolicitudes").append(htmlPanel);

		}

	}else{
		//Insertar en el HTML el alerta de que no hay datos
		$("#ContenedorSolicitudes").append('\
			<div class="col-sm-12">\
	   			<div class="alert alert-info" role="alert" ><i class="fa fa-info-circle"></i> No se encontraron registros.</div>\
			</div>'
			);
	}
}

function ObtenerSolicitudesError(){
	//Insertar en el HTML el alerta de error
	$("#ContenedorSolicitudes").empty();
	$("#ContenedorSolicitudes").append('\
		<div class="col-sm-12">\
   			<div class="alert alert-danger" role="alert" ><i class="fa fa-exclamation-triangle"></i> No se pudieron obtener los registros del servidor, para reintentar vuelva a recargar la página.</div>\
		</div>'
		);
}

//Devuelve el HTML para indicar que es nuevo para este usuario si corresponde, sino devuelve cadena vacía
function VerificarSiEsNuevoHtml(registro){
	var etiquetaNuevo = '<span class="label label-danger">Nuevo</span>';

	//Verificar el valor de la propiedad
	if (registro){
		return etiquetaNuevo;
	}else{
		return '';
	}
}

//Convierte la fecha en una cadena amigable
function ConvertirFechaToString(strFecha){
	var fecha = new Date(strFecha);

	var cadena = " " + DosCaracteres(fecha.getDate()) + "/" + DosCaracteres(fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " - " + DosCaracteres(fecha.getHours()) + ":" + DosCaracteres(fecha.getMinutes()) + ":" + DosCaracteres(fecha.getSeconds()) + " hs";
	
	return cadena;
}

//Convertir a dos caracteres
function DosCaracteres(nro){
	var str = nro.toString();

	if (str.length === 1){
		return ("0" + str);
	}else{
		return (str);
	}
}

//Obtiene mediante Ajax los datos necesarios para la vista Usuario
function ObtenerDatosUsuario(){
	$.ajax({
		contentType: "application/json",
		method: "GET",
		url: "ObtenerDatosVistaUsuario",
		success: function(response) { ObtenerDatosUsuarioOk(response); },
		error: function(response) { ObtenerDatosUsuarioError(response); }
	});	
}

function ObtenerDatosUsuarioOk(result){

	if (result && result.Datos && result.Datos){
		//Obtener mail de usuario
		if (result.Datos.mail){
			$("#usuarioMail").val(result.Datos.mail);
		}

		//Obtener mail de solicitudes
		if (result.Datos.mailDestino){
			$("#usuarioMailSolicitud").val(result.Datos.mailDestino);
		}

		//Mostrar los controles y ocultar el spinner
		$("#ContenedorUsuarioLoading").hide();
		$("#ContenedorUsuarioCuerpo").show();
	}else{
		//No se recibieron datos
		ObtenerDatosUsuarioError();
	}

}

function ObtenerDatosUsuarioError(){
	//Insertar en el HTML el alerta de error
	$("#ContenedorUsuario").empty();
	$("#ContenedorUsuario").append('\
		<div class="col-sm-12">\
   			<div class="alert alert-danger" role="alert" ><i class="fa fa-exclamation-triangle"></i> No se pudieron obtener los registros del servidor, para reintentar vuelva a recargar la página.</div>\
		</div>');
}

//Evento click del botón guardar de la vista Usuario
function UsuarioGuardar(){
	var estructuraDatos = new Object();

	if ($("#usuarioMailButton").attr('disabled') === 'disabled')
		estructuraDatos.mail = $("#usuarioMail").val();

	if ($("#usuarioMailSolicitudButton").attr('disabled') === 'disabled')
		estructuraDatos.mailDestino = $("#usuarioMailSolicitud").val();

	//Deshabilitar el botón
	$("#usuarioGuardar").attr("disabled", "disabled");
	$("#usuarioGuardar .fa-floppy-o").hide();
	$("#usuarioGuardar .fa-spinner").show();
	//Ocultar alerta de error (Si estuviera visible)
	$(".usuarioAlertaError").remove();

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "GuardarUsuario",
		data: JSON.stringify({ content: estructuraDatos }),
		success: function(response) { UsuarioGuardarOk(response); },
		error: function(response) { UsuarioGuardarError(response); }
	});	
}

function UsuarioGuardarOk(result){
	//Insertar en el HTML el alerta de éxito
	$("#ContenedorUsuario").append('\
		<div class="col-sm-12 usuarioAlertaError">\
   			<div class="alert alert-success" role="alert" ><i class="fa fa-check"></i> Se actualizó con éxito.</div>\
		</div>');

	//Restablecer botón de Guardar
	$("#usuarioGuardar .fa-floppy-o").show();
	$("#usuarioGuardar .fa-spinner").hide();

	//Reestablecer controles de formulario
	$("#usuarioMail").attr("disabled", "disabled");
	$("#usuarioMailButton").removeAttr("disabled");

	$("#usuarioMailSolicitud").attr("disabled", "disabled");
	$("#usuarioMailSolicitudButton").removeAttr("disabled");
}

function UsuarioGuardarError(result){
	//Insertar en el HTML el alerta de error
	$("#ContenedorUsuario").append('\
		<div class="col-sm-12 usuarioAlertaError">\
   			<div class="alert alert-danger" role="alert" ><i class="fa fa-exclamation-triangle"></i> Error al intenar conectarse con el servidor, vuelva a reintentar</div>\
		</div>');

	//Volver a habilitar el botón para permitir reintentar
	$("#usuarioGuardar").removeAttr("disabled");
	$("#usuarioGuardar .fa-floppy-o").show();
	$("#usuarioGuardar .fa-spinner").hide();
}

function ChangePw(){
	$("#modalPass").modal("show");
}

function ConfirmChangePw(){
	var estructuraDatos = {
		oldPass: $("#usuarioOldPass").val(),
		pass: $("#usuarioNewPass").val()
	}

	//Validar
	if ($("#usuarioOldPass").val().length === 0){
		//Informar error
		$("#AlertErrorModal").show();
		$("#AlertErrorModal span").text("Ingrese el password actual.");
		return;
	}
	if ($("#usuarioNewPass").val().length === 0){
		//Informar error
		$("#AlertErrorModal").show();
		$("#AlertErrorModal span").text("Ingrese el nuevo password.");
		return;
	}
	if ($("#usuarioNewPass2").val().length === 0){
		//Informar error
		$("#AlertErrorModal").show();
		$("#AlertErrorModal span").text("Ingrese el nuevo password en ambos campos.");
		return;
	}else if($("#usuarioNewPass").val() !== $("#usuarioNewPass2").val()){
		//Informar error
		$("#AlertErrorModal").show();
		$("#AlertErrorModal span").text("El nuevo password y la repetición no coinciden.");
		return;
	}

	//Deshabilitar controles
	$("#ConfirmChangePwButton").attr("disabled", "disabled");
	$("#ConfirmChangePwButton .fa-floppy-o").hide();
	$("#ConfirmChangePwButton .fa-spinner").show();
	//Ocultar alertas (Si alguna estuviera visible)
	$("#AlertExitoModal").hide();
	$("#AlertErrorModal").hide();

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "GuardarUsuario",
		data: JSON.stringify({ content: estructuraDatos }),
		success: function(response) { ConfirmChangePwOk(response); },
		error: function(response) { ConfirmChangePwError(response); }
	});	
}

function ConfirmChangePwOk(result){
	//Verificar respuesta del servidor
	if (result && result.Resultado){

		if (result.Resultado === 'ERRORPASS'){
			//Password incorrecto
			$("#AlertErrorModal").show();
			$("#AlertErrorModal span").text(result.Info ? result.Info : "El password actual es incorrecto.");

		}else if (result.Resultado === 'OK'){
			//Informar éxito
			$("#AlertExitoModal").show();

		}else{
			//Respuesta inesperada
			$("#AlertErrorModal").show();
			$("#AlertErrorModal span").text("Respuesta inesperada por parte del servidor (" + result.Resultado + "), vuelva a reintentar, si el problema persiste contacte con el desarrollador.");
		}

	}else{
		//Respuesta inesperada
		$("#AlertErrorModal").show();
		$("#AlertErrorModal span").text("El servidor no envió ningún dato, vuelva a reintentar, si el problema persiste contacte con el desarrollador.");
	}

	//Reestablecer botón guardar
	$("#ConfirmChangePwButton").removeAttr("disabled");
	$("#ConfirmChangePwButton .fa-floppy-o").show();
	$("#ConfirmChangePwButton .fa-spinner").hide();
}

function ConfirmChangePwError(result){
	//Informar error
	$("#AlertErrorModal").show();
	$("#AlertErrorModal span").text("Error en la conexión con el servidor, vuelva a intentar.");

	//Reestablecer botón guardar
	$("#ConfirmChangePwButton").removeAttr("disabled");
	$("#ConfirmChangePwButton .fa-floppy-o").show();
	$("#ConfirmChangePwButton .fa-spinner").hide();
}

function RecDatos(id, elemento){
	alert("Función no habilitada por seguridad.")
}

function genDatos(id, elemento){
	//Mostrar spinner y deshabilitar el botón
	var boton = $(elemento).closest('button');
	boton.attr("disabled", "disabled");
	boton.find(".fa-cogs").hide();
	boton.find(".fa-spinner").show();

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "GenerarDatos",
		data: JSON.stringify({ content: id }),
		success: function(response) { genDatosOk(response, elemento); },
		error: function(response) { genDatosError(response, elemento); }
	});
}

function genDatosOk(resultado, elemento){

	descargarArchivo(generarTexto(resultado), 'archivo.txt');

	//Ocultar spinner
	var boton = $(elemento).closest('button');
	boton.removeAttr("disabled");
	boton.find(".fa-cogs").show();
	boton.find(".fa-spinner").hide();
}

//Genera un objeto Blob con los datos en un archivo TXT
function generarTexto(datos) {
    var texto = JSON.stringify(datos);

    return new Blob([texto], {
        type: 'text/plain'
    });
};

function descargarArchivo(contenidoEnBlob, nombreArchivo) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var save = document.createElement('a');
        save.href = event.target.result;
        save.target = '_blank';
        save.download = nombreArchivo || 'archivo.dat';
        var clicEvent = new MouseEvent('click', {
            'view': window,
                'bubbles': true,
                'cancelable': true
        });
        save.dispatchEvent(clicEvent);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    };
    
    reader.readAsDataURL(contenidoEnBlob);
};

function genDatosError(resultado, elemento){
	//Ocultar spinner y habilitar el botón
	alert("Se produjo un error, vuelva a reintentar.");

	var boton = $(elemento).closest('button');
	boton.removeAttr("disabled");
	boton.find(".fa-cogs").show();
	boton.find(".fa-spinner").hide();
}