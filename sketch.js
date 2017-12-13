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
var fallSpeed = 0.000001;
var worldEnd = -400;
var coins = [];
var Ramps = [];
var Obstacles = [];
var ground = [];
var collectSound;
var section = 0;
var rampHit = false;
var obstacleHit = false;
var justHit = false;
var angle;
var score = 0;
var bonus = 0;
var hits = 0;
var groundPointer;
var p;
var p2;
var p3;
var currentRamp;
var fallen = false;
var grounds = [];
var groundEnd = 0;
var groundDepth = 0;
var groundPointer;
var groundIndex = 0;
var xOff = 0.0;

function preload(){
    collectSound = loadSound("collect.mp3");
}

function setup() {
    // no canvas needed
    noCanvas();
    noiseDetail(24);

    // construct the A-Frame world
    // this function requires a reference to the ID of the 'a-scene' tag in our HTML document
    world = new World('VRScene');

    // addObjects(worldEnd, 0, slope);
    world.setUserPosition(0, 0.5, 0);
    // AddSection(section);
    var offSet = noise(xOff) * 10;
    var r = map(offSet, 0, 10, -50, 50);
    xOff += 1;
    p = new Ground(0, 0, 0, 50, 50, -120);
    var temp = groundEnd;
    groundEnd -= (25 * radicalThree);
    addObjects(groundEnd + (12.5 * radicalThree), temp, 0);
    groundDepth -= (25);

    offSet = noise(xOff) * 10;
    r = map(offSet, 0, 10, -50, 50);
    xOff += 1;
	p2 = new Ground(r, groundDepth, groundEnd, 50, 50, -120);
    temp = groundEnd;
    groundEnd -= (25 * radicalThree);
    addObjects(groundEnd + (12.5 * radicalThree) , temp, r);
	groundDepth -= 25;

    offSet = noise(xOff) * 10;
    r = map(offSet, 0, 10, -50, 50);
    xOff += 1;
    p3 = new Ground(r, groundDepth , groundEnd, 50, 50, -120);
    temp = groundEnd;
    groundEnd -= (25 * radicalThree);
    addObjects(groundEnd + (12.5 * radicalThree), temp, r);
    groundDepth -= (25);

    grounds.push(p);
    grounds.push(p2);
    grounds.push(p3);

    groundPointer = grounds[groundIndex];
    skySphereReference = select('#theSky');
}

