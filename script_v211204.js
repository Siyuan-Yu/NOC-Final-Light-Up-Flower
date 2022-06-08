//noc-flowerbloom

let fls = [];
let i = 0;
let nbLayers = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (i = 0; i < nbLayers; i++) {
    fls[i] = new FlowerLayer(
      width / 2,
      height / 2,
      (i + 2) * 20,
      color(255 - i * 10, i * 10, 200, 240),
      (i + 2) * 3,
      (i + 2) * 9,
      50 - i
    );
  }
  fls[i - 1].canBig = true;
}

function draw() {
  background(0);
  for (let x = fls.length; x > 0; x--) {
    fls[x - 1].update();
    fls[x - 1].display();
  }
  makeCanBig(fls.length);
}

function makeCanBig(m) {
  if (m - 2 >= 0) {
    if (fls[m - 1].reach) {
      fls[m - 2].canBig = true;
    }
    return makeCanBig(m - 1);
  }
}

class FlowerLayer {
  constructor(x, y, lifespan, layercolor, xrad, yrad, nextStartTime) {
    this.x = x;
    this.y = y;
    this.lifespan = lifespan;
    this.layercolor = layercolor;
    this.xrad = xrad;
    this.yrad = yrad;
    this.nextStartTime = nextStartTime;
    this.yOffset = 20;
    this.reach = false;
    this.recordFrame = false;
    this.canBig = false;
    this.pFrame = 0;
  }
  update() {
    if (this.canBig && !this.recordFrame) {
      this.recordFrame = true;
      this.pFrame = frameCount;
    }
    if (frameCount - this.pFrame < this.lifespan && this.canBig) {
      this.yOffset += 0.2;
      this.xrad += 0.3;
      this.yrad += 0.9;
    } else if (frameCount - this.pFrame >= this.lifespan && this.canBig) {
      if (frameCount % 5 == 0) {
        this.yOffset += random(-1, 1);
        this.xrad += random(-1, 1);
        this.yrad += random(-1, 1);
      }
    }

    if (frameCount - this.pFrame > this.nextStartTime && this.canBig) {
      this.reach = true;
    }
  }
  display() {
    push();
    noStroke();
    fill(this.layercolor);
    translate(this.x, this.y);
    for (let p5 = 0; p5 < 10; p5++) {
      rotate(PI / 5);
      ellipse(0, this.yOffset, this.xrad, this.yrad);
    }
    pop();
  }
}

/* global p5 ml5 alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult */
