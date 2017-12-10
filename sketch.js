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
var testMap = new GroundMap();
var groundPointer;

function preload(){
	collectSound = loadSound("collect.mp3");
}

function setup() {
	// no canvas needed
	noCanvas();

	// construct the A-Frame world
	// this function requires a reference to the ID of the 'a-scene' tag in our HTML document
	world = new World('VRScene');

	// addObjects(worldEnd, 0, slope);
	world.setUserPosition(0, 0.5, 0);
	AddSection(0);
	AddSection(1);
	AddSection(2);
	AddSection(3);
	AddSection(4);
	AddSection(5);
	AddSection(6);
}

function draw() {
	console.log(groundPointer.id);
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

	// console.log(currentGround);
	userX = pos.x - xMove;

	// if (rampHit) {
    if (groundPointer.id !== 'ramp') {
        zSpeed += 0.002;
    }

    if(groundPointer.id === 'ground'){
		rampHit = false;
    }

	xSpeed = zSpeed / 50;

	if (groundPointer.id === 'ground'){
        if (!groundPointer.userIsOnGround()) {
            ySpeed += fallSpeed;
            fallSpeed += 0.0001;
            var relativeZ = pos.z - groundPointer.z;
            var relativeGround = relativeZ * slope + groundPointer.y;
            if (pos.y > relativeGround && pos.y - ySpeed < relativeGround) {
				userY = relativeGround;
            }

            else{
                userY = pos.y - ySpeed;
            }
        }

        else {
            ySpeed = zSpeed * slope;
            userY = pos.y - ySpeed;
            fallSpeed = 0;
        }
	}

	else{
		if (groundPointer.id === 'ramp'){
			zSpeed -= 0.002;
			if (ySpeed > 0){
				ySpeed *= -1;
			}
            userY = pos.y - ySpeed;
        }

		else if (!groundPointer.userIsOnGround() || groundPointer.id === 'air'){
			ySpeed += fallSpeed;
			fallSpeed += 0.0001;
            userY = pos.y - ySpeed;
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
	this.id = 'ramp';
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
        var relativeGround = relativeZ * slope * -1 + this.y;
        return (Math.abs(pos.x - this.x) <= width/2 &&
            Math.abs(pos.y - (relativeGround + 0.5)) <= 0.5 &&
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
	this.id = 'ground';
	this.width = width;
	this.length = length;
	this.angle = angle;
	this.upperBound = (length/4 * radicalThree * -1) + this.z + 1;
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
				Math.abs(pos.y - (relativeGround + 0.5)) <= 0.5 &&
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
    this.id = 'air';
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
	this.length = 0;

	this.addGround = function(newGround){
		if (this.next === undefined){
			this.next = newGround;
			this.length += (newGround.upperBound - this.length);
		}
		else{
            var temp = this.next;
            while(temp.next !== undefined){
                temp = temp.next;
            }
            newGround.prev = temp;
            if (temp.id !== 'air'){
                newGround.lowerBound = temp.upperBound;
                temp.next = newGround;
                temp.upperBound = newGround.lowerBound;
                this.length += (newGround.upperBound - this.length);
			}

			else{
            	console.log("AIR");
            	temp.upperBound = newGround.lowerBound;
            	temp.next = newGround;
                this.length += (newGround.upperBound - this.length);
            }
		}

	}
}

function AddSection(section) {
	console.log("SECTION " + section);
    testGround = new Ground(0, -300 * section, testMap.length, 100, 500, -120);
    testMap.addGround(testGround);
    console.log(testMap.length);
    groundPointer = testMap.next;

    // var nextGround = new Ground(0, -300, section * -600, 100, 500, -120);

    // testRamp = (0, -125, worldEnd-2, )
	console.log(testMap.length / radicalThree);
    var test = new Ramp(
        0, -300 * section + -125, testMap.length - (2 * (section + 1)), 60, 50
    );
    test.lowerBound = testGround.upperBound;
    // groundPointer.next = test;
    testMap.addGround(test);
    // test.prev = groundPointer;
    // groundPointer.next.prev = groundPointer;

    var air = new Air(test.upperBound, testMap.length + -300);
    // groundPointer.next.next = air;
    testMap.addGround(air);
    // air.prev = groundPointer.next;
    // air.next = nextGround;
    // air.upperBound = nextGround.lowerBound;

    Ramps.push(test);
}