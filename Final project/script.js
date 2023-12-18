let bg;
let bgNight;
let flower1;
let flower2;
let flower3;
let flower4;
let flower5;
let sun;
let moon;
let rain;
let cloud;
let sunset;
let title;
let titleNight;

//three interactions
let imgs = [];
let positions = [];
let dragging = [false, false, false]; 
let dragOffset = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
let dropZone = {x: 450, y: 400, width: 300, height: 400}; 
let animationState = [0, 0, 0]; 
let animationFrame = [0, 0, 0]; 

let dragCount = 0;
let canvases = [];
let currentCanvas = 0;

// weather images
let weatherImg;
let weatherPos = { sun: {x: 75, y: 150}, rain: {x: 425, y: 150}, cloud: {x: 175, y: 150}, snow: {x: 425, y: 150} };
let weatherCode;
let isDay;

// arduino
let portName = '/dev/tty.usbserial-1120'; 
let photocellValue; 
let serial; 

//////////////////////break////////////////////////////

function preload(){
  bg = loadImage('IMG_0353.PNG');
  bgNight = loadImage('night.png');
  title = loadImage('title.png');
  titleNight = loadImage('titlenight.png');
  flower1 = loadImage('IMG_0354.PNG');
  flower2 = loadImage('IMG_0355.PNG');
  flower3 = loadImage('IMG_0356.PNG');
  flower4 = loadImage('IMG_0357.PNG');
  flower5 = loadImage('IMG_0358.PNG');
  sun = loadImage('IMG_0362.PNG');
  moon = loadImage('moon.png');
  cloud = loadImage('IMG_0363.PNG');
  rain = loadImage('IMG_0365.PNG');
  snow = loadImage('snow.png');
  imgs[0] = loadImage('IMG_0359.PNG'); //fertilizer
  imgs[1] = loadImage('IMG_0360.PNG'); //water pot
  imgs[2] = loadImage('IMG_0361.PNG'); //scissors
}

function setup() {

  canvases[0] = createGraphics(600, 450);
  canvases[1] = createGraphics(600, 450);
  canvases[2] = createGraphics(600, 450);
  canvases[3] = createGraphics(600*0.95, 450*0.95); //resizing a bit to look better
  canvases[4] = createGraphics(600*1.05, 450*1.05);

  canvases[0].image(flower1, 0, 0, 600, 450);
  canvases[1].image(flower2, 0, 0, 600, 450);
  canvases[2].image(flower3, 0, 0, 600, 450);
  canvases[3].image(flower4, 0, 0, 600*0.95, 450*0.95);
  canvases[4].image(flower5, 0, 0, 600*1.05, 450*1.05);

  createCanvas(1200, 900);

  //positions of three interactions
  positions = [{x: 900, y: 200}, {x: 800, y: 400}, {x: 900, y: 600}];

  apiRequest();

  //input the photocell value
  serial = new p5.SerialPort();
  serial.onList(gotList);
  serial.list();
  serial.openPort(portName);
  serial.onData(gotData);
}

function draw() {
  background(255);
 
  // change background and title when switching day and night
  if (isDay === 0) {
    image(bgNight, 0, 0, width, height);
    image(titleNight, 300, -100, 600, 450);
  } else {
    image(bg, 0, 0, width, height);
    image(title, 300, -100, 600, 450);
  }

  // link to weather api to align with current weather
  // (reference for myself) link to check weather code book: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
  if (typeof weatherCode !== 'undefined') {
    // if (isDay === 0) {
    //   weatherImg = moon;
    //   image(weatherImg, weatherPos.sun.x, weatherPos.sun.y, 360, 270);
    // } else {
    if (weatherCode >=0 && weatherCode <=3) {
      weatherImg = isDay === 0 ? moon : sun; // if isDay === 0, use moon image; if isDay === 1, use sun image.
      image(weatherImg, weatherPos.sun.x, weatherPos.sun.y, 360, 270);
    } else if ((weatherCode >=4 && weatherCode <=19) || (weatherCode >=40 && weatherCode <=49)) {
      weatherImg = cloud;
      image(weatherImg, weatherPos.cloud.x, weatherPos.cloud.y,360, 270);
    } else if ((weatherCode >=20 && weatherCode <=29) || (weatherCode >=60 && weatherCode <=69) || (weatherCode >=80 && weatherCode <=99)) {
      weatherImg = rain;
      image(weatherImg, weatherPos.rain.x, weatherPos.rain.y, 360, 270);
    } else if ((weatherCode >=30 && weatherCode <=39) || (weatherCode >=70 && weatherCode <=79)) {
      weatherImg = snow;
      image(weatherImg, weatherPos.snow.x, weatherPos.snow.y, 360, 270);
    }
  }

  image(canvases[currentCanvas], 300, 375);

  // ferti, pot, scissors drop zone
  noStroke();
  noFill();
  rect(dropZone.x, dropZone.y, dropZone.width, dropZone.height);

  for (let i = 0; i < imgs.length; i++) {
    // rotation of the imgs when press is released
    push();
    translate(positions[i].x, positions[i].y); 
    if (animationState[i] === 1) {
      rotate((animationFrame[i] / 80) * -PI / 3);
    }
    image(imgs[i], 0, 0, 300, 225);
    pop();

    // update positions and switch animations
    // Switch statement code reference: Xin Xin https://www.youtube.com/watch?v=cxppa6dNzxE
    switch(animationState[i]) {
      case 1:
      case 2:
        // pause before returning to its original position
        animationFrame[i]++;
        break;
      case 3:
        // Return to place
        let targetX = (i === 0) ? 900 : ((i === 1) ? 800 : 900);
        let targetY = 200 + i * 200;
        positions[i].x += (targetX - positions[i].x) / 10;
        positions[i].y += (targetY - positions[i].y) / 10;

        // check position
        // Code reference: morejepg https://www.youtube.com/watch?v=mEKz-uVq-H4
        if (dist(targetX, targetY, positions[i].x, positions[i].y) < 1) {
          animationState[i] = 0; 
          positions[i].x = targetX;
          positions[i].y = targetY;
        }
        break;
    }

    if (animationFrame[i] > 30) { 
      animationFrame[i] = 0;
      if (animationState[i] === 1) {
        animationState[i] = 2;
      } else if (animationState[i] === 2) {
        animationState[i] = 3;
      }
    }
  }
  redraw();
}

