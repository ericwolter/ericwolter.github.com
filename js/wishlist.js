$(document).ready(function() {
	$('#password-form').submit(function(e) {
		e.preventDefault();
		var pwd =$('#password').val();
		var d = Tea.decrypt(WISHLIST, pwd);
		if(d.indexOf("article") !== -1) {
			$('#page-content').html(d);
		} else {
			alert('false password');
		}
		return false;
	});
});