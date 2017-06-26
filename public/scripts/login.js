function log(){
	$("#init").attr("disabled", "disabled");

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "login",
		data: JSON.stringify({ content:
			{
				id: $("#id").val(),
				pass: $("#pass").val()
			}
		}),
		success: function(response) { logOk(response); },
		error: function(response) { LogError(response); }
	});
}

function logOk(resultado){
	if (resultado && resultado.Resultado){
		switch(resultado.Resultado){
			case "INCOMPLETE":
				mostrarAlerta("Complete ambos campos");
				habilitarInit();
			break;
			case "ERROR":
				mostrarAlerta("Se produjo un error en las bases de datos del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
				habilitarInit();
			break;
			case "NOTFIND":
				mostrarAlerta("El usuario y/o contraseña no son válidos");
				$("#btnOlvideMiPw").show();
				habilitarInit();
			break;
			case "OK":
				window.location="/admin";
			break;
			default:
				mostrarAlerta("Respuesta no válida del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
				habilitarInit();
			break;
		}

	}else{
		mostrarAlerta("Respuesta no válida del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
	}
}

function LogError(){
	mostrarAlerta("Se produjo un error en el servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
	habilitarInit();
}

function habilitarInit(){
	$("#init").removeAttr("disabled");
}

function habilitarBtnRestablecer(){
	$("#btnRestablecer").removeAttr("disabled");
}

function mostrarAlerta(msj){
	$("#AlertError span").text(msj);
	$("#AlertError").show();
	$("#AlertOk").hide();
}

function mostrarExito(msj){
	$("#AlertOk span").text(msj);
	$("#AlertOk").show();
	$("#AlertError").hide();
}

function olvideMiPw(){
	$("#formRestablecer").show();
}

function restablecer(){
	$("#btnRestablecer").attr("disabled", "disabled");

	$.ajax({
		contentType: "application/json",
		method: "POST",
		url: "loginRestablecer",
		data: JSON.stringify({ content:
			{
				id: $("#idRestablecer").val(),
			}
		}),
		success: function(response) { restablecerOk(response); },
		error: function(response) { restablecerError(response); }
	});
}

function restablecerOk(resultado){
	if (resultado && resultado.RESULTADO){
		switch(resultado.RESULTADO){
			case "INCOMPLETE":
				mostrarAlerta(resultado.MENSAJE ? resultado.MENSAJE : "Introduzca el usuario.");
				habilitarBtnRestablecer();
			break;
			case "ERROR":
				mostrarAlerta(resultado.MENSAJE ? resultado.MENSAJE : "Error en el servidor.");
				habilitarBtnRestablecer();
			break;
			case "NOTFIND":
				mostrarAlerta(resultado.MENSAJE ? resultado.MENSAJE : "Usuario no encontrado.");
				habilitarBtnRestablecer();
			break;
			case "OK":
				mostrarExito(resultado.MENSAJE ? resultado.MENSAJE : "Mail enviado, verifique su correo (Incluso en Correo No deseado) e ingrese la nueva contraseña generada. El correo puede tardar varios minutos en llegar en algunos casos.");
				habilitarBtnRestablecer();
			break;
			default:
				mostrarAlerta("Respuesta no válida del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
				habilitarBtnRestablecer();
			break;
		}

	}else{
		mostrarAlerta("Respuesta no válida del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
	}
}

function restablecerError(){
	mostrarAlerta("Se produjo un error en el servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
	habilitarBtnRestablecer();
}