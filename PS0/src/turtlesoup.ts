import { Turtle, SimpleTurtle, Point, Color } from "./turtle";
import * as fs from "fs";
import { execSync } from "child_process";

/**
 * Draws a square of the given side length using the turtle.
 * @param turtle The turtle to use for drawing.
 * @param sideLength The length of each side of the square in pixels.
 */
export function drawSquare(turtle: Turtle, sideLength: number): void {
  for (let i = 0; i < 4; i++) {
    turtle.forward(sideLength);
    turtle.turn(90);
  }
}

/**
 * Calculates the length of a chord of a circle.
 * @param radius Radius of the circle.
 * @param angleInDegrees Angle subtended by the chord at the center of the circle (in degrees).
 * @returns The length of the chord.
 */
export function chordLength(radius: number, angleInDegrees: number): number {
  const angleInRadians = (Math.PI / 180) * angleInDegrees;
  return 2 * radius * Math.sin(angleInRadians / 2);
}

/**
 * Draws an approximate circle using the turtle.
 * @param turtle The turtle to use.
 * @param radius The radius of the circle.
 * @param numSides The number of sides to approximate the circle with.
 */
export function drawApproximateCircle(
  turtle: Turtle,
  radius: number,
  numSides: number
): void {
  const angle = 360 / numSides;
  const stepSize = chordLength(radius, angle);

  for (let i = 0; i < numSides; i++) {
    turtle.forward(stepSize);
    turtle.turn(angle);
  }
}

/**
 * Calculates the distance between two points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The distance between p1 and p2.
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Finds a path (sequence of turns and moves) for the turtle to visit a list of points in order.
 * @param turtle The turtle to move.
 * @param points An array of points to visit in order.
 * @returns An array of instructions representing the path.
 */
export function findPath(turtle: Turtle, points: Point[]): string[] {
  const instructions: string[] = [];

  for (let i = 0; i < points.length; i++) {
    const target = points[i];
    const currentPos = turtle.getPosition();

    const deltaX = target.x - currentPos.x;
    const deltaY = target.y - currentPos.y;

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const turnAngle = (angle - turtle.getHeading() + 360) % 360;

    turtle.turn(turnAngle);
    instructions.push(`turn ${turnAngle.toFixed(2)}`);

    const moveDistance = distance(currentPos, target);
    turtle.forward(moveDistance);
    instructions.push(`forward ${moveDistance.toFixed(2)}`);
  }

  return instructions;
}

/**
 * Draws personal art using the turtle.
 * Uses colors and a looping pattern to create an interesting design.
 * @param turtle The turtle to use.
 */
export function drawPersonalArt(turtle: Turtle): void {
  const colors: Color[] = ["red", "blue", "green", "purple", "orange", "cyan"];

  for (let i = 0; i < 36; i++) {
    turtle.color(colors[i % colors.length]);
    turtle.forward(50);
    turtle.turn(100);
    turtle.forward(30);
    turtle.turn(80);
  }
}

function generateHTML(
  pathData: { start: Point; end: Point; color: Color }[]
): string {
  const canvasWidth = 500;
  const canvasHeight = 500;
  const scale = 1; // Adjust scale as needed
  const offsetX = canvasWidth / 2; // Center the origin
  const offsetY = canvasHeight / 2; // Center the origin

  let pathStrings = "";
  for (const segment of pathData) {
    const x1 = segment.start.x * scale + offsetX;
    const y1 = segment.start.y * scale + offsetY;
    const x2 = segment.end.x * scale + offsetX;
    const y2 = segment.end.y * scale + offsetY;
    pathStrings += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${segment.color}" stroke-width="2"/>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
    <title>Turtle Graphics Output</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <svg width="${canvasWidth}" height="${canvasHeight}" style="background-color:#f0f0f0;">
        ${pathStrings}
    </svg>
</body>
</html>`;
}

function saveHTMLToFile(
  htmlContent: string,
  filename: string = "output.html"
): void {
  fs.writeFileSync(filename, htmlContent);
  console.log(`Drawing saved to ${filename}`);
}

function openHTML(filename: string = "output.html"): void {
  try {
    execSync(`open ${filename}`); // macOS
  } catch {
    try {
      execSync(`start ${filename}`); // Windows
    } catch {
      try {
        execSync(`xdg-open ${filename}`); // Linux
      } catch {
        console.log("Could not open the file automatically");
      }
    }
  }
}

export function main(): void {
  const turtle = new SimpleTurtle();

  // Draw a square
  drawSquare(turtle, 100);

  // Example chordLength calculation (for testing in console)
  console.log("Chord length for radius 5, angle 60 degrees:", chordLength(5, 60));

  // Draw an approximate circle
  drawApproximateCircle(turtle, 50, 36);

  // Example distance calculation
  const p1: Point = { x: 1, y: 2 };
  const p2: Point = { x: 4, y: 6 };
  console.log("Distance between p1 and p2:", distance(p1, p2));

  // Example findPath
  const pointsToVisit: Point[] = [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 80, y: 80 }];
  const pathInstructions = findPath(turtle, pointsToVisit);
  console.log("Path instructions:", pathInstructions);

  // Draw personal art
  drawPersonalArt(turtle);

  const htmlContent = generateHTML((turtle as SimpleTurtle).getPath()); // Cast to access getPath
  saveHTMLToFile(htmlContent);
  openHTML();
}

// Run main function if this file is executed directly
if (require.main === module) {
  main();
}