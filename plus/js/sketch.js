var canvas;
var pStart;
var paddle, wallTop, wallBottom, wallLeft, wallRight;
var WALL_THICKNESS = 30;
var switchInterval = 5000;
var timeOfLastSwitch = 0;
var switchIntervalA = 2000;
var timeOfLastSwitchA = 0;
var switchIntervalB = 7000;
var timeOfLastSwitchB = 0;
var score = 50;
var viralload = 0;
var lives = 1;
var bank = 0;
var safeSex = 0;
var pillCount = 0;
var jumps = 3;
var isNegative = false;
var isPositive = false;
var isUndetectable = false;
var status = "";
var noseScore = 0;

// Sprite Groups
var dNeedles; // dirty needles
var cNeedles; // clean needles
var cash; // money
var prophylaxis; // condoms, dental dams, PEP, other prophylaxis...
var loveNeg; // negative
var lovePoz; // positive
var loveUnd; // undetectable
var myths; // hugs, kisses, toilets...
var vct;  // the VCT tests
var bugs; // the virus
var meds;

// Sprite icons
var dNeedle, cNeedle, dollar, lNeg, lPoz, lUnd, condom, astro, tested, virus, pill;

// Sounds
var right;
var wrong;

// PoseNet
let video;
let poseNet;
var wristR = 0;
var nose = 0;
var noseY = 0;

// Controls
var isStarted = false;
var isGameOver = false;
var haveJumps = true;

function preload(){
  // Load Fonts
  pStart = loadFont('../../fonts/Press_Start_2P/PressStart2P-Regular.ttf');

  // Load Icons
  dNeedle = loadImage('images/dNeedle.png');
  cNeedle = loadImage('images/cNeedle.png');
  dollar = loadImage('images/dollar.png');
  lNeg = loadImage('images/loveNeg.png');
  lPoz = loadImage('images/lovePoz.png');
  lUnd = loadImage('images/loveUnd.png');
  condom = loadImage('images/condom.png');
  astro = loadImage('images/astro.png');
  tested = loadImage('images/getTested.png');
  virus = loadImage('images/virus.png');
  pill = loadImage('images/pill.png');

  // Load Sounds
  right = loadSound('sounds/right.mp4');
  wrong = loadSound('sounds/wrong.mp4');
}

