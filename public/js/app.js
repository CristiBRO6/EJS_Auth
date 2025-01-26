$(document).ready(function(){

    // NOTIFY

    function showNotify(message, type, autoClose = true) {
		if(!message) return;

		var typeClasses = {
			error: "toast-error",
			success: "toast-success",
			info: "toast-info",
			warning: "toast-warning"
		};
	
		var typeIcons = {
			error: "text-danger font-12 fas fa-exclamation-triangle",
			success: "text-success font-12 fas fa-check-circle",
			info: "text-info font-12 fas fa-info-circle",
			warning: "text-warning font-12 fas fa-exclamation-circle"
		};
	
		var iconClass = typeIcons[type];
		var typeClass = typeClasses[type];
	
		var toast = $('<div class="toast"></div>').addClass(typeClass);
		
		var toast_message = $('<div class="toast-message"></div>').text(message);
		var icon = $('<i></i>').addClass(iconClass);
		
		toast.append(icon);
		toast.append(toast_message);
	
		var timeout;
	
		function closeToast() {
			toast.slideUp();

			setTimeout(function() {
				toast.remove();
				if ($("#toast-container").children().length === 0) {
					setTimeout(function() {
						$("#toast-container").remove();
					}, 300);
				}
			}, 300);
		}
	
		if ($("#toast-container").length === 0) {
			$("body").append("<div id='toast-container'></div>");
		}
	
		$("#toast-container").prepend(toast);

		toast.hide().slideDown();
	
		if (autoClose) {
			timeout = setTimeout(function() {
				closeToast();
			}, 5000);

			toast.hover(
				function() {
					clearTimeout(timeout);
				},
				function() {
					timeout = setTimeout(function() {
						closeToast();
					}, 5000);
				}
			);
		}
	
		toast.click(function() {
			closeToast();
		});
	}

	// REGISTER FORM

    $(document).on('submit', '#register-form', async function(e){
        e.preventDefault();

        const name = $(this).find('input[name="name"]').val();
        const email = $(this).find('input[name="email"]').val();
        const password = $(this).find('input[name="password"]').val();
        const confirm_password = $(this).find('input[name="confirm_password"]').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ name, email, password, confirm_password }),
            success: function(data) {
                if(data.status) location.assign(data.redirect_url);
                else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });
	
	// LOGIN FORM

    $(document).on('submit', '#login-form', async function(e){
        e.preventDefault();

        const email = $(this).find('input[name="email"]').val();
        const password = $(this).find('input[name="password"]').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function(data) {
                if(data.status) location.assign(data.redirect_url);
                else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });

	// EMAIL VERIFICATION FORM

	$(document).on('submit', '#email-verification-form', async function(e){
        e.preventDefault();

        const code = $(this).find('input').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ code }),
            success: function(data) {
                if(data.status) location.assign(data.redirect_url);
                else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });

	// FORGOT PASSWORD FORM

	$(document).on('submit', '#forgot-password-form', async function(e){
        e.preventDefault();

        const email = $(this).find('input').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ email }),
            success: function(data) {
                if(data.status){
					showNotify(data.message, "success");
					$('#forgot-password-form')[0].reset();
				}else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });

	// RESET PASSWORD FORM

	$(document).on('submit', '#reset-password-form', async function(e){
        e.preventDefault();

        const password = $(this).find('input[name="password"]').val();
        const confirm_password = $(this).find('input[name="confirm_password"]').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ password, confirm_password }),
            success: function(data) {
                if(data.status) location.assign(data.redirect_url);
				else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });

	// UPDATE PROFILE FORM

	$(document).on('submit', '#update-profile-form', async function(e){
        e.preventDefault();

        const name = $(this).find('input[name="name"]').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ name }),
            success: function(data) {
                if(data.status) showNotify(data.message, "success");
                else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });

	// CHANGE PASSWORD FORM

	$(document).on('submit', '#change-password-form', async function(e){
        e.preventDefault();

        const current_password = $(this).find('input[name="current_password"]').val();
        const new_password = $(this).find('input[name="new_password"]').val();
        const confirm_new_password = $(this).find('input[name="confirm_new_password"]').val();

        $.ajax({
            url: $(this).attr('action'),
			type: $(this).attr('method'),
            contentType: 'application/json',
            data: JSON.stringify({ current_password, new_password, confirm_new_password }),
            success: function(data) {
                if(data.status) {
                    showNotify(data.message, "success");

                    $('#change-password-form')[0].reset();
                } else showNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });

    // CHANGE AVATAR FORM

    $(document).on('change', '#change-avatar-form', async function(e){
        e.preventDefault();

        const formData = new FormData($(this)[0]);

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: formData,
            processData: false,
            contentType: false, 
            success: function(data) {
                if (data.status) location.reload();
                else howNotify(data.message, "error");
            },
            error: function(xhr, status, error) {
                showNotify(xhr.responseJSON.message, "error");
            }
        });
    });
});