
let serial
let portName = "/dev/tty.usbmodem1201"

let activeSensor = ""
let potValue = 0
let photoValue = 0
let buttonValue = 0

let ledMessage = "H" // H or L

function setup() {
  createCanvas(600, 600)

  serial = new p5.SerialPort()

  serial.onList(gotList)
  serial.list()

  serial.onOpen(gotOpen)
  serial.openPort(portName)

  serial.onData(gotData)
}

function draw() {
  if(buttonValue > 0) {
    background(150)
  }else {
    background(0)
  }
  
  noStroke()
  fill(photoValue, 30, 45)
  ellipse(width / 2, height / 2, potValue)
}

function gotList(ports) {
  for (let i = 0; i < ports.length; i++) {
    console.log(ports[i])
  }
}

function gotOpen() {
  console.log("Port Open!")
}

function gotData() {
  let newData = serial.readLine()
  if (newData.length <= 0) return;
  // console.log(newData)

  if (newData === "potentiometer" ||
    newData === "photocell" ||
    newData === "button") {
    activeSensor = newData
  } else {
    if (activeSensor === "potentiometer") {
      potValue = newData / 2
    }

    if (activeSensor === "photocell") {
      photoValue = newData / 4
    }

    if (activeSensor === "button") {
      buttonValue = newData
    }
  }
}

function mouseReleased() {
  console.log("sending message: ", ledMessage)
  serial.write(ledMessage)
  if (ledMessage === "H") {
    ledMessage = "L"
  } else {
    ledMessage = "H"
  }
}