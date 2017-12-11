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
var p;
var currentRamp;

function preload(){
    collectSound = loadSound("collect.mp3");
}

function setup() {
    // no canvas needed
    noCanvas();

    // construct the A-Frame world
    // this function requires a reference to the ID of the 'a-scene' tag in our HTML document
    world = new World('VRScene');

    addObjects(worldEnd, 0, slope);
    world.setUserPosition(0, 0.5, 0);
    // AddSection(section);
    p = new Ground(0, 0, 0, 100, 500, -120);

    skySphereReference = select('#theSky');
}

function draw() {
    // document.getElementById("score").innerHTML = "Score: " + (score + bonus);
    // document.getElementById("hits").innerHTML = "Hits: " + hits;
    var pos = world.getUserPosition();

    for (var i = 0; i < coins.length; i++){
        if(coins[i].checkHit()){
            coins.splice(i, 1);
            i--;
            bonus += 50;
            collectSound.play();
        }
    }

    for (var i = 0; i < Ramps.length; i++){
        if(Ramps[i].checkHit()){
            currentRamp = Ramps[i];
        };
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

    userX = pos.x - xMove;
    xSpeed = zSpeed / 50;
    // console.log(rampHit);
	if (p.userIsOnGround()){
        if (!rampHit){
            zSpeed += 0.001;
            ySpeed = zSpeed * slope;
            userY = pos.y - ySpeed;

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
                if (pos.y - ySpeed < currentGround){
                    userY = currentGround;
                    rampHit = false;
                    fallSpeed = 0;
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
    // score = int(-userZ * 3);
    world.setUserPosition(userX, userY, userZ);
    skySphereReference.elt.object3D.position.set(userX, 0, userZ);
    p.plane.setHeight(p.plane.getHeight() + zSpeed * 2 * radicalThree);

    if (userZ <= worldEnd/2){
        var temp = worldEnd;
        worldEnd *= 2;
        addObjects(worldEnd, temp, slope);
    }
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

    this.userIsOnGround = function(){
        var pos = world.getUserPosition();
        var relativeZ = pos.z - this.z;
        var relativeGround = relativeZ * slope * -1 + this.y;
        return (Math.abs(pos.x - this.x) <= width/2 &&
            Math.abs(pos.y - (relativeGround)) <= 2 &&
            Math.abs(pos.z - this.z) <= this.length/2
        )
    }
}

function Obstacle(x, y, z, texture) {
    this.x = x;
    this.y = y;
    this.z = z;

    var selection = int(random(4));
    var scale = random(1) + 1.5;

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
        if (this.b !== undefined){
            var pos = world.getUserPosition();
            if (dist(this.x, this.y, this.z, pos.x, pos.y, pos.z) < 2){
                world.remove(this.b);
                zSpeed = 0.02;
                return true;
            }
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

    this.plane = new Plane({
        x:x, y:y, z:z,
        width:width, height:length,
        asset: 'snow',
        repeatX: width,
        repeatY: length,
        rotationX:angle
    });

    world.add(this.plane);

    this.userIsOnGround = function(){
        var pos = world.getUserPosition();
        var relativeZ = pos.z - this.z;
        var relativeGround = relativeZ * slope + this.y;
        return (Math.abs(pos.x - this.x) <= this.width/2 &&
            Math.abs(pos.z - this.z) <= this.plane.getHeight()/2
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