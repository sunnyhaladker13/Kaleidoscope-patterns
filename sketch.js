let positions = [];
let hue = 0;
let symmetryCount = 12;
let maxTrailLength = 30; // Reduced from 50 to make trails shorter
let fadeSpeed = 10; // Increased for slightly faster fading
let currentShapeType = 0;
const SHAPE_TYPES = ['triangle', 'circle', 'square', 'star', 'flower'];
let shapeChangeTimer = 0;
let shapeChangeDuration = 8000; // Slower shape transitions
let lastShapeType = 0;
let transitionProgress = 1; // For shape transitioning
let previousMouseX = 0;
let previousMouseY = 0;
let easing = 0.25; // Slightly increased for smoother mouse movement

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  angleMode(DEGREES);
  strokeWeight(5);
  background(0);
  frameRate(60); // Ensure high frame rate for smooth animation
}

function draw() {
  // Semi-transparent background for smoother fade effect
  fill(0, 0, 0, fadeSpeed);
  noStroke();
  rect(0, 0, width, height);
  
  // Update color with smoother transition
  hue = (hue + 0.3) % 360; // Slower color change
  
  // Handle shape transitions
  if (millis() - shapeChangeTimer > shapeChangeDuration) {
    lastShapeType = currentShapeType;
    currentShapeType = floor(random(SHAPE_TYPES.length));
    // Avoid selecting the same shape twice
    if (currentShapeType === lastShapeType) {
      currentShapeType = (currentShapeType + 1) % SHAPE_TYPES.length;
    }
    shapeChangeTimer = millis();
    transitionProgress = 0;
  }
  
  // Update shape transition progress
  if (transitionProgress < 1) {
    transitionProgress += 0.02; // Slow, smooth transition
    if (transitionProgress > 1) transitionProgress = 1;
  }
  
  // Handle both mouse and touch input with easing for smoother movement
  let currentInput = {
    x: 0, 
    y: 0, 
    isActive: false
  };
  
  if (touches.length > 0) {
    // Apply easing to touch movements
    currentInput.x = touches[0].x;
    currentInput.y = touches[0].y;
    currentInput.isActive = true;
  } else if (mouseX > 0 || mouseY > 0) {
    // Apply easing to mouse movements
    currentInput.x = previousMouseX + (mouseX - previousMouseX) * easing;
    currentInput.y = previousMouseY + (mouseY - previousMouseY) * easing;
    previousMouseX = currentInput.x;
    previousMouseY = currentInput.y;
    currentInput.isActive = (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height);
  }
  
  if (currentInput.isActive) {
    // Store position with timestamp and interpolated shape type
    positions.push({
      x: currentInput.x,
      y: currentInput.y,
      t: millis(),
      h: hue,  // Store current hue with position
      shapeType: lastShapeType,
      transitionProgress: transitionProgress,
      nextShapeType: currentShapeType
    });
    
    // Remove old positions
    while (positions.length > maxTrailLength) positions.shift();
  }

  // Draw symmetrical patterns
  push();
  translate(width / 2, height / 2);
  
  for (let i = 0; i < symmetryCount; i++) {
    push();
    rotate(i * (360 / symmetryCount));
    
    if (currentInput.isActive) {
      drawMirrored(currentInput, hue, currentShapeType);
    }
    
    if (positions.length > 1) {
      drawTrails();
    }
    pop();
  }
  pop();
  
  // Apply enhanced removal of old trail points with smoother fade
  let currentTime = millis();
  positions = positions.filter(p => currentTime - p.t < 2000); // Reduced from 3000 for shorter persistence
  
  // Display signature at bottom
  displaySignature();
}

