// variable to hold a reference to our A-Frame world
var world;
var userX = 0;
var userY = 0.2;
var userZ = 0;
var xSpeed = 0.002;
var zSpeed = 0.1;
var slope = 0.5773;
var sliding = false;
var fallSpeed = 0.05;
var falling = false;
var worldEnd = -1 * 125 * 1.73205080757;
var coins = [];
var Ramps = [];
var collectSound;
var section = 0;

function preload(){
	collectSound = loadSound("collect.mp3");
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
	var g = new Plane({
						x:0, y:0, z:0,
						width:100, height:500,
						asset: 'snow',
						repeatX: 100,
						repeatY: 500,
						rotationX:-120, metalness:0.25
					   });

	// add the plane to our world
	world.add(g);

	var test = new Ramp(
		0, 125 * -1, worldEnd
	);

	Ramps.push(test);
}

function draw() {
	// always move the player forward a little bit - their movement vector
	// is determined based on what they are looking at
	for (var i = 0; i < coins.length; i++){
		if(coins[i].checkHit()){
			coins.splice(i, 1);
			collectSound.play();
		}
	}

	for (var i = 0 ; i < Ramps.length; i++){
		if (Ramps[i].checkHit()){
			Ramps.splice(i, 1);
		}
	}

	if(!sliding){
		var xRotation = world.getUserRotation().y;
		var xMove = xSpeed * xRotation;
		var pos = world.getUserPosition();
		userX = pos.x - xMove;

		var ground = pos.z * slope;

		if(falling){
			userY = (pos.y - zSpeed * slope) - fallSpeed;
			fallSpeed += 0.01;

			if (userY <= ground){
				userY = ground + 0.5;
				falling = false;
				fallSpeed = 0.05;
			}
		}

		else{
			if (section % 2 == 0){
				userY = pos.y - zSpeed * slope;
			}
		}

		userZ = pos.z - zSpeed ;
		world.setUserPosition(userX, userY, userZ);

		if (pos.z < worldEnd){
			var temp = worldEnd;
			worldEnd += worldEnd;
			console.log("zPox: " + pos.z + " worldEnd: " + worldEnd);
			section += 1;

			if (section % 2 != 0){
				addObjects(worldEnd, temp, 1);
				console.log("Change slope");
			}

			else{
				addObjects(worldEnd, temp, slope);
			}

		}
	}

	else{
		var pos = world.getUserPosition();
	}
	// zSpeed += 0.001;

	// world.moveUserForward(0.01);
	// console.log(xRotation);
	// now evaluate
	// if (pos.z < worldEnd * -1) {
	// 	world.setUserPosition(0, 0.5, 0);
	// }
	// else if (pos.x < -50) {
	// 	world.setUserPosition(50, pos.y, pos.z);
	// }
	// if (pos.z > 50) {
	// 	world.setUserPosition(pos.x, pos.y, -50);
	// }
	// else if (pos.z < -50) {
	// 	world.setUserPosition(pos.x, pos.y, 50);
	// }
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

function Ramp(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;

    this.b = new Box({
        x:x, y: y, z:z,
        width: 60, height: 50, depth: 2,
        asset: 'snow',
        repeatX: 100,
        repeatY: 500,
        rotationX: -60
    });

    world.add(this.b);

    this.checkHit = function(){
        var pos = world.getUserPosition();
        if (this.x - pos.x <= 30 && Math.abs(this.z - pos.z) <= 1){
        	console.log(this.z - pos.z);
            world.remove(this.b);
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

		var selection = int(random(5));
		var scale = random(1) + 1.5;

		switch (selection){
			case 0:
			// create a box here
			var b = new Box({
							x:x,
							y:y,
							z:z,
							asset:t,
							scaleX: scale,
							scaleY: scale,
							scaleZ: scale
						});
			// add the box to the world
			world.add(b);
			break;

			case 1:
			var c = new Cone({
				x:x,
				y:y,
				z:z,
				asset:t,
				scaleX: scale,
				scaleY: scale,
				scaleZ: scale,
				radiusTop: 0,
				radiusBottom: 1
			});

			world.add(c);
			break;

			case 2:
			var d = new Dodecahedron({
				x:x,
				y:y,
				z:z,
				asset:t,
				scaleX: scale,
				scaleY: scale,
				scaleZ: scale
			});

			world.add(d);
			break;

			case 3:
			var s = new Sphere({
				x:x,
				y:y,
				z:z,
				asset:t,
				scaleX: scale,
				scaleY: scale,
				scaleZ: scale
			});

			world.add(s);
			break;

			case 4:
			var c = new Container3D({
				x:x,
				y:y,
				z:z,
			});

			for (var j = 0; j < 3; j++){
				var cylinder = new Cylinder({
					x:x + (-3 + j * 3),
					y:y,
					z:z,
					asset:t,
					scaleX: scale,
					scaleY: scale,
					scaleZ: scale
				});

				c.addChild(cylinder);
			}

			world.add(c)
			break;
		}

		x = random(-50, 50);
		z = random(limit, start);

		if (tilt == 1){
			y = (125 * (section + 1) * -1) + 1;
		}

		else{
			y = z * tilt;
		}

		var c = new Coin(x, y ,z);
		// c.addChild(T);
		// c.addChild(T2);
		coins.push(c);
	}
}