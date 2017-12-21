/* GDC gameeeeeee
TODO: organize this mess
TODO: finish the game
*/

var canvas, ctx; //TODO: clean up these random globals?
var keysDown = [];
var rectList = [];
var active;

class Rectangle { //TODO: move to separate file
	constructor(x, y, width, height, speed) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.xSpeed = speed;
		this.ySpeed = 0;
		this.jumpHeight = 8;
		this.gravity = 0.5;
		this.color = getRandomColor();
		this.inAir = false;
	}
	setX(x) {
		if (x < 0) this.x = 0;
		else if (x + this.width > canvas.width) this.x = canvas.width - this.width;
		else this.x = x;
		}
	getX() { return this.x; }
	setY(y) {
		if (y < 0) this.y = 0;
		else if (y + this.height > canvas.height) this.y = canvas.height - this.height;
	 	else this.y = y;
	}
	getY() { return this.y; }
	setWidth(w) { if (w > 0) this.width = w; }
	getWidth() { return this.width; }
	setHeight(h) { if (h > 0) this.height = h; }
	getHeight() { return this.height; }

	checkCollision() {
		for (var i = 0; i < rectList.length; i++) {

		  if (this.x + this.width > rectList[i].x &&
		  	this.y + this.height > rectList[i].y &&
				this.x < rectList[i].x + rectList[i].width &&
				this.y < rectList[i].y + rectList[i].height)
				return rectList[i];
		}
		return false;
	}

	move() { //TODO: convert to actual physics LOL


		//check collision with rectList

		//update ySpeed
		if (this.inAir === true) {
			this.ySpeed += this.gravity;
		}

		//up
		if (keysDown[1] === 1 && this.inAir === false) {
			this.inAir = true;
			this.ySpeed = -this.jumpHeight;
			this.gravity = 0.5;
		}

		var other;

		if (this.inAir) {
			other = (new Rectangle (this.x, this.y + this.ySpeed, this.width, this.height)).checkCollision();

		if (other === false) {
			this.inAir = true;
			this.gravity = 0.5;
	  } else {
				if (this.y > other.y) { //touching ceiling
					console.log('Touched ceiling!' + this.y + other.y);
					this.setY(other.y + other.height);
					this.ySpeed = 0;
				} else { //on ground
					this.touchGround(other);
				}
			}
		} else {
			other = (new Rectangle (this.x, this.y + 0.1, this.width, this.height)).checkCollision();
			if (other === false) {
				console.log('Starting to fall');
				this.inAir = true;
				this.gravity = 0.5;
		  }

		}

		if (keysDown[0] === 1) { //left
			other = (new Rectangle (this.x - this.xSpeed, this.y, this.width, this.height)).checkCollision();
			if (other !== false) this.x = other.x + other.width;
			else this.setX(this.x - this.xSpeed);
		}
		if (keysDown[2] === 1) { //right
			other = (new Rectangle (this.x + this.xSpeed, this.y, this.width, this.height)).checkCollision();
			if (other !== false) this.x = other.x - this.width;
			else this.setX(this.x + this.xSpeed);
		}

		if (this.inAir === true) {
			this.setY(this.y + this.ySpeed);
		}

		if (this.checkCollision()) { //TODO: figure out what to do when this happens :s Currently happens when you hit a corner or a block gets inside of you
			console.log('p1 is stuck in a rect at ' + this.checkCollision().x + ", " + this.checkCollision().y);
		}

	}

  touchGround(other) {
    this.setY(other.y - this.height);
    this.ySpeed = 0;
    this.inAir = false;
    this.gravity = 0;
  }
}

class Editor {
	constructor() {
		this.active = false;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	move() { //TODO: refactor mousemove to come up here for move() and resize()

	}

	sendElementToTop() { //TODO: figure out how to send rectangle to top

	}
}

var p1 = new Rectangle(20, 20, 40, 40, 1);
var editor = new Editor();

window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	document.addEventListener("keydown", keydown);
	document.addEventListener("keyup", keyup);
	document.addEventListener("click", click);
	document.addEventListener("mousedown", mousedown);
	document.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	document.addEventListener("dblclick", dblclick);

	drawGridofRects(); //TODO: clean this up

	setInterval(main, 1/60 * 1000);
}

function main() {
	//update
	p1.move();

	//render
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//drawBG();

	for (var i = 0; i < rectList.length; i++) {
		ctx.fillStyle = rectList[i].color;
		ctx.fillRect(rectList[i].x, rectList[i].y, rectList[i].width, rectList[i].height);
	}

	drawPlayer();

}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];
	return color;
}