function drawMirrored(input, hue, shapeType) {
  // Calculate relative position from center
  let offsetX = input.x - width / 2;
  let offsetY = input.y - height / 2;
  
  // Use stored hue for coloring with slight saturation variation
  const saturation = 85 + sin(frameCount * 0.5) * 15;
  stroke(hue, saturation, 100);
  fill(hue, saturation, 100, 0.4);
  
  // Draw shape based on current shape type with transition effect
  if (transitionProgress < 1) {
    // Draw transitioning shape
    blendMode(BLEND);
    drawShape(offsetX, offsetY, lastShapeType, 1 - transitionProgress);
    blendMode(ADD);
    drawShape(offsetX, offsetY, currentShapeType, transitionProgress);
    blendMode(BLEND);
  } else {
    // Draw normal shape
    drawShape(offsetX, offsetY, shapeType);
  }
  
  // Mirror across axes
  push();
  scale(1, -1);
  if (transitionProgress < 1) {
    // Draw transitioning shape
    blendMode(BLEND);
    drawShape(offsetX, offsetY, lastShapeType, 1 - transitionProgress);
    blendMode(ADD);
    drawShape(offsetX, offsetY, currentShapeType, transitionProgress);
    blendMode(BLEND);
  } else {
    // Draw normal shape
    drawShape(offsetX, offsetY, shapeType);
  }
  pop();
}

function drawShape(x, y, shapeType, alpha = 1) {
  const size = 20;
  const originalStrokeWeight = strokeWeight();
  
  // Apply alpha for transitions
  stroke(hue, 90, 100, alpha);
  fill(hue, 90, 100, 0.5 * alpha);
  
  // Add subtle pulsing to shapes
  const pulseFactor = 1 + sin(frameCount * 0.1) * 0.1;
  const dynamicSize = size * pulseFactor;
  
  switch(SHAPE_TYPES[shapeType]) {
    case 'triangle':
      beginShape();
      vertex(x, y);
      vertex(x + dynamicSize, y - dynamicSize * 1.5);
      vertex(x - dynamicSize, y - dynamicSize * 1.5);
      endShape(CLOSE);
      break;
      
    case 'circle':
      ellipse(x, y, dynamicSize * 2);
      break;
      
    case 'square':
      rectMode(CENTER);
      push();
      translate(x, y);
      rotate(frameCount * 0.2); // Gentle rotation
      rect(0, 0, dynamicSize * 1.5, dynamicSize * 1.5);
      pop();
      break;
      
    case 'star':
      drawStar(x, y, dynamicSize * 0.4, dynamicSize, 5);
      break;
      
    case 'flower':
      drawFlower(x, y, dynamicSize);
      break;
  }
  
  // Restore original stroke weight
  strokeWeight(originalStrokeWeight);
}

