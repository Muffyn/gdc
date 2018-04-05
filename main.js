/* GDC gameeeeeee
TODO: organize this mess
TODO: finish the game
*/

var canvas, ctx; //TODO: clean up these random globals?
var keysDown = [];
var rectList = [];
var menuList = [];
var state;
var gridSize = 16;
var fps = 0, prevFps = 0;
var prevTime = Date.now();
var light, light2;


class Rectangle { //TODO: move to separate file
	constructor(x, y, width, height, color) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || gridSize;
		this.height = height || gridSize;
		this.type = "Rectangle";
		this.color = color || getRandomColor();
		this.onGrid = true;
		this.sprite = 0;
		this.spriteList = ["", "wood", "stone"];
		this.collidable = true;
		this.editable = true;

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

	checkCollision(other) {
		if (this.collidable) {
			if (arguments[0] === undefined) {
				for (var i = 0; i < rectList.length; i++) {
			  	if (this.x + this.width > rectList[i].x &&
			  		this.y + this.height > rectList[i].y &&
						this.x < rectList[i].x + rectList[i].width &&
						this.y < rectList[i].y + rectList[i].height) {
							return rectList[i];
						}

					}
			} else {
				if (this.x + this.width > other.x &&
					this.y + this.height > other.y &&
					this.x < other.x + other.width &&
					this.y < other.y + other.height)
					return other;

			}
		}
		return false;
	}

	render() {
		if (this.spriteList[this.sprite] !== "") {
			ctx.drawImage(document.getElementById(this.spriteList[this.sprite]), this.x, this.y, this.width, this.height);
		} else {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}

	}
}

class Creature extends Rectangle {
	constructor(x, y, width, height, color, spriteList) {
		super(x, y, width, height, color);
		this.spriteList = spriteList;
		this.xVel = 3;
		this.yVel = 0;
		this.jumpHeight = 8;
		this.gravity = 0.5;
		this.inAir = false;
		this.keysDown = [0, 0, 1, 0];
		this.type = "Creature";
	}

	move() {
		this.chooseDirection();

		//update yVel
		if (this.inAir === true) {
			this.yVel += this.gravity;
		}

		if (this.keysDown[1] === 1 && this.inAir === false) {
			this.inAir = true;
			this.yVel = -this.jumpHeight;
			this.gravity = 0.5;
		}

		var other;

		if (this.inAir) {
			other = (new Rectangle (this.x, this.y + this.yVel, this.width, this.height)).checkCollision();

		if (other === false) {
			this.inAir = true;
			this.gravity = 0.5;
		} else {
				if (this.y > other.y) { //touching ceiling
					this.setY(other.y + other.height);
					this.yVel = 0;
				} else { //on ground
					this.touchGround(other);
				}
			}
		} else {
			other = (new Rectangle (this.x, this.y + 0.1, this.width, this.height)).checkCollision();
			if (other === false) {
				this.inAir = true;
				this.gravity = 0.5;
			}

		}

		if (this.keysDown[0] === 1) { //left
			this.xVel = -Math.abs(this.xVel)
			this.sprite = 0;
		} else if (this.keysDown[2] === 1) { //right
			this.xVel = Math.abs(this.xVel)
			this.sprite = 1;
		}

		if (this.keysDown[0] || this.keysDown[2]) {
			other = (new Rectangle (this.x + this.xVel, this.y, this.width, this.height)).checkCollision();
			if (other !== false) if (this.xVel > 0) this.setX(other.x - this.width); else this.setX(other.x + other.width);
			else {
				other = (new Rectangle (this.x + this.xVel, this.y + this.yVel, this.width, this.height)).checkCollision();
				if (other !== false) if (this.xVel > 0) this.setX(other.x - this.width); else this.setX(other.x + other.width);
				else this.setX(this.x + this.xVel);
			}
		}

		if (this.inAir === true) {
			this.setY(this.y + this.yVel);
		}
	}

	touchGround(other) {
		this.setY(other.y - this.height);
		this.yVel = 0;
		this.inAir = false;
		this.gravity = 0;
	}

	chooseDirection() {
		//change directions when hitting a wall
		if (new Rectangle(this.x + this.xVel, this.y, this.width, this.height).checkCollision() !== false) {
			[this.keysDown[0], this.keysDown[2]] = [this.keysDown[2], this.keysDown[0]]; //swaps the two variables
		}

		if (Math.floor(Math.random() * 100) === 0) {
			this.keysDown[1] = 1;
		} else {
			this.keysDown[1] = 0;
		}

	}
}