function drawGridofRects() {
	for (var x = 0; x * 100 < canvas.width; x++) {
		for (var y = 0; y * 100 < canvas.height; y++) {
			rectList.push(new Rectangle(100 * x + 40, 100 * y + 40, 10, 10));
		}
	}
	rectList.push(new Rectangle(0, 200, canvas.width, 10));
	rectList.push(new Rectangle(0, 140, canvas.width / 3, 10));
	rectList.push(new Rectangle(canvas.width - canvas.width / 3, 140, canvas.width / 3, 10));
}

function drawBG() { //TODO: find a bg that actually works
	var img =  document.getElementById('grass');
  var pat = ctx.createPattern(img, 'repeat');
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = pat;
  ctx.fill();
}

function drawPlayer() {
	if (p1.dir === 0) {
		ctx.drawImage(document.getElementById("cowL"), p1.x, p1.y, p1.width, p1.height);
    //ctx.fillRect(p1.x, p1.y, p1.width, p1.height);
  }
	else if (p1.dir === 1 || p1.dir === undefined) {
		ctx.drawImage(document.getElementById("cowR"), p1.x, p1.y, p1.width, p1.height);
    //ctx.fillRect(p1.x, p1.y, p1.width, p1.height);
  }

}

function keydown(e) {
	//move character
	if (e.keyCode === 37){ keysDown[0] = 1; p1.dir = 0; }
	if (e.keyCode === 38) keysDown[1] = 1;
	if (e.keyCode === 39){ keysDown[2] = 1; p1.dir = 1; }
	if (e.keyCode === 40) keysDown[3] = 1;
	if (e.keyCode === 16) keysDown[4] = 1; //shift
	//temp for changing speed
	if (e.keyCode === 187) p1.xSpeed += 1;
	if (e.keyCode === 189 && p1.xSpeed > 1) p1.xSpeed -= 1;
}

function keyup(e) {
	//move character
	if (e.keyCode === 37) keysDown[0] = 0;
	if (e.keyCode === 38) keysDown[1] = 0;
	if (e.keyCode === 39) keysDown[2] = 0;
	if (e.keyCode === 40) keysDown[3] = 0;
	if (e.keyCode === 16) keysDown[4] = 0; //shift
	//temp for changing speed
	if (e.keyCode === 187) p1.speed += 1;
	if (e.keyCode === 189 && p1.speed > 1) p1.speed -= 1;

}

function click(e) {
}

function mousedown(e) {
	var other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 1, 1).checkCollision()
	if (other !== false) {
		editor.active = other;
		editor.sendElementToTop();
		editor.offsetLeft = e.clientX - canvas.offsetLeft - other.x;
		editor.offsetTop = e.clientY - canvas.offsetTop - other.y;
		editor.side = "";
		if (Math.abs(other.x - (e.clientX - canvas.offsetLeft)) < other.width / 4) editor.side = editor.side.concat("left");
		if (Math.abs(other.x + other.width - (e.clientX - canvas.offsetLeft)) > other.width * 3 / 4) editor.side = editor.side.concat("right");
		if (Math.abs(other.y - (e.clientY - canvas.offsetTop)) < other.height / 4) editor.side = editor.side.concat("top");
		if (Math.abs(other.y + other.height - (e.clientY - canvas.offsetTop)) > other.height * 3 / 4) editor.side = editor.side.concat("bottom");
		if (editor.side = "") editor.side = "middle";
		console.log(editor.side);
	}
}

function mousemove(e) {
	if (editor.active !== false) { //currently dragging something
		if (keysDown[4]) { //shift clicked
			//anchors right edge, changes width

				var dx = editor.prevX - e.clientX;

				editor.active.setWidth(editor.active.width + dx);
				editor.active.setX(e.clientX - canvas.offsetLeft - editor.offsetLeft); //TODO: make it not drag when width is at its lowest
			//}
			//anchors bottom edge, changes height

				var dy = editor.prevY - e.clientY;
				editor.active.setY(e.clientY - canvas.offsetTop - editor.offsetTop);
				editor.active.setHeight(editor.active.height + dy);
			//}
		} else { //regular click
			editor.active.setY(e.clientY - canvas.offsetTop - editor.offsetTop);
			editor.active.setX(e.clientX - canvas.offsetLeft - editor.offsetLeft);
  	}

  	if (p1.checkCollision() !== false) {
      	p1.touchGround(p1.checkCollision());
  	}

		//set values for later
		editor.prevX = e.clientX;
		editor.prevY = e.clientY;
	}
}

function mouseup(e) {
	editor.active = false;
}

function dblclick(e) {
			console.log('double clicked!');
	if (e.clientY - canvas.offsetTop < editor.active.y) {
		var dy =  e.clientY - (e.clientY - canvas.offsetTop - editor.offsetTop);
		editor.active.y = e.clientY - canvas.offsetTop - editor.offsetTop;
		editor.active.height += dy;

	}
	editor.active.width = e.clientX - canvas.offsetLeft - editor.offsetLeft;

	if (p1.checkCollision() !== false) {
			p1.touchGround(p1.checkCollision());

		}
}