function drawStar(x, y, radius1, radius2, npoints) {
  // Add gentle rotation to the star
  push();
  translate(x, y);
  rotate(frameCount * 0.1);
  
  let angle = 360 / npoints;
  let halfAngle = angle / 2.0;
  
  beginShape();
  for (let a = 0; a < 360; a += angle) {
    let sx = cos(a) * radius2;
    let sy = sin(a) * radius2;
    vertex(sx, sy);
    sx = cos(a + halfAngle) * radius1;
    sy = sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
  pop();
}

function drawFlower(x, y, size) {
  push();
  translate(x, y);
  rotate(frameCount * 0.1); // Gentle rotation
  
  const petals = 6;
  for (let i = 0; i < 360; i += 360 / petals) {
    push();
    rotate(i);
    // Animate petals with sine wave
    const petalLength = size * 2 + sin(frameCount * 0.1 + i) * size * 0.2;
    ellipse(0, size, size * 0.8, petalLength);
    pop();
  }
  ellipse(0, 0, size * 0.8);
  pop();
}

function drawTrails() {
  noFill();
  
  for (let i = 1; i < positions.length; i++) {
    // Calculate time-based opacity with smoother fade
    let age = millis() - positions[i].t;
    let opacity = map(age, 0, 2000, 1, 0, true); // Reduced from 3000 to match shorter persistence
    
    // Enhanced velocity calculation for smoother weight changes
    let timeDiff = positions[i].t - positions[i-1].t;
    let distance = dist(
      positions[i].x, positions[i].y, 
      positions[i-1].x, positions[i-1].y
    );
    let velocity = distance / (timeDiff || 1);
    
    // Apply easing to stroke weight changes for smoother transitions
    let targetWeight = constrain(map(velocity, 0, 5, 8, 1), 1, 8);
    let weight;
    if (i > 1) {
      // Get previous weight and apply easing
      let prevStrokeWeight = strokeWeight();
      weight = prevStrokeWeight + (targetWeight - prevStrokeWeight) * 0.3;
    } else {
      weight = targetWeight;
    }
    
    // Apply smoothed stroke weight
    strokeWeight(weight);
    
    // Calculate positions relative to center
    let x1 = positions[i-1].x - width/2;
    let y1 = positions[i-1].y - height/2;
    let x2 = positions[i].x - width/2;
    let y2 = positions[i].y - height/2;
    
    // Use custom bezier curves for smoother lines
    if (i > 1 && i < positions.length - 1) {
      let x0 = positions[i-2].x - width/2;
      let y0 = positions[i-2].y - height/2;
      let x3 = positions[i+1 < positions.length ? i+1 : i].x - width/2;
      let y3 = positions[i+1 < positions.length ? i+1 : i].y - height/2;
      
      // Control points for smooth curve
      let cp1x = lerp(x1, x2, 0.5);
      let cp1y = lerp(y1, y2, 0.5);
      let cp2x = lerp(x2, x3, 0.5);
      let cp2y = lerp(y2, y3, 0.5);
      
      // Draw the hue with stored color and calculated opacity
      stroke(positions[i].h, 90, 100, opacity);
      
      // Draw smooth curve
      beginShape();
      vertex(x1, y1);
      bezierVertex(cp1x, cp1y, cp2x, cp2y, x2, y2);
      endShape();
    } else {
      // Draw simple line for endpoints
      stroke(positions[i].h, 90, 100, opacity);
      line(x1, y1, x2, y2);
    }
    
    // Occasionally draw the shape at points along the trail with transition effect
    if (i % 8 == 0) { // Changed from 6 to 8 to reduce number of shapes drawn along trail
      push();
      if (positions[i].transitionProgress < 1) {
        // Draw transitioning shapes
        let tProgress = positions[i].transitionProgress;
        blendMode(BLEND);
        fill(positions[i].h, 90, 100, opacity * 0.6);
        drawShape(x2, y2, positions[i].shapeType, 1 - tProgress);
        blendMode(ADD);
        fill(positions[i].h, 90, 100, opacity * 0.6);
        drawShape(x2, y2, positions[i].nextShapeType, tProgress);
        blendMode(BLEND);
      } else {
        // Draw normal shape
        fill(positions[i].h, 90, 100, opacity * 0.6);
        drawShape(x2, y2, positions[i].shapeType || 0);
      }
      pop();
    }
  }
  
  // Reset stroke weight
  strokeWeight(5);
}

function mouseMoved() {
  // Already handled in draw()
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function touchStarted() {
  return false; // Prevent default
}

function touchMoved() {
  return false; // Prevent scrolling on mobile
}

function touchEnded() {
  // Clear positions when touch ends to prevent lingering lines
  // when touching somewhere else
  positions = [];
  return false;
}

// Function to display signature text
function displaySignature() {
  push();
  textAlign(CENTER, BOTTOM);
  textSize(14);
  
  // Define light grey color for both text and button
  let lightGreyColor = color(240, 240, 240, 200);
  
  // Draw the text in two parts
  fill(lightGreyColor);
  noStroke();
  text("Made with ❤️ by Sunny", width/2 - 70, height - 20);
  
  // Draw button-like background for LinkedIn part
  let linkedinX = width/2 + 70;
  let buttonWidth = 140;
  let buttonHeight = 26;
  let isHovering = mouseY > height - buttonHeight - 15 && 
                   mouseY < height - 15 && 
                   mouseX > linkedinX - buttonWidth/2 && 
                   mouseX < linkedinX + buttonWidth/2;
  
  // Button styling with hover effect - outline only
  rectMode(CENTER);
  noFill();
  strokeWeight(1.5);
  
  if (isHovering) {
    stroke(lightGreyColor); // Use same color but full opacity on hover
    cursor(HAND);
  } else {
    stroke(240, 240, 240, 150); // Slightly more transparent when not hovering
    cursor(AUTO);
  }
  
  // Draw outlined rounded button
  rect(linkedinX, height - 27, buttonWidth, buttonHeight, 12);
  
  // LinkedIn text - same light grey
  noStroke();
  fill(isHovering ? lightGreyColor : color(240, 240, 240, 150));
  text("LinkedIn Profile", linkedinX, height - 20);
  
  // Handle click
  if (isHovering && mouseIsPressed) {
    window.open('https://www.linkedin.com/in/sunnyhaladker/', '_blank');
  }
  
  pop();
}