function draw() {
    document.getElementById("score").innerHTML = "Score: " + (score + bonus);
    document.getElementById("hits").innerHTML = "Hits: " + hits;
    var pos = world.getUserPosition();

    if (groundPointer.z - pos.z >= 12.5 * radicalThree){
        groundIndex++;
        console.log(groundIndex);
        groundPointer = grounds[groundIndex];
    }

    if ((pos.z/2) * radicalThree <= groundEnd + 800){
        // world.remove(groundPointer.plane);
        var offSet = noise(xOff) * 10;
        var r = map(offSet, 0, 10, -50, 50);
        xOff += 1;
        var next = new Ground(r, groundDepth, groundEnd, 50, 50, -120);
        grounds.push(next);
        var temp = groundEnd;
        groundEnd -= (25 * radicalThree);
        addObjects(groundEnd + (12.5 * radicalThree), temp, r);
        groundDepth -= (25);
    }

    for (var i = 0; i < coins.length; i++){
        if(coins[i].checkHit()){
            coins.splice(i, 1);
            i--;
        }
    }

    for (i = 0; i < Ramps.length; i++){
        if(Ramps[i].checkHit()){
            currentRamp = Ramps[i];
        }

        if(Ramps[i].checkRemove()){
			Ramps.splice(i, 1);
			i--;
		}
    }

    for (i = 0; i < Obstacles.length; i++){
        if (Obstacles[i].checkHit()){
            Obstacles.splice(i, 1);
            i--;
        }
    }

    var xRotation = world.getUserRotation().y;
    var xMove = xSpeed * xRotation;

    userX = pos.x - xMove;
    xSpeed = zSpeed / 50;

	if ((groundPointer.userIsOnGround() || groundPointer.userIsOverGround()) && !fallen){
        if (!rampHit && !obstacleHit){
            if (zSpeed < 1.5) {
              zSpeed += 0.001;
            }
            ySpeed = zSpeed * slope;
            userY = pos.y - ySpeed;

            if(groundPointer.userIsAwayFromGround()){
            	fallen = true;
			      }

        }

        else if (!rampHit) {
          console.log(justHit);
          if (justHit) {
            zSpeed *= 0.5;
            angle = random(-.5,.5);
            ySpeed = zSpeed * slope * random(.5, .75);
            userY = pos.y - ySpeed;
            justHit = false;
          }

          else {
            xMove = zSpeed / 50 + angle;
            userX = userX - xMove;
            ySpeed = zSpeed * slope * -1 + fallSpeed;
            fallSpeed += 0.01;
            var currentGround = pos.z * slope + 0.5;
            if (pos.y - ySpeed < currentGround){
                userY = currentGround;
                obstacleHit = false;
                fallSpeed = 0;
            }
            else{
                userY = pos.y - ySpeed;
            }
          }
        }

        else{
            if(currentRamp.userIsOnGround()){
                zSpeed -= 0.001;
                ySpeed = zSpeed * slope * -1;
                userY = pos.y - ySpeed;
            }

            else{
                ySpeed = zSpeed * slope * -1 + fallSpeed;
                fallSpeed += 0.01;
                var currentGround = pos.z * slope + 0.5;
                if (pos.y - ySpeed < currentGround && !groundPointer.userIsAwayFromGround()){
                    userY = currentGround;
                    rampHit = false;
                    fallSpeed = 0;
                }

                else if (pos.y - ySpeed < currentGround && groundPointer.userIsAwayFromGround()){
                	fallen = true;
				}

                else{
                    userY = pos.y - ySpeed;
                }
            }
        }
	}

	else{
		ySpeed += fallSpeed;
		fallSpeed += 0.001;
		userY = pos.y - ySpeed;
	}


    userZ = pos.z - zSpeed ;
    score = int(-userZ * 3);
    world.setUserPosition(userX, userY, userZ);
    skySphereReference.elt.object3D.position.set(0, 0, userZ);
    // p.plane.setHeight(p.plane.getHeight() + zSpeed * 2 * radicalThree);
    var relativeZ = pos.z - this.z;
    var relativeGround = relativeZ * slope * -1 + this.y;
}

function Coin(x, y, z, diamond){
    this.x = x;
    this.y = y+1;
    this.z = z;
    this.diamond = diamond;
    this.texture = undefined;

    if (this.diamond){
        this.texture = 'diamond';
    }
    else{
        this.texture = 'gold';
    }

    this.t = new Torus({
        x:this.x,
        y:this.y,
        z:this.z,
        asset:this.texture
    });

    world.add(this.t);
    this.checkHit = function(){
    	this.t.spinY(2);
        var pos = world.getUserPosition();
        if (dist(this.x, this.y, this.z, pos.x, pos.y, pos.z) < 2){
            bonus += 50;
            collectSound.play();
            zSpeed += 0.005;
            if (this.diamond){
                fallSpeed -= 1;
            }
            return true;
        }

        else if (pos.z - this.z < -10){
            world.remove(this.t);
            return true;
		}
    }
}

function Ramp(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = 'ramp';
    this.width = 5;
    this.length = 5;
    this.upperBound = this.z - (length/4 * radicalThree);
    this.lowerBound = this.z + (length/4 * radicalThree);
    this.hit = false;

    this.b = new Box({
        x:x, y: y, z:z,
        width: this.width, height: this.length, depth: 0.5,
        asset: 'wood',
        rotationX: -60
    });

    world.add(this.b);

    this.checkHit = function(){
        var pos = world.getUserPosition();
        // if(!this.hit){
        if (Math.abs(this.x - pos.x) <= this.length/2 && Math.abs(this.z - pos.z) <= 1){
            console.log("HIT");
            rampHit = true;
            this.hit = true;
            return true;
            // }
        }
    }

    this.checkRemove = function(){
    	var pos = world.getUserPosition();
        if (pos.z - this.z < -10){
            world.remove(this.b);
            return true;
        }
	}

    this.userIsOnGround = function(){
        var pos = world.getUserPosition();
        var relativeZ = pos.z - this.z;
        var relativeGround = relativeZ * slope * -1 + this.y;
        return (Math.abs(pos.x - this.x) <= (width/2 + 3) &&
            Math.abs(pos.y - (relativeGround)) <= 2 &&
            Math.abs(pos.z - this.z) <= this.length/2
        )
    }
}

