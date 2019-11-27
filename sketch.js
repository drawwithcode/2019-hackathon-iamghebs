/*

A dynamic background is generated through Perling noise and flowfield.
A title in the center of the screen is scaled based on the volume
of the audio file activated by clicking wherever on the screen

*/

var inc = 0.1; //general increment

var scl = 10; //var to define grid's scale

var cols, rows;

var zoff = 0; //initializing Zoffset to 0

var particles = []; //generating an array to store each particle

var flowfield = []; //generating an array to store each vector of the flowfield

var volume, fontScale; //variable to store volume's level

function preload() {
  //loading audio file
  mySong = loadSound("./assets/TG1_new.mp3");
  //loading fontfile
  adieu = loadFont('assets/Adieu-Bold.otf');
}

function setup() {
  //creating a fullscreen canvas
  let cnv = createCanvas(windowWidth, windowHeight);
  //calling togglePlay function on click wherever on the page
  cnv.mouseClicked(togglePlay);

  //setting audio FTT
  fft = new p5.FFT();
  mySong.amp(0.2);
  analyzer = new p5.Amplitude();
  analyzer.setInput(mySong);

  //defining a grid for the flowfield
  cols = Math.floor(width / scl);
  rows = Math.floor(height / scl);

  flowfield = new Array(cols * rows);

  //generating a particle in each cell of the grid
  for (var i = 0; i < 500; i++) {
    particles[i] = new Particle();
  }

  //general background blue
  background('rgb(18, 26, 140)');
}

function draw() {
  //getting volume level
  volume = analyzer.getLevel();

  fontScale = map(volume, 0, 0.2, 0, 720);

  //updating a semitransparent background for a trail effect
  background('rgba(18, 26, 140, 0.05)');

  //generating the tile
  push();
  stroke(255);
  strokeWeight(1);
  fill(255);
  textSize(120+fontScale);
  textFont(adieu);
  textAlign(CENTER, CENTER);
  var t = "TG1"; //content of the string
  text(t, width / 2, height / 2);
  pop();

  //initializing Yoffset eachtime at the beginning of the row
  var yoff = 0;
  //through 2 cycles passing each cell of the grid
  for (var y = 0; y < rows; y++) {
    //initializing Xoffset eachtime at the beginning of the column
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      //getting the sequencial index of the cells
      var index = x + y * cols;

      //defining a random angle based on the Perlin noise
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;

      //generating the vector in thedirection of the angle
      var v = p5.Vector.fromAngle(angle);
      v.setMag(1); //setting the magnitude to 1 to limit speed
      //pushing the vector into the array
      flowfield[index] = v;
      xoff += inc; //incrementing the offset
    }
    yoff += inc; //incrementing the offset
  }
  zoff += 0.003; //incrementing the offset

  // var volume = 0;
  // volume = analyzer.getLevel();
  // volume = map(volume,0,1,0,height);

  for (var i = 0; i < particles.length; i++) {
    //updating the particle to follow the flow of the vectors generated above
    particles[i].follow(flowfield);
    //updating particle position
    particles[i].update();
    //create seamless movement when eventually reaching the edges
    particles[i].edges();
    //show the updated particle
    particles[i].show();
  }
}

function windowResized() {
  //resizing the canvas when the window is resized
  resizeCanvas(windowWidth, windowWidth);
}

//toggle function to activate sound
togglePlay = function() {
  if (mySong.isPlaying()) {
    mySong.pause();
  } else {
    //looping sound when it ends
    mySong.loop();
    print("BARRIO");
  }
}

//defining a Particle object to generate the dynamic background

function Particle() {
  //setting physics through position, velocity and acceleration
  this.pos = createVector(random(width), random(height));
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.maxspeed = 4; //setting a maximus speed for a more enjoable visual effect

  //storing previous position by coping the pos vector
  this.prevPos = this.pos.copy();

  //method to update particle's physics. Position relies on speed wich is defined by acceleration generated through a force given by the flowfield's vectors
  this.update = function() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0); //getting acceleration back to 0
  }

  this.follow = function(vectors) {
    //finding in which cell the particle is
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * cols;
    //applying the vector
    var force = vectors[index];
    this.applyForce(force);
  }
  this.applyForce = function(force) {
    this.acc.add(force);
  }

  //method to show the particle
  this.show = function() {
    stroke(255);
    strokeWeight(1);
    //tracing line between the previous and the updated position to obtain a fluid effect
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  //updating previous position coordinates
  this.updatePrev = function() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  //method to define seamless movements
  this.edges = function() {
    //if the particle reaches the right border it's sent to the left one
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    //if the particle reaches the left border it's sent to the right one
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    //if the particle reaches the bottom border it's sent to the top one
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    //if the particle reaches the top border it's sent to the bottom one
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }
}
