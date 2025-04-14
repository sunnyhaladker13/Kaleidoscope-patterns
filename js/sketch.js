/**
 * Interactive Kaleidoscope
 * 
 * Features:
 * - Generates symmetrical patterns based on mouse/touch input
 * - Uses triangle symmetry segments radiating from center
 * - Mirrors movements across multiple axes
 * - Changes colors gradually over time
 * - Responsive canvas sizing
 * - Touch support for mobile devices
 * - HSB color mode for smooth transitions
 * - Velocity-based stroke weight
 * - Rotational symmetry with 12 segments
 * - Stores previous positions for trailing effect
 */

let positions = [];
let hue = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let segmentCount = 12; // Number of symmetrical segments

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  angleMode(DEGREES);
  strokeWeight(5);
  background(0);
}

function draw() {
  // Create a semi-transparent background for fading effect
  fill(0, 0, 0, 0.1);
  rect(0, 0, width, height);
  
  // Update color
  hue = (hue + 0.5) % 360;
  
  // Handle both mouse and touch input
  let inputX, inputY;
  
  if (touches.length > 0) {
    inputX = touches[0].x;
    inputY = touches[0].y;
  } else {
    inputX = mouseX;
    inputY = mouseY;
  }

  // Only add new positions if the mouse/touch is moving
  if (mouseIsPressed || touches.length > 0) {
    // Calculate velocity for stroke weight
    let velX = abs(inputX - prevMouseX);
    let velY = abs(inputY - prevMouseY);
    let velocity = constrain(velX + velY, 1, 100);
    
    // Store position with timestamp and velocity
    positions.push({
      x: inputX,
      y: inputY,
      t: millis(),
      v: velocity
    });
    
    // Remove old positions
    if (positions.length > 30) positions.shift();
    
    // Update previous positions
    prevMouseX = inputX;
    prevMouseY = inputY;
  }

  // Draw kaleidoscope
  push();
  translate(width/2, height/2);
  
  for(let i = 0; i < 360; i += 360/segmentCount) {
    push();
    rotate(i);
    drawMirrored();
    if(positions.length > 1) drawTrails();
    pop();
  }
  pop();
}

function drawMirrored() {
  if (positions.length === 0) return;
  
  // Get the most recent position
  let pos = positions[positions.length - 1];
  
  // Convert to coordinates relative to center
  let offsetX = pos.x - width/2;
  let offsetY = pos.y - height/2;
  
  // Set stroke color and weight
  stroke(hue, 80, 90);
  strokeWeight(map(pos.v, 1, 100, 1, 8));
  
  // Draw shape
  noFill();
  beginShape();
  vertex(offsetX, offsetY);
  vertex(offsetX + 10, offsetY - 20);
  vertex(offsetX - 10, offsetY - 20);
  endShape(CLOSE);
  
  // Mirror across axes
  push();
  scale(1, -1);
  beginShape();
  vertex(offsetX, offsetY);
  vertex(offsetX + 10, offsetY - 20);
  vertex(offsetX - 10, offsetY - 20);
  endShape(CLOSE);
  pop();
}

function drawTrails() {
  // Need at least two positions to draw a line
  if (positions.length < 2) return;
  
  for(let i = 1; i < positions.length; i++) {
    // Calculate fade based on age
    let age = millis() - positions[i].t;
    let alpha = map(age, 0, 2000, 1, 0);
    
    // Calculate stroke weight based on velocity
    let weight = map(positions[i].v, 1, 100, 1, 8);
    
    // Set stroke properties
    stroke(hue, 80, 90, alpha);
    strokeWeight(weight);
    
    // Convert to coordinates relative to center
    let x1 = positions[i-1].x - width/2;
    let y1 = positions[i-1].y - height/2;
    let x2 = positions[i].x - width/2;
    let y2 = positions[i].y - height/2;
    
    // Draw line
    line(x1, y1, x2, y2);
  }
}

// Responsive canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

// Mobile touch support
function touchStarted() {
  prevMouseX = touches[0].x;
  prevMouseY = touches[0].y;
  return false; // Prevent default
}

function touchMoved() {
  return false; // Prevent scrolling
}

function touchEnded() {
  // Clear positions array when touch ends
  positions = [];
}

// Clear positions array when mouse is released
function mouseReleased() {
  positions = [];
}