$(document).ready(function() {
	$('#password-form').submit(function(e) {
		e.preventDefault();
		var pwd =$('#password').val();
		var d = Tea.decrypt(WISHLIST, pwd);
		if(d.indexOf("article") !== -1) {
			$('#wishlist-placeholder').replaceWith(d);
		} else {
			$('#password').addClass('false');
		}
		return false;
	});
	$('#password').keyup(function(e) {
		$(this).removeClass('false');
	});
});