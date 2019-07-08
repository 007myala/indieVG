/*
 * Exploring PoseNet and the p5.play.js library
 */
var canvas;
var walls;
var killers;
var coins;
let video;
var player
var floor;
var pitchW = 640;
var pitchH = 480;
var pX = 0;
var pY = 380; // Value to keep the paddle constant at y position
var ball;
var gameIsOver = false;
var score = 0
var pSize = 100;
var hits = 0;

function preload(){}

function setup(){
  canvas = createCanvas(pitchW, pitchH);
	canvas.style('display','block');
  video = createCapture(VIDEO);
  video.hide();

  // Create and initialize a pose input element
  input = document.createElement('acc-pose-input');
  input.initialize();

  // Set its dimensions to match the dimensions of the canvas
  input.contentElement = canvas.elt;

  // Pick a body part to track
  input.part = 'leftWrist';

  // Create the walls
  walls = new Group();
  var wT = createSprite(0, 10, pitchW*2, 20);
  wT.shapeColor = color(165, 42, 42);
  walls.add(wT);
  var wL = createSprite(10, 0, 20, pitchH*2);
  wL.shapeColor = color(165, 42, 42);
  walls.add(wL);
  var wR = createSprite(pitchW-10, 0, 20, pitchH*2);
  wR.shapeColor = color(165, 42, 42);
  walls.add(wR);

  // Create the floor
  floor = createSprite(0, pitchH-10, pitchW*2, 20);
  floor.shapeColor = color(165, 42, 42);

  // Create the paddle
  player = createSprite(pitchW/2, pY, 100, 10);
  player.shapeColor = color(0, 0, 255);

  // Create the ball
  ball = createSprite(random(30, pitchW), 30, 40, 40);
  ball.shapeColor = color(255);
  ball.velocity.y = 2;

  // Create the killers group
  killers = new Group();

  // Create the coins group
  coins = new Group();
}

function draw(){
	background(0);
  // image(video, 0, 0);
  // Make sure the pose input component has been loaded
  if(input.isReady){
    // Draw the camera input to the canvas
    // canvas.elt.getContext('2d').drawImage(input.canvas, 0, 0,
    // input.canvas.width, input.canvas.height);

    // Get the position of the pointer
    let x = input.targetPosition[0];
    let y = input.targetPosition[1];

    // Update the paddle y position so paddle follows player's wrist
    pX = x;
  }
  player.velocity.x = (pX - player.position.x)*0.1;
  // player.velocity.y = (mouseY - player.position.y)*0.1;
  player.position.y = 420;
  player.collide(walls);

  ball.collide(walls, bounceDown);
  ball.collide(player, bounceUp);
  ball.collide(floor, gameOver);

  killers.collide(player, killPlayer);

  coins.collide(player, getCoin);
  coins.collide(floor, removeCoin);

  drawSprites();

  fill(255);
  textSize(25);
  textAlign(CENTER, CENTER);
  text("Score : " + score, width-100, 50);
  textSize(72);
  if(gameIsOver){
    text("Game Over!", width/2, height/2);
  }
}

function getCoin(coin){
  score += 1;
  coin.remove();
}

function removeCoin(coin){
  coin.remove();
}

function killPlayer(killer){
  killer.remove();
  if(hits < 10){
    hits++;
    player.width = pSize - (10 * hits);
  } else {
    hits = 10;
  }
}

function gameOver(ball, floor){
  gameIsOver = true;
  ball.remove();
}

function bounceUp(ball, player){
  ball.shapeColor = color(0, 255, 0);
  player.shapeColor = color(255, 0, 0);
  ball.velocity.y *= -1;

  // Launch killers
  var kills = random(1,7); // random number of killers to make
  for(var i = 0; i <= kills; i++){
    var spr = createSprite(random(20, width-20), random(20, 380), 10, 10);
    spr.shapeColor = color(255);
    spr.velocity.y = 1;
    killers.add(spr);
  }

  // Generate coins
  var spr2 = createSprite(random(20, width-20), random(20, 380), 10, 10);
  spr2.shapeColor = color(255, 255, 0);
  spr2.velocity.y = 2;
  coins.add(spr2);
}

function bounceDown(ball, wall){
  ball.velocity.y *= -1;
  ball.shapeColor = color(255);
  ball.position.x = random(0, pitchW - 40);
}

function windowResized(){
    // resizeCanvas(windowWidth,windowHeight);
}