// retreiving data for today's weather code
// weather code used in the draw function
async function apiRequest() {
  let request =  await fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=is_day,weather_code&timezone=America%2FNew_York&forecast_days=1");
  console.log(request);

  let data = await request.json();
  console.log(data);

  let currentData = data.current;
  console.log(currentData);

  weatherCode = currentData.weather_code;
  console.log(weatherCode);

  isDay = currentData.is_day;
  console.log(isDay);
}

// define the chosen area of the object, and make it follow the mouse position when dragged
function mousePressed() {
  for (let i = imgs.length - 1; i >= 0; i--) {
    if (mouseX > positions[i].x && mouseX < positions[i].x + imgs[i].width &&
        mouseY > positions[i].y && mouseY < positions[i].y + imgs[i].height) {
      dragging[i] = true;
      dragOffset[i].x = positions[i].x - mouseX;
      dragOffset[i].y = positions[i].y - mouseY;
      break; // break for selecting different image
    }
  }
}

// make imgs drag with the mouse
function mouseDragged() {
  for (let i = imgs.length - 1; i >= 0; i--) {
    if (dragging[i]) {
      positions[i].x = mouseX + dragOffset[i].x;
      positions[i].y = mouseY + dragOffset[i].y;
      break; // for only drag on the individual image
    }
  }
}

// return to its position when mouse released
function mouseReleased() {
  for (let i = imgs.length - 1; i >= 0; i--) {
    if (dragging[i]) {
      dragging[i] = false;
      if (mouseX > dropZone.x && mouseX < dropZone.x + dropZone.width &&
          mouseY > dropZone.y && mouseY < dropZone.y + dropZone.height) {
        animationState[i] = 1; // Start the rotation animation

        //count the number of interactions, and change the image when the number reach the set goal.
        //if photocellValue is less than 500, the drag count is 0.5 instead of 1. (flower grows slower when there is not enough sunshine.)
        let dragValue = photocellValue < 500 ? 0.5 : 1;
        dragCount += dragValue;
        console.log("Drag count: " + dragCount);
        console.log("Drag count: " + dragCount);

        //Right now set to 2 for display. Standard number: 100 for long term play and interaction.
        if (dragCount >= 2) {
          dragCount = 0; //reset the counting
          currentCanvas = (currentCanvas + 1) % canvases.length; 
          console.log("Canvas now: " + currentCanvas); 

          // determine the angle of servo motor, send back to arduino.
          let angle;
          switch (currentCanvas) {
            case 0: angle = 30; break;
            case 1: angle = 47.5; break;
            case 2: angle = 65; break;
            case 3: angle = 82.5; break;
            case 4: angle = 100; break;
          }
          serial.write(angle+"\n");;
        }
      }

      // Reposition the pics
      positions[i].x = (i === 0) ? 900 : ((i === 1) ? 800 : 900);
      positions[i].y = 200 + i * 200;
      animationState[i] = 0; 
    }
  }
}

function gotList(ports) {
  for (var a = 0; a < ports.length; a++) {
    console.log(ports[a])
  }
}

function gotData() {
  photocellValue = serial.readLine();
  console.log("Photocell Value: " + photocellValue);
}