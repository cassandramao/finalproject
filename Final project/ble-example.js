// add the same uuid as your arduino
const serviceUuid = "3fdbea33-5c5c-4b78-b782-1e4e5f0826a8";

let buttonCharacteristic;
let potCharacteristic;
let photoCharacteristic;

let buttonValue = 0;
let potValue = 0;
let photoValue = 0;

let myBLE;

function setup() {
  createCanvas(windowWidth, windowHeight - 100)
  myBLE = new p5ble();

  const connectButton = createButton("Connect");
  connectButton.mousePressed(connectToBLE);
}

function draw() {
  if (buttonValue > 0) {
    background(126)
  } else { 
    background(0)
  }

  fill(255)
  text("button: " + buttonValue, 50, 50)
  text("potentiometer: " + potValue, 50, 75)
  text("photocell: " + photoValue, 50, 100)

  fill(photoValue, 30, 45);
  ellipse(width / 2, height / 2, potValue)
}

function connectToBLE() {
  myBLE.connect(serviceUuid, gotCharacteristics)
}

function gotCharacteristics(error, characteristics) {
  if (error) console.error(error)
  console.log("characteristics: ", characteristics)

  buttonCharacteristic = characteristics[0]
  myBLE.read(buttonCharacteristic, gotButtonValue)

  potCharacteristic = characteristics[1]
  myBLE.read(potCharacteristic, gotPotValue)

  // photoCharacteristic = characteristics[2]
  // myBLE.read(photoCharacteristic, gotPhotoValue)
}

function gotButtonValue(error, value) {
  if (error) console.error(error)
  buttonValue = value
// console.log("button value: ", value)
  myBLE.read(buttonCharacteristic, gotButtonValue)
}

function gotPotValue(error, value) {
  if (error) console.error(error)
  potValue = value
// console.log("button value: ", value)
  myBLE.read(potCharacteristic, gotPotValue)
}

// function gotPhotoValue(error, value) {
//   if (error) console.error(error)
//   photoValue = value
// // console.log("photocell value: ", value)
//   myBLE.read(potCharacteristic, gotPhotoValue)
// }