//noc-flowerbloom

let petals = [];
let nbLayers = 7;

let i;
let j;

let FromArduino = false;

let serial;
let latestData = "waiting for data";

let colors;

let counter = 0;

function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

function gotData() {
  let currentString = serial.readLine();
  trim(currentString);
  if (!currentString) return;
  console.log(currentString);
  latestData = currentString;
}

// let FuzzyBubbles;

// function preload() {
//   FuzzyBubbles = loadFont('assets/FuzzyBubbles-Regular.ttf');
// }

function setup() {
  serial = new p5.SerialPort();
  // blendMode(MULTIPLY);
  serial.list();
  serial.open("/dev/tty.usbmodem143101");

  serial.on("connected", serverConnected);

  serial.on("list", gotList);

  serial.on("data", gotData);

  serial.on("error", gotError);

  serial.on("open", gotOpen);

  serial.on("close", gotClose);

  createCanvas(windowWidth, windowHeight);

  colors = [
    color(255, 178, 206, 100),
    color(255, 124, 172, 100),
    color(255, 178, 182, 100),
    color(255, 124, 131, 100),
    color(255, 173, 0, 100),
    color(255, 176, 103, 255),
    color(2255, 131, 0, 255),
  ];

  background(0);
  for (i = 0; i < nbLayers; i++) {
    for (j = 0; j < 6; j++) {
      //constructor(x, y, num, direction, range, strength)
      let op = new OnePetal(
        width / 2,
        height / 2,
        30,
        radians(59) * j,
        1,
        i / 2 + 1,
        colors[nbLayers - i - 1]
      );
      petals.push(op);
    }
  }
  for (let p of petals) {
    p.setthemup();
  }

  // petals[i * j - 1].canBig = true;

  FromArduino = false;
}

function draw() {
  background(0);

  // ------ When having Arduino, umcomment these to interact with Arduino Light Sensor --------

  // if (latestData > 50) {
  //   // fill(255, 255, 255);
  //   // textSize(100);
  //   // textFont(FuzzyBubbles);
  //   // text("LIGHT UP YOUR FLOWER", width/2 - 600,height/2);
  //   FromArduino = false;
  //   petals[i * j - 1].canBig = false;
  // } else {
  //   FromArduino = true;
  //   petals[i * j - 1].canBig = true;
  // }

  makeCanBig(petals.length);

  for (let p of petals) {
    p.checkMovement();
    p.checkTime();
    p.display();
  }

  //When having no Arduino in hand, use this to test

  if (mouseIsPressed) {
    FromArduino = true;
    petals[i * j - 1].canBig = true;
  } else {
    petals[i * j - 1].canBig = false;
    FromArduino = false;
  }

  // console.log("canBIG", petals[i * j - 5].canBig);
  // console.log("reach", petals[i * j - 5].reach);
  console.log(latestData);
}

function makeCanBig(m) {
  if (m - 2 >= 0) {
    if (petals[m - 1].reach && FromArduino) {
      petals[m - 2].canBig = true;
      // for (let p of petals[m - 2].points) {
      //   p.startBig = true;
      // }
    } else if (!FromArduino && !petals[m - 1].canBig) {
      petals[m - 2].canBig = false;
      // for (let p of petals[m - 2].points) {
      //   p.startBig = false;
      // }
    }
    return makeCanBig(m - 1);
  }
}

class PetalPoint {
  constructor(x, y, angle, mag) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();

    this.angle = angle;
    this.mag = mag;
    // this.getDirection(angle, mag);
    this.damping = random(0.984, 0.987); // ***

    this.canNoise = false;

    this.canGoBack = false;

    this.canGrow = true;

    this.startBig = false;
  }
  getDirection(angle, mag) {
    let force = p5.Vector.fromAngle(angle);
    force.mult(mag);
    this.applyForce(force);
  }
  applyForce(f) {
    this.acc.add(f);
  }
  growUp() {
    if (this.canGrow && this.startBig) {
      this.canGrow = false;
      this.getDirection(this.angle, this.mag);
    } else if (!this.startBig) {
      this.canGrow = true;
      this.goingBack();
    }

    this.move();
    this.slowDown();
  }

  goingBack() {
    push();
    var target = createVector(width / 2, height / 2);

    let backForce = target.sub(this.pos);
    backForce.limit(0.1);
    // this.vel = p5.Vector.fromAngle(this.pos.sub(target), 0.0001);
    if (dist(target, this.pos) < 10) {
      this.vel = createVector(0, 0);
      this.pos = createVector(width / 2, height / 2);
    } else {
      this.applyForce(backForce);
    }
    pop();
  }

  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  slowDown() {
    this.vel.mult(this.damping);
  }
  show() {
    push();
    stroke(255, 0, 0);
    strokeWeight(5);
    point(this.pos.x, this.pos.y);
    pop();
  }
}

class OnePetal {
  constructor(x, y, num, direction, range, strength, colorChosen) {
    this.x = x;
    this.y = y;
    this.num = num;
    this.direction = direction;
    this.range = range;
    this.strength = strength;
    this.points = [];

    this.canBig = false;

    this.reach = false;

    this.recordFrame = false;
    this.pFrame = 0;
    this.frametoMove = 20;

    this.reachNoise = false;
    this.frametoNoise = 150;

    this.index = 0;

    this.colorChosen = colorChosen;
  }

  checkTime() {
    if (FromArduino && this.canBig && !this.recordFrame) {
      this.recordFrame = true;
      this.pFrame = frameCount;
    }

    if (
      FromArduino &&
      this.canBig &&
      frameCount - this.pFrame > this.frametoMove
    ) {
      this.reach = true;
    }
  }

  checkMovement() {
    if (this.canBig) {
      for (let p of this.points) {
        p.startBig = true;
      }
    } else {
      for (let p of this.points) {
        p.startBig = false;
      }
      this.reach = false;
      this.recordFrame = false;
    }
  }

  setthemup() {
    let i;
    for (i = 0; i < this.num; i++) {
      let angle = map(
        i,
        0,
        this.num,
        this.direction - this.range,
        this.direction + this.range
      );
      let sinValue = sin(map(i, 0, this.num, 0, PI));
      let magnitude = map(sinValue, 0, 1, 0, this.strength);
      this.points.push(new PetalPoint(this.x, this.y, angle, magnitude));
      this.angle = angle;
      this.mag = magnitude;
    }
  }

  display() {
    push();

    noStroke();
    // fill(220, 204, 100, 100);
    // fill(255, 80, 145, 100);
    fill(this.colorChosen);
    beginShape();

    for (let p of this.points) {
      // this.points[this.index].growUp();
      p.growUp();
      curveVertex(p.pos.x, p.pos.y);
    }

    endShape(CLOSE);
    pop();
  }
}

/* global p5 ml5 alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult */
