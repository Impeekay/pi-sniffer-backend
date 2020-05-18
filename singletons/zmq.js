const zmq = require("zeromq");
const io = require("./socket");

let sock;
async function run() {
  sock = new zmq.Subscriber();

  //keeping this address static as of now, to ensure everyone connects to this as per requirement
  sock.connect("tcp://127.0.0.1:5556");
  //subscribe to this topic
  sock.subscribe("lol");

  console.log("Subscriber connected to port 3000");

  for await (const [msg] of sock) {
    // console.log("received message on", msg);
    console.log("debug frame received to forward");
    // console.log(msg.toString().split("lol")[1]);
    let data = msg.toString().split("lol")[1];
    io.io.emit("debugFrame", data);
  }
}

run();

module.exports = sock;