class Player extends Creature {
	constructor(x, y, width, height, color, spriteList) {
		super(x, y, width, height, color, spriteList);
		this.type = "Player";
		this.keysDown = [];
	}

	chooseDirection() {

	}

	die() {
		this.setX(gridSize);
		this.setY(gridSize);
	}
}

class Spike extends Rectangle {
	constructor(x, y, width, height, color) {
		super(x, y, width, height, color);
		this.deadly = true;
		this.type = "Spike";
	}

	render() {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(this.x, this.height + this.y);
		ctx.lineTo(this.x + this.width / 2, this.y);
		ctx.lineTo(this.x + this.width, this.height + this.y);
		ctx.lineTo(this.x, this.height + this.y);
		ctx.fill();
	}
}

class MovingRectangle extends Rectangle {
	constructor(x, y, width, height, color, speed, min, max) {
		super(x, y, width, height, color);
		this.editable = false;
		this.speed = speed || 1;
		if (arguments[6] === undefined || arguments[7] === undefined) {
			this.min = new MovingRectangleNode(x, y, width, height, color, this);
			this.max = new MovingRectangleNode(x + 32, y + 32, width, height, color, this);
		} else {
			this.min = new MovingRectangleNode(min.x, min.y, width, height, color, this);
			this.max = new MovingRectangleNode(max.x, max.y, width, height, color, this);
		}
		this.activeNode = this.max;
		this.type = "MovingRectangle";

	}

	act() {
		//TODO: check y as well maybe
		if (this.max.x < this.min.x) {
			var temp = this.min;
			this.min = this.max;
			this.max = temp;
		}
		if (this.x <= this.min.x) {
			this.activeNode = this.max;
		} else if (this.x + this.width >= this.max.x + this.max.width) {
			this.activeNode = this.min;
		}

		this.setX(this.getX() + this.speed * Math.cos(Math.atan2(this.activeNode.y - this.y, this.activeNode.x - this.x)));
		this.setY(this.getY() + this.speed * Math.sin(Math.atan2(this.activeNode.y - this.y, this.activeNode.x - this.x)));

	}

	render() {
		this.min.width = this.width;
		this.min.height = this.height;
		this.max.width = this.width;
		this.max.height = this.height;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);

		//if (editor.active === this) {
			this.min.render();
			this.max.render();
		//}
	}
}

class MovingRectangleNode extends Rectangle {
	constructor(x, y, width, height, color, parent) {
		super(x, y, width, height, color);
		this.color = "rgba(" + parseInt(this.color.substring(1, 3), 16) +
												", " + parseInt(this.color.substring(3, 5), 16) +
												", " + parseInt(this.color.substring(5, 7), 16) + ", 0.25)"; //transparency hack
		this.collidable = false;
		rectList.push(this);
		//this.parent = parent;
		this.type = "MovingRectangleNode";
	}

	render() {

		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

class Light {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;

	}

	render() {
		this.x = p1.x + p1.width / 2;
		this.y = p1.y + p1.height / 2;
		for (var i = 0; i < rectList.length; i++) {

			var other = rectList[i];
			var vertices = this.getCorners(other);
			var edges = [this.getEdge(other, vertices, 0), this.getEdge(other, vertices, 1)];


			if (edges[0].reached && edges[1].reached) {
				vertices.push(edges[0], edges[1]);
				this.handleEdges(edges, vertices);
				this.sortVertices(vertices);

				ctx.beginPath();
				ctx.moveTo(vertices[vertices.length - 1].x, vertices[vertices.length - 1].y);
				ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

				for (var j = 0; j < vertices.length; j++) {
					ctx.lineTo(vertices[j].x, vertices[j].y);
				}

				ctx.fill();
				//render the light
				ctx.fillStyle = "#000000";
				ctx.fillRect(this.x - 5, this.y - 5, 10, 10);
			}
		}
	}

		getCorners(other) {
			var corners = [];
			var c0 = {x: other.x, y: other.y};
			var c1 = {x: other.x + other.width, y: other.y};
			var c2 = {x: other.x + other.width, y: other.y + other.height};
			var c3 = {x: other.x, y: other.y + other.height};

			//figure out which two corners are blocking light and remember them
			if (this.x <= other.x) {
				if (this.y <= other.y) { //down right
					corners = [c1, c3];
				} else if (this.y >= other.y && this.y <= other.y + other.height) { // right
					corners = [c0, c3];
				} else { //up right
					corners = [c0, c2];
				}
			} else if (this.x >= other.x && this.x <= other.x + other.width) { //up or down
				if (this.y <= other.y) { //down
					corners = [c0, c1];
				} else if (this.y >= other.y && this.y <= other.y + other.height) { //on top of the Light
					corners = [c0, c2]; //TODO: handle when on top of light
				} else { //up
					corners = [c2, c3];
				}
			} else { //left
				if (this.y <= other.y) { //down left
					corners = [c0, c2];
				} else if (this.y >= other.y && this.y <= other.y + other.height) { // left
					corners = [c1, c2];
				} else { //up left
					corners = [c1, c3];
				}
			}

			return corners;
		}

		getEdge(other, vertices, j) {
			var edge = {x: this.x, y: this.y, reached: false};
			var check;

			var dx = Math.cos(Math.atan2((vertices[j].y - this.y), (vertices[j].x - this.x)));
			var dy = Math.sin(Math.atan2((vertices[j].y - this.y), (vertices[j].x - this.x)));
			while (edge.x > 0 && edge.x < canvas.width && edge.y > 0 && edge.y < canvas.height) {//working on
				edge.x += dx;
				edge.y += dy;
				//ctx.fillRect(edge.x - .15, edge.y - .15, .3, .3);

				check = new Rectangle(edge.x - .5, edge.y - .5, 1, 1).checkCollision();

				if (check !== false) {
					if (check === other) {
						edge.reached = true;


					} else {
						if (edge.reached && other.checkCollision(check) === false) {
							ctx.fillRect(edge.x - 5, edge.y - 5, 10, 10);
							//vertices.push(edge);
							vertices.push(this.getCorners(check)[1]); //TODO: change from 1 to j somehow; only works with things up right from it
							vertices.push(this.getEdge(check, this.getCorners(check), 1));

							break;

						}
					}
				}
			}
			/* fix corners of the map attempt #3 aaaaaaaa!!!!!
			if (edge.x < 0 || edge.x > canvas.width) {
				if (dy < 0) {
					vertices.push({x:edge.x, y: 0})
				} else {
					vertices.push({x:edge.x, y: canvas.height})
				}
			} else if (edge.y < 0 || edge.y > canvas.height) {
				if (dx < 0) {
					vertices.push({x:0, y: edge.y})
				} else {
					vertices.push({x:canvas.width, y: edge.y})
				}
			} */

			return edge;
		}

		handleEdges(edges, vertices) {
			if (edges[0].x < 0 && edges[1].x < 0) { //L+L

			} else if ((edges[0].x < 0 && edges[1].x > canvas.width) || (edges[1].x < 0 && edges[0].x > canvas.width)) { //L+R
				if (edges[0].y < this.y) {
					vertices.push({x: 0, y: 0});
					vertices.push({x: canvas.width, y: 0});
				} else if (edges[0].y > this.y) {
					vertices.push({x: 0, y: canvas.height});
					vertices.push({x: canvas.width, y: canvas.height});
				}
			}
		}

		sortVertices(vertices) {
			//find midpoints to compare to
			var mid = {x: 0, y: 0};
			for (var j = 0; j < vertices.length; j++) {
				mid.x += vertices[j].x;
				mid.y += vertices[j].y;
			}
			mid.x /= vertices.length;
			mid.y /= vertices.length;

			//sort by angle
			vertices.sort(function (a, b) { //shoutout to the docs for showing me this
  			return Math.atan2(a.y - mid.y, a.x - mid.x) - Math.atan2(b.y - mid.y, b.x - mid.x);
			});
			vertices = vertices.sort();
		}

}

class Light2 {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	render() {
		//find points
		ctx.beginPath();
		for (var degree = 0; degree <= Math.PI * 2; degree += Math.PI / 100) {
			var dx = Math.cos(degree);
			var dy = Math.sin(degree);
			var ray = {x: 0, y: 0};
			var check = false;
			var points = [];
			ray.x = this.x;
			ray.y = this.y;
			while (ray.x > 0 && ray.x < canvas.width && ray.y > 0 && ray.y < canvas.height && check === false) {//working on
				ray.x += dx;
				ray.y += dy;

				check = new Rectangle(ray.x, ray.y, 1, 1).checkCollision();
			}
			ctx.lineTo(ray.x, ray.y);
		}

		//draw lines
		ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
		ctx.fill();
		//ctx.stroke();
		ctx.fillStyle = 'rgba(0, 0, 0, 1)';
		ctx.fillRect(this.x - 5, this.y - 5, 10, 10);
	}
}

class Editor {
	constructor() {
		this.active = false;
		this.shadow = new Rectangle();
		this.shadow.color = 'rgba(00, 00, 00, 0)';
	}

	setActive(other, e) {
		this.active = other;

		this.offsetLeft = e.clientX - canvas.offsetLeft - other.x;
		this.offsetTop = e.clientY - canvas.offsetTop - other.y;

		this.side = "";
		if (Math.abs(other.y - (e.clientY - canvas.offsetTop)) < other.height / 4) this.side = this.side.concat("top");
		else if (Math.abs(other.y - (e.clientY - canvas.offsetTop)) > other.height * 3/ 4) this.side = this.side.concat("bottom");
		if (Math.abs(other.x - (e.clientX - canvas.offsetLeft)) < other.width / 4) this.side = this.side.concat("left");
		else if (Math.abs(other.x - (e.clientX - canvas.offsetLeft)) > other.width * 3 / 4) this.side = this.side.concat("right");
		else if (this.side === "") this.side = "middle";

		this.sendElementToTop(this.shadow);
		this.sendElementToTop(this.active);
		this.moveShadow();
	}

	removeActive() {
		//fix where the player is TODO: make it take direction into account
		if (this.active !== false) {
			if (this.active.checkCollision(p1)) {
				p1.y = this.active.y - p1.height;
			}
			this.shadow.color = 'rgba(00, 00, 00, 0)';
			this.active = false;
		}
	}

	move(e) { //TODO: come up with more elegant way to resize
		if (keysDown[4]) { //shift clicked
			this.resize(e);
		} else {
			this.active.setX(e.clientX - canvas.offsetLeft - this.offsetLeft);
			this.active.setY(e.clientY - canvas.offsetTop - this.offsetTop);

			//set values for later
			this.prevX = e.clientX;
			this.prevY = e.clientY;
		}

		//render shadow of drop location
		this.moveShadow();

		//fix where the player is TODO: make it take direction into account
		if (this.active.checkCollision(p1)) {
			p1.y = this.active.y - p1.height;
		}

	}

	resize(e) {
		if (this.side.indexOf("left") !== -1) { //anchors right edge, changes width
			var dx = this.prevX - e.clientX;
			this.active.setWidth(this.active.width + dx);
			this.active.setX(e.clientX - canvas.offsetLeft - this.offsetLeft); //TODO: make it not drag when width is at its lowest
		}

		if (editor.side.indexOf("right") !== -1) { //anchors left edge, changes width
			var dx = this.prevX - e.clientX;
			this.active.setWidth(this.active.width - dx);
		}

		if (editor.side.indexOf("top") !== -1) { //anchors bottom edge, changes height
			var dy = this.prevY - e.clientY;
			this.active.setHeight(this.active.height + dy);
			this.active.setY(e.clientY - canvas.offsetTop - this.offsetTop);
		}

		if (editor.side.indexOf("bottom") !== -1) { //anchors top edge, changes height
			var dy = this.prevY - e.clientY;
			this.active.setHeight(this.active.height - dy);
		}

		if (editor.side.indexOf("middle") !== -1) { //do normal click
			this.active.setX(e.clientX - canvas.offsetLeft - this.offsetLeft);
			this.active.setY(e.clientY - canvas.offsetTop - this.offsetTop);
		}

		//set values for later
		this.prevX = e.clientX;
		this.prevY = e.clientY;
	}

	recolor(other) {
		other.color = getRandomColor();
		other.sprite++;
		if (other.sprite >= other.spriteList.length)
			other.sprite = 0;
	}

	sendElementToTop(element) {
		for (var i = 0; i < rectList.length; i++) {
			if (rectList[i] === element)
    		rectList.splice(0, 0, rectList.splice(i, 1)[0]);
		}
	}

	snapToGrid(obj) {
		//set the x, y, width, and height of obj to the nearest multiple of gridSize
		if (obj.x % gridSize < gridSize / 2) {
			obj.setX(Math.floor(obj.x / gridSize) * gridSize);
		} else {
			obj.setX(Math.ceil(obj.x / gridSize) * gridSize);
		}

		if (obj.y % gridSize < gridSize / 2) {
			obj.setY(Math.floor(obj.y / gridSize) * gridSize);
		} else {
			obj.setY(Math.ceil(obj.y / gridSize) * gridSize);
		}

		if (obj.width % gridSize < gridSize / 2) {
			obj.setWidth(Math.floor(obj.width / gridSize) * gridSize);
		} else if (obj.width < gridSize) {
			obj.setWidth(gridSize);
		} else {
			obj.setWidth(Math.ceil(obj.width / gridSize) * gridSize);
		}

		if (obj.height % gridSize < gridSize / 2) {
			obj.setHeight(Math.floor(obj.height / gridSize) * gridSize);
		} else if (obj.height < gridSize) {
			obj.setHeight(gridSize);
		} else {
			obj.setHeight(Math.ceil(obj.height / gridSize) * gridSize);
		}
	}

	moveShadow() {
		this.shadow.setX(this.active.x);
		this.shadow.setY(this.active.y);
		this.shadow.setWidth(this.active.width);
		this.shadow.setHeight(this.active.height);
		this.shadow.color = "rgba(" + parseInt(this.active.color.substring(1, 3), 16) +
												", " + parseInt(this.active.color.substring(3, 5), 16) +
												", " + parseInt(this.active.color.substring(5, 7), 16) + ", 0.5)"; //transparency hack
		this.shadow.sprite = this.active.sprite;
		this.snapToGrid(this.shadow);
	}

	showColorPalette() {
		if (this.active !== false && !this.held)
		{
			new Rectangle(this.active.x + this.active.width + 10, this.active.y + 10, 10, 10).render();

			ctx.beginPath();
			ctx.lineWidth = 1;

			/*for (var red = 0; red <= 255; red+= 16) {
				for (var green = 0; green <= 255; green+= 16) {
					for (var blue = 0; blue <= 255; blue+= 16) {
						ctx.strokeStyle = "rgba(" + red + ", " + green + ", " + blue + ", 1)";
						ctx.lineTo(green, blue);
						ctx.stroke();
						//ctx.beginPath();
					}
				}
			}*/
		}
	}
}

var p1 = new Player(20, 20, gridSize * 2, gridSize * 2, getRandomColor, ["cowL", "cowR"]);
var creature = new Creature(20, 20, gridSize * 2, gridSize * 2, getRandomColor(), ["duckL", "duckR"]);
var editor = new Editor();
var moving;

window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	// get save data
	load('default');

	light = new Light(256, 256);
	light2 = new Light2(512, 512);
	//rectList.push(new MovingRectangle(256, 512, 32, 32, getRandomColor(), 2));

	document.addEventListener("keydown", keydown);
	document.addEventListener("keyup", keyup);
	document.addEventListener("click", click);
	document.addEventListener("mousedown", mousedown);
	document.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	document.addEventListener("dblclick", dblclick);

	setInterval(main, 1/60 * 1000);
}

function main() {
	//update
	p1.move();
	creature.move();
	for (var i = 0; i < rectList.length; i++) {
		if (rectList[i].type === "MovingRectangle") {
			rectList[i].act();
		}
	}
	//render
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//drawBG();
	//drawGrid();

	for (var i = rectList.length - 1; i >= 0; i--) {
		rectList[i].render();
	}

	ctx.globalAlpha = 0.5;
	editor.shadow.render(); //TODO cleanup
	ctx.globalAlpha = 1;
	p1.render();
	creature.render();
	drawMenu();
	//editor.showColorPalette();
	//light.render();


}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];
	return color;
}

function drawGrid() {

	var numLines = 0;
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.beginPath();
  for (x = 0; x <= canvas.width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
		numLines += 1;
	}
  for (y = 0; y <= canvas.height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
		numLines +=1;
  }

  ctx.stroke();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";

};

function drawMenu() {
	//add rectangles to list if first time TODO move to load
	if (menuList.length === 0) {
		menuList.push(new Rectangle(canvas.width - 220, 20, 200, 50));
		menuList.push(new Rectangle(canvas.width - 220, 90, 200, 50));
	}

	//draw back of buttons
	for (var i = 0; i < menuList.length; i++) {
		ctx.fillStyle = menuList[i].color;
		ctx.fillRect(menuList[i].x, menuList[i].y, menuList[i].width, menuList[i].height);
	}

	//draw text
	ctx.fillStyle = "#FFF"
	ctx.font = "30px Arial";
	ctx.fillText("Save", menuList[0].x + 60, menuList[0].y + 35);
	ctx.fillText("Load", menuList[1].x + 60, menuList[1].y + 35);
	ctx.fillStyle = "#000"
	ctx.strokeText("Save", menuList[0].x + 60, menuList[0].y + 35);
	ctx.strokeText("Load", menuList[1].x + 60, menuList[1].y + 35);

	//fps
	if (Date.now() - prevTime > 1000) {
		prevFps = fps;
		fps = 0;
		prevTime = Date.now();

	} else {
		fps += 1;
	}
	ctx.fillStyle = "#FFF"
	ctx.fillText(prevFps + ' fps', canvas.offsetLeft, canvas.offsetTop + 20);
	ctx.fillStyle = "#000"
	ctx.strokeText(prevFps + ' fps', canvas.offsetLeft, canvas.offsetTop + 20);
}

function keydown(e) {
	//move character
	if (e.keyCode === 37 || e.keyCode === 65) p1.keysDown[0] = 1; //left or a
	if (e.keyCode === 38 || e.keyCode === 87) p1.keysDown[1] = 1; //up or w
	if (e.keyCode === 39 || e.keyCode === 68) p1.keysDown[2] = 1; //right or d
	if (e.keyCode === 40 || e.keyCode === 83) p1.keysDown[3] = 1; //down or s
	if (e.keyCode === 16) keysDown[4] = 1; //shift
	//temp for changing speed
	if (e.keyCode === 187) p1.xVel += 1;
	if (e.keyCode === 189 && p1.xVel > 1) p1.xVel -= 1;
}

function keyup(e) {
	//move character
	if (e.keyCode === 37 || e.keyCode === 65) p1.keysDown[0] = 0;
	if (e.keyCode === 38 || e.keyCode === 87) p1.keysDown[1] = 0;
	if (e.keyCode === 39 || e.keyCode === 68) p1.keysDown[2] = 0;
	if (e.keyCode === 40 || e.keyCode === 83) p1.keysDown[3] = 0;
	if (e.keyCode === 16) keysDown[4] = 0; //shift
	//temp for changing speed
	if (e.keyCode === 187) p1.speed += 1;
	if (e.keyCode === 189 && p1.speed > 1) p1.speed -= 1;

}

function click(e) {
}

function mousedown(e) {
	var other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 1, 1).checkCollision();

	if (other !== false) {
		editor.setActive(other, e);
		editor.held = true;
	} else {
		editor.removeActive();
	}
	//TODO: make button list to clean this up?
	other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 1, 1).checkCollision(menuList[0]);
	if (other !== false) save(prompt("Enter name for save: "));
	other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 1, 1).checkCollision(menuList[1]);
	if (other !== false) load(prompt("Enter name for load: "));


}

function mousemove(e) {
	if (editor.active !== false && editor.held) { //currently dragging something
		editor.move(e);
	}
}

function mouseup(e) {
		editor.held = false;
		if (editor.active !== false) {
			editor.snapToGrid(editor.active);
		}
}

function dblclick(e) {
	var other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 0, 0).checkCollision();
	if (other !== false) {
		editor.recolor(other);
	} else {
		rectList.push(new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop));
	}
}

function save(saveKey) {

	state.rectList = rectList;
	localStorage.setItem(saveKey, JSON.stringify(state));
}

function load(saveKey) {
	state = JSON.parse(localStorage.getItem(saveKey));

	if (state === null) { //no save found
		rectList = [];
		rectList.push(new Rectangle(0, canvas.height - (gridSize * 2), canvas.width, gridSize * 2));
		p1.setX(0);
		p1.setY(0);
		state = {};
		state.rectList = rectList;
	} else {
		rectList = [];
		for (var i = 0; i < state.rectList.length; i++) {
			var check = state.rectList[i];
			if (check.type === "Rectangle") {
				rectList.push(new Rectangle(check.x, check.y, check.width, check.height, check.color));
			} else if (check.type === "MovingRectangle") {
				rectList.push(new MovingRectangle(check.x, check.y, check.width, check.height, check.color, check.speed, check.min, check.max));
			} else if (check.type === "Spike") {
				rectList.push(new Spike(check.x, check.y, check.width, check.height, check.color));
			}
		}
	}
}

window.onunload = function() {
	save('default');
}