function setup(){
  canvas = createCanvas(800,700);
  canvas.parent('game_area');
  timeStarted = millis();

  paddle = createSprite(width/2, height-50);
  paddle.immovable = true;
  paddle.shapeColor = color(255);
  paddle.addImage(astro);
  paddle.size = 1;

  wallTop = createSprite(width/2, -WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
  wallTop.immovable = true;

  wallBottom = createSprite(width/2, height+WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
  wallBottom.immovable = true;

  wallLeft = createSprite(-WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
  wallLeft.immovable = true;

  wallRight = createSprite(width+WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
  wallRight.immovable = true;

  // create the Sprite Group
  dNeedles = new Group();
  cNeedles = new Group();
  cash = new Group();
  protection = new Group();
  loveNeg = new Group();
  loveUnd = new Group();
  lovePoz = new Group();
  vct = new Group();
  bugs = new Group();
  meds = new Group();

  // PoseNet
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
}

function gotPoses(poses){
  if(poses.length > 0){
    let wX = poses[0].pose.keypoints[10].position.x; //rightWrist
    let nX = poses[0].pose.keypoints[0].position.x; //nose
    noseScore = poses[0].pose.keypoints[0].score;
    wristR = lerp(wristR, wX, 0.5);
    nose = lerp(nose, nX, 0.5);
  }
}

function modelReady(){
  console.log(ml5);
  console.log('model ready');
}

function draw(){
  background(46, 49, 49);
  // Check player status
  if(score < 0){
    isGameOver = true;
  } else {
    isGameOver = false;
  }
  fill(255);
  textFont(pStart);
  textSize(10);
  text("SCORE",25,30);
  text("BANK : " + bank,25,70);
  text("PROTECTION : " + safeSex, 25, 90);
  fill(255,0,0);
  text(score,25,50);
  fill(255);
  text("LIVES: " + lives,width-100,30);

  if(isNegative){
    status = "-";
  } else if(isPositive){
    status = "+";
  } else if(isUndetectable){
    status = "U";
  } else {
    status = "?";
  }
  fill(255,244,0);
  text("HIV: " + status, width-100, 50);
  // image(video, 0, 0, width, height);
  var mX = 800;
  if(wristR < 0){
    wristR = 0;
    nose = 0;
  }
  if(wristR > 800){
    wristR = 800;
    nose = 800;
  }
  var newPos = mX - wristR;
  var newPosL = mX - nose;
  paddle.position.x = constrain(newPos, paddle.width/2, width-paddle.width/2);

  // check for jumps
  // if(noseScore <= 0.5){
  //   // Not seeing nose then jump
  //   if(haveJumps){
  //     jumpScore = jumpScore - 1;
  //   } else {
  //   }
  // }

  if(!isStarted){
    // image(video, 0, 0, width, height);
    // fill(0);
    // textSize(32);
    // textAlign(CENTER);
    // text(noseScore, 400, height/2);
  } else {

    if(isGameOver){
      lives = 0;
      fill(255);
      textSize(32);
      textAlign(CENTER);
      text("GAME OVER!", 400, height/2);
    } else {
      if(millis() - timeOfLastSwitchA > switchIntervalA){
        // Generate money
        launchCash();
        // Generate bugs
        launchBugs();
        if(isPositive){
          if(isUndetectable){

          } else {
            // Generate pills
            launchPills();
          }
        }
        // Remember the new timestamp
        timeOfLastSwitchA = millis();
      }

      // if(millis() - timeOfLastSwitchB > switchIntervalB){
      //   // Generate dirty needles
      //   launchDNeedles();
      //   // Generate clean needles
      //   launchCNeedles();
      //   // Generate protection
      //   launchProphylaxis();
      //   // Generate love
      //   launchLoves();
      //   // Remember the new timestamp
      //   timeOfLastSwitchB = millis();
      // }

      if(millis() - timeOfLastSwitch > switchInterval){
        // Generate dirty needles
        launchDNeedles();
        // Generate clean needles
        launchCNeedles();
        // Generate protection
        launchProphylaxis();
        // Generate love
        launchLoves();
        // Generate tests
        launchTests();
        // Remember the new timestamp
        timeOfLastSwitch = millis();
      }

      dNeedles.collide(paddle, infectPlayer);
      cNeedles.collide(paddle, injectPlayer);
      cash.collide(paddle, saveMoney);
      protection.collide(paddle, protectPlayer);
      loveNeg.collide(paddle, loveNegative);
      lovePoz.collide(paddle, lovePositive);
      loveUnd.collide(paddle, loveUndetectable);
      vct.collide(paddle, getTested);
      bugs.collide(paddle, changeStatus);
      meds.collide(paddle, lowerViralCount);

      // Floor collisions
      dNeedles.collide(wallBottom, removeSprite);
      cNeedles.collide(wallBottom, removeSprite);
      cash.collide(wallBottom, removeSprite);
      protection.collide(wallBottom, removeSprite);
      loveNeg.collide(wallBottom, removeSprite);
      lovePoz.collide(wallBottom, removeSprite);
      loveUnd.collide(wallBottom, removeSprite);
      vct.collide(wallBottom, removeSprite);
      bugs.collide(wallBottom, removeSprite);
      meds.collide(wallBottom, removeSprite);
    }
  }
  drawSprites();
}

function removeSprite(sprite){
  sprite.remove();
}

function playRight(){
  if(right.isPlaying()){
    // Already playing do nothing
  } else {
    // Not playing so start isPlaying
    right.play();
  }
}

function playWrong(){
  if(wrong.isPlaying()){
    // Already playing do nothing
  } else {
    // Not playing so start  playing
    wrong.play();
  }
}

function keyPressed(){
  isStarted = true;
}

function launchDNeedles(){
  var dN = random(1,2);
  for(var i = 0; i <= dN; i++){
    var spr = createSprite(random(random(0, width), random(0,width)), random(0, 200));
    spr.shapeColor = color(139,69,19);
    spr.velocity.y = 1;
    spr.addImage(dNeedle);
    spr.scale = 0.25;
    dNeedles.add(spr);
  }
}

function launchCNeedles(){
  var cN = random(0,1);
  for(var i=0; i <= cN; i++){
    var spr = createSprite(random(random(50,500),random(0,width)), random(0, 50));
    spr.shapeColor = color(0,191,255);
    spr.velocity.y = 1;
    spr.addImage(cNeedle);
    spr.scale = 0.25;
    cNeedles.add(spr);
  }
}

function launchCash(){
  var c = random(0,1);
  for(var i=0; i <= c; i++){
    var spr = createSprite(random(20, width-20), random(0,50));
    spr.shapeColor = color(34,139,34);
    spr.velocity.y = 1;
    spr.addImage(dollar);
    spr.scale = 0.20;
    cash.add(spr);
  }
}

function launchProphylaxis(){
  var p = random(0,1);
  for(var i=0; i <=p; i++){
    var spr = createSprite(random(20, width-20), random(0,50));
    spr.shapeColor = color(135,206,250);
    spr.velocity.y = 1;
    spr.addImage(condom);
    spr.scale = 0.10;
    protection.add(spr);
  }
}

function launchLoves(){
  var n = random(0,1);
  for(var i=0; i<=n; i++){
    var spr = createSprite(random(20, width-20), random(0,50));
    spr.velocity.y = 1;
    spr.addImage(lNeg);
    spr.scale = 0.20;
    loveNeg.add(spr);
  }

  var p = random(0,1);
  for(var i=0; i<=p; i++){
    var spr = createSprite(random(20, width-20), random(0,50));
    spr.velocity.y = 1;
    spr.addImage(lPoz);
    spr.scale = 0.20;
    lovePoz.add(spr);
  }

  var u = random(0,1);
  for(var i=0; i<=u; i++){
    var spr = createSprite(random(20, width-20), random(0,50));
    spr.velocity.y = 1;
    spr.addImage(lUnd);
    spr.scale = 0.20;
    loveUnd.add(spr);
  }
}

function launchTests(){
  var t = random(0,1);
  for(var i=0; i<=t; i++){
    var spr = createSprite(random(0, width), random(0,500));
    spr.velocity.y = 1;
    spr.addImage(tested);
    spr.scale = 0.20;
    vct.add(spr);
  }
}

function launchBugs(){
  var b = random(0,1);
  for(var i =0; i<=b; i++){
    var lower = mouseX - 150;
    if(lower < 0){
      lower = 0;
    }
    var upper = mouseX + 150;
    if(upper > 800){
      upper = 800;
    }
    var spr = createSprite(random(lower, upper), random(0,500));
    spr.velocity.y = 1;
    spr.addImage(virus);
    spr.scale = 0.10;
    bugs.add(spr);
  }
}

function launchPills(){
  var p = random(0,1);
  for(var i = 0; i<=p; i++){
    var spr = createSprite(random(0,width), random(0,400));
    spr.velocity.y = 2;
    spr.addImage(pill);
    spr.scale = 0.1;
    meds.add(spr);
  }
}

function infectPlayer(dNeedle){
  dNeedle.remove();
  if(isNegative){
    // Lose points
    score = score - 10;
  } else if(isPositive){
    score = score - 20;
  } else {
    score = score - 5;
  }
  playWrong();
}

function injectPlayer(cNeedle){
  cNeedle.remove();
  // Risky behaviour
  score = score - 5;
  playWrong();
}

function saveMoney(dollar){
  dollar.remove();
  // Add to bank - Make BANK
  bank = bank + 1;
  // Score a point
  score = score + 10;
  playRight();
}

function protectPlayer(protect){
  protect.remove();
  // Add to safe sex
  safeSex = safeSex + 1;
  // Score some points
  score = score + 5;
  playRight();
}

function loveNegative(neg){
  neg.remove();
  // reduce protection
  if(safeSex <= 0){
    safeSex = 0;
    score = score - 15;
  } else {
    safeSex = safeSex - 1;
    score = score + 10;
  }
}

function lovePositive(poz){
  poz.remove();
  // reduce protection
  if(safeSex <= 0){
    safeSex = 0;
    score = score - 15;
  } else {
    safeSex = safeSex - 1;
    score = score + 10;
  }
}

function loveUndetectable(und){
  und.remove();
  // reduce protection
  if(safeSex <= 0){
    safeSex = 0;
    score = score - 15;
  } else {
    safeSex = safeSex - 1;
    score = score + 10;
  }
}

function getTested(test){
  test.remove();
  // Reward player
  score = score + 20;
  playRight();
}

function changeStatus(bug){
  bug.remove();
  // Change the status
  if(isNegative){
    isPositive = true;
    isNegative = false;
    isUndetectable = false;
  } else if(isPositive){
    isNegative = false;
    isUndetectable = false;
    isPositive = true; // Stays positive
  } else {
    isPositive = true;
    isNegative = false;
  }

  score = score - 50;
}

function lowerViralCount(mpill){
  mpill.remove();
  // Check pill count
  if(pillCount < 10){
    // Do pill count
    pillCount = pillCount + 1;
  } else {
    pillCount = 0;
    isUndetectable = true;
  }
  score = score + 15;
}