function Obstacle(x, y, z, texture) {
    this.x = x;
    this.y = y;
    this.z = z;

    var selection = int(random(7));
    var scale = random(1, 3);

    this.b = undefined;
    this.r = undefined;

    switch (selection){
        case 0:
            // create a box here
            // this.b = new Box({
            //     x:x,
            //     y:y,
            //     z:z,
            //     asset:texture,
            //     scaleX: scale,
            //     scaleY: scale,
            //     scaleZ: scale
            // });
            // // add the box to the world
            // world.add(this.b);
            this.r = new Ramp(this.x, this.y, this.z);
            Ramps.push(this.r);
            break;

        case 1:
        case 2: case 5:
        case 3: case 6:
        case 4:
            this.b = new DAE({
            		asset: 'tree',
            		x:x,
            		y:y,
            		z:z,
                rotationX:-30,
            		scaleX:scale,
            		scaleY:scale,
            		scaleZ:scale,
          	});

            world.add(this.b);
            break;
    }

    this.checkHit = function(){
        if (this.b !== undefined){
            var pos = world.getUserPosition();
            if (dist(this.x, this.z, pos.x,pos.z) < 1 && pos.y < this.y + 7){
                world.remove(this.b);
                hits++;
                obstacleHit = true;
                justHit = true;
                return true;
            }

            else if (pos.z - this.z < -10){
            	world.remove(this.b);
            	return true;
			}
        }
    }
}


function addObjects(limit, start, offset){
    var textures = ['iron', 'stone', 'gold'];
    // create lots of boxes
    for (var i = 0; i < (start - limit)/4; i++) {
        // pick a location
        var x = random(-22.5, 22.5) + offset;
        var z = random(limit, start);
        var y = z * slope;
        // pick a random texture
        var t = textures[ int(random(textures.length-1)) ];

        var obstacle = new Obstacle(x, y, z, t);
        Obstacles.push(obstacle);

        if (i % 2 == 0){
            x = random(-37.5, 37.5) + offset;
            z = random(limit, start);
            var roll = random(1);
            if (roll >= .75 || Math.abs(x) > 25){
                y = z * slope + random(5) + 5;;
                var c = new Coin(x, y ,z, true);
                coins.push(c);
            }
            else{
                y = z * slope;
                var c = new Coin(x, y ,z, false);
                coins.push(c);
            }
		}
    }
}

function Ground(offset, y, z, width, length, angle){
    this.x = offset;
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

    this.plane = new Plane({
        x:this.x, y:this.y, z:this.z,
        width:width, height:length,
        asset: 'snow',
        repeatX: width,
        repeatY: length,
        rotationX:angle,
		side:'double'
    });

    world.add(this.plane);

    this.userIsOnGround = function(){
        var pos = world.getUserPosition();
        var relativeZ = pos.z - this.z;
        var relativeGround = relativeZ * slope + this.y;
        return (Math.abs(pos.x - this.x) <= this.width/2 + 3 &&
				Math.abs(pos.y - relativeGround) <= .51 &&
            Math.abs(pos.z - this.z) <= this.plane.getHeight()/2
        );
    }

    this.userIsOverGround = function(){
        var pos = world.getUserPosition();
        var relativeZ = pos.z - this.z;
        var relativeGround = relativeZ * slope + this.y;
        return (pos.y - relativeGround > .49);
	}

	this.userIsAwayFromGround = function(){
        var pos = world.getUserPosition();
        return !(Math.abs(pos.x - this.x) <= this.width/2 + 3);
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

function AddSection(section) {
    testGround = new Ground(0, -300 * section, testMap.length, 100, 500, -120);
    testMap.addGround(testGround);
    groundPointer = testMap.next;

    // var nextGround = new Ground(0, -300, section * -600, 100, 500, -120);

    // testRamp = (0, -125, worldEnd-2, )
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
