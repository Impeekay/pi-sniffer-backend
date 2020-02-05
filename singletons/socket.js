const io = require("socket.io")(8000); //initialize the socketserver to listen on this port, ensure this is reverse proxied when doing nginx or any webserver

module.exports = { io };
