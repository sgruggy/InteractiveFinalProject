// variable to hold a reference to our A-Frame world
var world;
var userX = 0;
var userY = 0.2;
var userZ = 0;
var xSpeed = 0.002;
var zSpeed = 0.1;
var slope = 0.5773;
var radicalThree = 1.73205080757;
var ySpeed = zSpeed * slope;
var sliding = false;
var fallSpeed = 0.000001;
var falling = false;
var worldEnd = -1 * 125 * 1.73205080757;
var coins = [];
var Ramps = [];
var Obstacles = [];
var ground = [];
var groundMap = [];
var collectSound;
var section = 0;
var rampHit = false;
var score = 0;
var bonus = 0;
var hits = 0;
var testGround;
var testMap = new GroundMap();
var groundPointer;

function preload(){
	collectSound = loadSound("collect.mp3");
    for (var i = 0; i <= Math.floor(125 * 1.73205080757); i++){
        ground.push('plane');
        groundMap[i] = i * slope * -1;
    }

}

function setup() {
	// no canvas needed
	noCanvas();

	// construct the A-Frame world
	// this function requires a reference to the ID of the 'a-scene' tag in our HTML document
	world = new World('VRScene');

	// now that we have a world we can add elements to it using a series of wrapper classes
	// these classes are discussed in greater detail on the A-Frame P5 documentation site
	// http://cs.nyu.edu/~kapp/courses/cs0380fall2017/aframep5.php

	// what textures can we choose from?
	addObjects(worldEnd, 0, slope);
	world.setUserPosition(0, 0.5, 0);


	// create a plane to serve as our "ground"
	// var g = new Plane({
	// 					x:0, y:0, z:0,
	// 					width:100, height:500,
	// 					asset: 'snow',
	// 					repeatX: 100,
	// 					repeatY: 500,
	// 					rotationX:-120
	// 				   });
    //
	// // add the plane to our world
	// world.add(g);

	testGround = new Ground(0, 0, 0, 100, 500, -120);
	testMap.next = testGround;
	groundPointer = testMap.next;

	// var g2 =  new Plane({
     //    x:0, y:-300, z:-800,
     //    width:100, height:500,
     //    asset: 'snow',
     //    repeatX: 100,
     //    repeatY: 500,
     //    rotationX:-90
	// });
    //
	// world.add(g2);

	var nextGround = new Ground(0, -300, -800, 100, 500, -120);

	// testRamp = (0, -125, worldEnd-2, )
	var test = new Ramp(
		0, 125 * -1, worldEnd - 2, 60, 50
	);
	test.lowerBound = testGround.upperBound;
	groundPointer.next = test;
	groundPointer.next.prev = groundPointer;

	var air = new Air(test.upperBound, -550);
	groundPointer.next.next = air;
	air.prev = groundPointer.next;
	groundPointer.next.next.next = nextGround;
	console.log(groundPointer.next.next.next.upperBound);

    for(var i = 550; i < 1050; i++){
        ground[i] = 'plane';
        groundMap[i] = -300;
    }

	Ramps.push(test);
}

function draw() {
	console.log(groundPointer.upperBound);
	document.getElementById("score").innerHTML = "Score: " + (score + bonus);
	document.getElementById("hits").innerHTML = "Hits: " + hits;

	// always move the player forward a little bit - their movement vector
	// is determined based on what they are looking at

	var pos = world.getUserPosition();

	if (pos.z < groundPointer.upperBound){
		groundPointer = groundPointer.next;
	}

	else if (pos.z > groundPointer.lowerBound){
		groundPointer = groundPointer.prev;
	}

	for (var i = 0; i < coins.length; i++){
		if(coins[i].checkHit()){
			coins.splice(i, 1);
			i--;
			bonus += 50;
			collectSound.play();
		}
	}

	for (var i = 0; i < Ramps.length; i++){
		Ramps[i].checkHit();
	}

	for (var i = 0; i < Obstacles.length; i++){
		if (Obstacles[i].checkHit()){
			Obstacles.splice(i, 1);
			i--;
			hits++;
		}
	}

	var xRotation = world.getUserRotation().y;
	var xMove = xSpeed * xRotation;

	var currentGround = ground[Math.floor(pos.z * -1)];
	// console.log(currentGround);
	userX = pos.x - xMove;

	if (rampHit) {
		if(currentGround === 'ramp'){
			zSpeed -= 0.001;
		}
		if(currentGround === 'plane'){
			rampHit = false;
		}
    }

    else{
        ySpeed = zSpeed * slope;
        zSpeed += 0.001;
    }
	xSpeed = zSpeed / 50;

	if(falling){
		userY = (pos.y - zSpeed * slope) - fallSpeed;
		fallSpeed += 0.01;
	}

	else{
		if (currentGround === 'plane'){
            if (groundPointer.userIsOnGround()){
                userY = pos.y - ySpeed;
            }

            else if (pos.y - ySpeed < groundMap[Math.floor(pos.z* -1)] + 0.5){
            	userY = groundMap[Math.floor(pos.z* -1)] + 0.5
			}
		}

		else{
			if (currentGround === 'ramp'){
				ySpeed = zSpeed * slope;
			}

            userY = pos.y + ySpeed;
            	if (!groundPointer.userIsOnGround()){
                    ySpeed -= fallSpeed;
                    fallSpeed += 0.00001;
				}
		}
	}

	userZ = pos.z - zSpeed ;
	score = int(-userZ * 3);
	world.setUserPosition(userX, userY, userZ);
}

function Coin(x, y, z){
	this.x = x;
	this.y = y+1;
	this.z = z;

	this.t = new Torus({
		x:this.x,
		y:this.y,
		z:this.z,
		asset:'gold'
	});

	world.add(this.t);
	this.checkHit = function(){
		var pos = world.getUserPosition();
		if (dist(this.x, this.y, this.z, pos.x, pos.y, pos.z) < 2){
			world.remove(this.t);
			return true;
		}
	}
}

function Ramp(x, y, z, width, length){
	this.x = x;
	this.y = y;
	this.z = z;
	this.width = width;
	this.length = length;
	this.next = undefined;
	this.prev = undefined;
    this.upperBound = this.z - (length/4 * radicalThree);
    this.lowerBound = this.z + (length/4 * radicalThree);

    this.b = new Box({
        x:x, y: y, z:z,
        width: this.width, height: this.length, depth: 2,
        asset: 'snow',
        repeatX: 100,
        repeatY: 500,
        rotationX: -60
    });

    world.add(this.b);

    var start = ground.length;
    var limit = ground.length + Math.floor(25 * 1.73205080757);

    for (var i = start; i <= limit; i++){
    	ground.push('ramp');
    	groundMap[i] =  i * slope;
	}

    this.checkHit = function(){
        var pos = world.getUserPosition();
        if(!rampHit){
            if (this.x - pos.x <= 30 && Math.abs(this.z - pos.z) <= 1){
                rampHit = true;
                return true;
            }
		}
    }

    this.userIsOnGround = function(){
        var pos = world.getUserPosition();
        var relativeZ = pos.z - this.z;
        var relativeGround = relativeZ * slope + this.y;
        return (Math.abs(pos.x - this.x) <= width/2 &&
            pos.y >= relativeGround + 0.5 &&
            Math.abs(pos.z - this.z) <= length/2
        )
    }
}

function Obstacle(x, y, z, texture) {
    this.x = x;
    this.y = y;
    this.z = z;

    var selection = int(random(4));
    var scale = random(1) + 1.5;

    this.b = null;

    switch (selection){
        case 0:
            // create a box here
            this.b = new Box({
                x:x,
                y:y,
                z:z,
                asset:texture,
                scaleX: scale,
                scaleY: scale,
                scaleZ: scale
            });
            // add the box to the world
            world.add(this.b);
            break;

        case 1:
            this.b = new Cone({
                x:x,
                y:y,
                z:z,
                asset:texture,
                scaleX: scale,
                scaleY: scale,
                scaleZ: scale,
                radiusTop: 0,
                radiusBottom: 1
            });

            world.add(this.b);
            break;

        case 2:
            this.b = new Dodecahedron({
                x:x,
                y:y,
                z:z,
                asset:texture,
                scaleX: scale,
                scaleY: scale,
                scaleZ: scale
            });

            world.add(this.b);
            break;

        case 3:
            this.b = new Sphere({
                x:x,
                y:y,
                z:z,
                asset:texture,
                scaleX: scale,
                scaleY: scale,
                scaleZ: scale
            });

            world.add(this.b);
            break;
    }

    this.checkHit = function(){
        var pos = world.getUserPosition();
        if (dist(this.x, this.y, this.z, pos.x, pos.y, pos.z) < 2){
            console.log(this.z - pos.z);
            world.remove(this.b);
            zSpeed = 0.02;
            return true;
        }
    }
}


function addObjects(limit, start, tilt){
	var textures = ['iron', 'stone', 'gold'];
	// create lots of boxes
	for (var i = 0; i < 100; i++) {
		// pick a location
		var x = random(-50, 50);
		var z = random(limit, start);
		var y;

		if (tilt == 1){
			y = (125 * (section) * -1);
		}

		else{
			y = z * tilt;
		}

		// pick a random texture
		var t = textures[ int(random(textures.length-1)) ];

		var obstacle = new Obstacle(x, y, z, t);
		Obstacles.push(obstacle);

		x = random(-50, 50);
		z = random(limit, start);

		if (tilt == 1){
			y = (125 * (section + 1) * -1) + 1;
		}

		else{
			y = z * tilt;
		}

		var c = new Coin(x, y ,z);
		coins.push(c);
	}
}

function Ground(x, y, z, width, length, angle){
	this.x = x;
	this.y = y;
	this.z = z;
	this.width = width;
	this.length = length;
	this.angle = angle;
	this.upperBound = (length/4 * radicalThree * -1) + this.z;
	this.lowerBound = this.z - (length/4 * radicalThree * -1);
	this.next = undefined;
	this.prev = undefined;

	var p = new Plane({
		x:x, y:y, z:z,
        width:width, height:length,
        asset: 'snow',
        repeatX: width,
        repeatY: length,
        rotationX:angle
	});

	world.add(p);

	this.userIsOnGround = function(){
		var pos = world.getUserPosition();
		var relativeZ = pos.z - this.z;
		var relativeGround = relativeZ * slope + this.y;
		return (Math.abs(pos.x - this.x) <= width/2 &&
				pos.y >= relativeGround + 0.5 &&
				Math.abs(pos.z - this.z) <= length/2
				)
	}

	this.addGround = function(newGround){
		this.next = newGround;
	}
}

function Air(start, end){
    this.upperBound = end;
    this.lowerBound = start;
    this.next = undefined;
    this.prev = undefined;

    this.userIsOnGround = function(){
        return false
    };

    this.addGround = function(newGround){
        this.next = newGround;
    }
}

function GroundMap(){
	this.next = undefined;

	// this.addGround = function(newGround){
	// 	var temp = this.next;
	// 	while(this.next !== undefined){
	// 		temp = temp.next;
	// 	}
	// 	temp.next = newGround;
	// }
}