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
				alert("Complete ambos campos");
				habilitarInit();
			break;
			case "ERROR":
				alert("Se produjo un error en las bases de datos del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
				habilitarInit();
			break;
			case "NOTFIND":
				alert("El usuario y/o contraseña no son válidos");
				habilitarInit();
			break;
			case "OK":
				window.location="/admin";
			break;
			default:
				alert("Respuesta no válida del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
				habilitarInit();
			break;
		}

	}else{
		alert("Respuesta no válida del servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
	}
}

function LogError(){
	alert("Se produjo un error en el servidor, recargue la página y vuelva a reintentar, si el problema persiste contacte al desarrollador del sitio para su revisión.");
	habilitarInit();
}

function habilitarInit(){
	$("#BotonGuardarInfo").removeAttr("disabled");
}