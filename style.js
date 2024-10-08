const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const up = document.getElementById("up");
const down = document.getElementById("down");
const right = document.getElementById("right");
const left = document.getElementById("left");

const ballz = [];
const wallz = [];

let LEFT, RIGHT, UP, DOWN;
let friction = 0.0;

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    unit(){
        if (this.mag() === 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x*n, start_y + this.y*n);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

class Ball{
    constructor(x, y, r, m){
        this.pos = new Vector(x, y);
        this.r = r;
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 1;
        this.velocity = 1;
        this.elasticity = 1;
        this.player = false;
        this.ballColor = "#FFFFFA";
        ballz.push(this);
    }

    drawBall() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        //ctx.fillStyle = "#FFFFFA";
        ctx.fillStyle = this.ballColor;
        ctx.fill();
    }
    display() {
        this.vel.drawVec(this.pos.x, this.pos.y, 10, "green");
        ctx.fillStyle = "black";
        ctx.fillText("m = "+this.m, this.pos.x-10, this.pos.y-5);
        ctx.fillText("e = "+this.elasticity, this.pos.x-10, this.pos.y+5);
    }

    reposition() {
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel);
    }
}

class Wall{
    constructor(x1, y1, x2, y2) {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        wallz.push(this);
    }

    drawWall() {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = "yellow";
        ctx.stroke();
    }

    wallUnit() {
        return this.end.subtr(this.start).unit();
    }
}

function keyControl(b) {

    up.addEventListener("touchstart", function(e) {
        UP = true;
    })

    up.addEventListener("touchend", function(e) {
        UP = false;
    })

    up.addEventListener("mousedown", function(e) {
        UP = true;
    })

    up.addEventListener("mouseup", function(e) {
        UP = false;
    })

    down.addEventListener("touchstart", function(e) {
        DOWN = true;
    })

    down.addEventListener("touchend", function(e) {
        DOWN = false;
    })

    down.addEventListener("mousedown", function(e) {
        DOWN = true;
    })

    down.addEventListener("mouseup", function(e) {
        DOWN = false;
    })

    left.addEventListener("touchstart", function(e) {
        LEFT = true;
    })

    left.addEventListener("touchend", function(e) {
        LEFT = false;
    })

    left.addEventListener("mousedown", function(e) {
        LEFT = true;
    })

    left.addEventListener("mouseup", function(e) {
        LEFT = false;
    })

    right.addEventListener("touchstart", function(e) {
        RIGHT = true;
    })

    right.addEventListener("touchend", function(e) {
        RIGHT = false;
    })

    right.addEventListener("mousedown", function(e) {
        RIGHT = true;
    })

    right.addEventListener("mouseup", function(e) {
        RIGHT = false;
    })

    canvas.addEventListener("keydown", function(e) {
        if (e.keyCode === 37) {
            LEFT = true;
        } else if (e.keyCode === 38) {
            UP = true;
        } else if (e.keyCode === 39) {
            RIGHT = true;
        } else if (e.keyCode === 40) {
            DOWN = true;
        }
    })
    
    canvas.addEventListener("keyup", function(e) {
        if (e.keyCode === 37) {
            LEFT = false;
        } else if (e.keyCode === 38) {
            UP = false;
        } else if (e.keyCode === 39) {
            RIGHT = false;
        } else if (e.keyCode === 40) {
            DOWN = false;
        }
    })
    
    if (LEFT) {
        b.acc.x = -b.acceleration;
    }
    if (UP) {
        b.acc.y = -b.acceleration;
    }
    if (RIGHT) {
        b.acc.x = b.acceleration;
    }
    if (DOWN) {
        b.acc.y = b.acceleration;
    }
    if (!UP && !DOWN) {
        b.acc.y = 0;
    }
    if (!RIGHT && !LEFT) {
        b.acc.x = 0;
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function closestPointBW(b1, w1) {
    let ballToWallStart = w1.start.subtr(b1.pos);
    if (Vector.dot(w1.wallUnit(), ballToWallStart) > 0) {
        return w1.start;
    }

    let wallEndToBall = b1.pos.subtr(w1.end);
    if (Vector.dot(w1.wallUnit(), wallEndToBall) > 0) {
        return w1.end;
    }

    let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
    let closestVec = w1.wallUnit().mult(closestDist);
    return w1.start.subtr(closestVec);
}

function round(number, precision) {
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}

function pen_res_bb(b1, b2) {
    let dist = b1.pos.subtr(b2.pos);
    let pen_depth = b1.r + b2.r - dist.mag();
    let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

function col_res_bb(b1, b2) {
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let newSepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);

    let vsep_diff = newSepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse);

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
}

function col_det_bb(b1, b2) {
    if (b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()) {
        return true;
    } else {
        return false;
    }
}

function col_det_bw(b1, w1) {
    let ballToClosest = closestPointBW(b1, w1).subtr(b1.pos);
    if (ballToClosest.mag() <= b1.r) {
        return true;
    }
}

function pen_res_bw(b1, w1) {
    let penVect = b1.pos.subtr(closestPointBW(b1, w1));
    b1.pos = b1.pos.add(penVect.unit().mult(b1.r-penVect.mag()));
}

function col_res_bw(b1, w1) {
    let normal = b1.pos.subtr(closestPointBW(b1, w1)).unit();
    let sepVel = Vector.dot(b1.vel, normal);
    let newSepVel = -sepVel * b1.elasticity;
    let vsep_diff = sepVel - newSepVel;
    b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ballz.forEach((b, index) => {
        b.drawBall();
        b.display();
        b.reposition();
        if (b.player === true) {
            keyControl(b);
        }

        wallz.forEach((w) => {
            if (col_det_bw(ballz[index], w)) {
                pen_res_bw(ballz[index], w);
                col_res_bw(ballz[index], w);
            }
        })

        for (let i = index+1; i < ballz.length; i++) {
            if (col_det_bb(ballz[index], ballz[i])) {
                pen_res_bb(ballz[index], ballz[i]);
                col_res_bb(ballz[index], ballz[i]);
            }
        }
    });

    wallz.forEach((w) => {
        w.drawWall();
    });

    requestAnimationFrame(mainLoop);
};

if (window.matchMedia("(max-height: 500px)").matches) {
    canvas.height = 280;
    for (let i = 0; i < 10; i++) {
        let newBall = new Ball(randInt(100,500), randInt(50,200), randInt(20,45), randInt(0,10));
        newBall.elasticity = randInt(0,10)/10;
    }
    let wall1 = new Wall(100, 100, 250, 200);
    let wall2 = new Wall(300, 180, 450, 80);
  } else {
    canvas.height = canvas.clientHeight;
    for (let i = 0; i < 10; i++) {
        let newBall = new Ball(randInt(100,500), randInt(50,400), randInt(20,50), randInt(0,10));
        newBall.elasticity = randInt(0,10)/10;
    }
    let wall1 = new Wall(200, 200, 400, 300);
    let wall2 = new Wall(350, 450, 450, 300);
  }

let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
let edge2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
let edge3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
let edge4 = new Wall(0, canvas.clientHeight, 0, 0);
ballz[0].player = true;
ballz[0].ballColor = "brown";
requestAnimationFrame(mainLoop);