var Hello = {
	connection: null,
	start_time: null,
		log: function (msg) {
			$('#log').append("<p>" + msg + "</p>");
		},
		send_discoInfoQuery: function(to) {
				var pres1 = $iq({
						to: to,
						type: "get",
						id: "disco1"})
						.c("query", {xmlns: "http://jabber.org/protocol/disco#info"});

						Hello.log("Sending disco info query to " + to + ".");
						Hello.log("packet sent is " + pres1 + ".");
						Hello.connection.send(pres1);
		},
		send_ping: function (to) {
			var ping = $iq({
				to: to,
				type: "get",
				id: "ping1"})
				.c("ping", {xmlns: "urn:xmpp:ping"});
				
				Hello.log("Sending ping to " + to + ".");
				Hello.start_time = (new Date()).getTime();
				Hello.log("packet sent is " + ping + ".");
				Hello.connection.send(ping);
		},
		handle_discoInfoQuery: function (iq) {
			Hello.log("DiscoInfoQuery received is " + iq + ".");
			Hello.connection.disconnect();
			return false;
		},
		handle_pong: function (iq) {
			var elapsed = (new Date()).getTime() - Hello.start_time;
			Hello.log("Received pong from server in " + elapsed + "ms.");
			Hello.connection.disconnect();
			return false;
		}
};


$(document).ready(function () {
	$('#login_dialog').dialog({
		autoOpen: true,
		draggable: false,
		modal: true,
		title: 'Connect to XMPP',
		buttons: {
			"Connect": function () {
				$(document).trigger('connect', {
					jid: $('#jid').val(),
					password: $('#password').val()
				});
			$('#password').val('');
			$(this).dialog('close');
			}
		}
	});
});

$(document).bind('connect', function (ev, data) {
	//var conn = new Strophe.Connection("http://blr00bck.idc.oracle.com:8080/httpbind/httpbind?to=test.sun.com/");
	var conn = new Strophe.Connection("http://bosh.metajack.im:5280/xmpp-httpbind");
	 conn.connect(data.jid, data.password, function (status) {
		if (status === Strophe.Status.CONNECTED) {
			$(document).trigger('connected');
		} else if (status === Strophe.Status.DISCONNECTED) {
			$(document).trigger('disconnected');
		}
	});
	 Hello.connection = conn;
});




$(document).bind('connected', function (data) {
// inform the user
Hello.log("Connection established.");
//Hello.connection.addHandler(Hello.handle_pong, null, "iq", null, "ping1");
Hello.log("after ping");
Hello.connection.addHandler(Hello.handle_discoInfoQuery, null, "iq", null, "disco1");

var domain = Strophe.getDomainFromJid(Hello.connection.jid);
Hello.send_discoInfoQuery(domain);
Hello.send_ping(domain);


// alert("pres1 is" + pres1);
 Hello.connection.send(pres1);
});

$(document).bind('disconnected', function () {
Hello.log("Connection terminated.");
// remove dead connection object
Hello.connection = null;
});