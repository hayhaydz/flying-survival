var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
ctx.canvas.width = window.innerWidth /1.3;
ctx.canvas.height = window.innerHeight / 1.4;
var player = {x:50,y:canvas.height-500,r:25,yv:0,flying:false,colliding:false};
var container = {x:0,y:0,width:canvas.width,height:canvas.height - 25};
var grass = {x:0,y:canvas.height - 30,width:canvas.width,height:5};
var dirt = {x:0,y:canvas.height - 25,width:canvas.width,height:25};
var barrier = [{x:canvas.width + 50, y: 0, width:50, height: canvas.height / 5, xv:0, pointGained:false}, {x:canvas.width + 50,y:canvas.height / 2 - canvas.height / 10,width:50,height: canvas.height / 5 ,xv:0, pointGained:false}, {x:canvas.width + 50,y: canvas.height - (canvas.height / 5 + 20) ,width:50,height: canvas.height / 5 ,xv:0, pointGained:false}];
var score = {value:0,txt:document.getElementById('scoreTXT')};
var highScore = {value:0,txt:document.getElementById('highScoreTXT')};
var randomBarrierVelocityVar = [0.8,0.8,0.8];
randomBarrierVelocityVar[0] = generateRandomBarrier();
randomBarrierVelocityVar[1] = generateRandomBarrier();
randomBarrierVelocityVar[2] = generateRandomBarrier();


controller = {
    up:false,
    keyListener:function(e) {
        var key_state = (e.type == "keydown")?true:false;
        switch(e.keyCode) {
            //Spacebar
            case 32:
                e.preventDefault();
                controller.up = key_state;
            break;
            //Up arrow
            case 38:
                e.preventDefault();
                controller.up = key_state;
            break;
            //w key
            case 87:
                e.preventDefault();
                controller.up = key_state;
            break;
        }
    }
};

function containerDraw(){
    if (player.colliding) {
        ctx.fillStyle = "#c60731";
        ctx.fillRect(container.x, container.y, container.width, container.height);
    }
    else {
        ctx.fillStyle = "#52c1ea";
        ctx.fillRect(container.x, container.y, container.width, container.height);
    }

}

function groundDraw() {
    ctx.fillStyle = "#604406";
    ctx.fillRect(dirt.x, dirt.y, dirt.width, dirt.height);
    ctx.fillStyle = "#06660c";
    ctx.fillRect(grass.x, grass.y, grass.width, grass.height);
}

function playerDraw() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2, false);
    ctx.fillStyle = '#e86f25';
    ctx.fill();
}
function barrierDraw() {
    ctx.fillStyle = "#f4d992";

    for (let i = 0; i < barrier.length; i++) {
        ctx.fillRect(barrier[i].x, barrier[i].y, barrier[i].width, barrier[i].height);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    containerDraw();
    groundDraw();
    barrierDraw();
    playerDraw();

    //move player down
    player.yv += 0.6; //gravity
    player.y += player.yv;
    player.yv *= 0.9;

    //stop player moving down beyond ground
    if (player.y + player.r > grass.y) {
        player.y = grass.y - player.r;
        player.yv = 0;
    }

    if (player.y - player.r < container.y) {
        player.y = container.y + player.r;
        player.yv = 0;
    }

    //fly
    if (controller.up && player.flying == false) {
        player.flying = true;
        setInterval(fly, 250);
    }

    if (player.flying) {
        player.yv -= 1.5;
    }

    //move barrier left
    for (let i = 0; i < barrier.length; i++) {

        barrier[i].xv += parseFloat(randomBarrierVelocityVar[i]);
        barrier[i].x -= barrier[i].xv;
        barrier[i].xv *= 0.9;

        // console.log(barrier[i].xv);

        //reset barrier when it hits edge
        if (barrier[i].x  + barrier[i].width < 0) {

             //reset barrier Valuse

            randomBarrierVelocityVar[i] = generateRandomBarrier();

            barrier[i].x = canvas.width + barrier[i].width;
            barrier[i].y = barrier[i].y;
        }

        // add score
    if ((Math.ceil((player.x + player.r) / 10) * 10) == (Math.ceil((barrier[i].x + barrier[i].width) / 10) * 10) && !player.colliding) {
        if (!barrier[i].pointGained) {
            score.value += 1;
            score.txt.textContent = score.value;
            barrier[i].pointGained = true;
        }
    }
    else {
        barrier[i].pointGained = false;
    }

    // console.log(Math.ceil(barrier.x + barrier.width / 10) * 10);
    }

    //reset score when player hits barrier and set high score if score higher than last
    if (collisionDetection(player, barrier[0]) || collisionDetection(player, barrier[1]) || collisionDetection(player, barrier[2])) {
        player.colliding = true;

        if (score.value > highScore.value) {
            highScore.value = score.value;
            highScore.txt.textContent = highScore.value;
        }

        score.value = 0;
        score.txt.textContent = score.value;
    }
    else {
        player.colliding = false;
    }

    window.requestAnimationFrame(draw, canvas);
}

draw();

//Functions

function generateRandomBarrier() {
    let randomBarrierVelocity;

    randomBarrierVelocity = (Math.random() * (0.9 - 0.4) + 0.4).toFixed(1);

    for (let i = 0; i < randomBarrierVelocityVar.length; i++) {
        while (randomBarrierVelocity == randomBarrierVelocityVar[i]) {
            randomBarrierVelocity = (Math.random() * (0.9 - 0.4) + 0.4).toFixed(1);
        }
    }

    return randomBarrierVelocity;
}

function fly() {
    player.flying = false;
}

function collisionDetection(player, barrier) {
    var distX = Math.abs(player.x - barrier.x-barrier.width/2);
    var distY = Math.abs(player.y - barrier.y-barrier.height/2);

    if (distX > (barrier.width/2 + player.r)) { return false; }
    if (distY > (barrier.height/2 + player.r)) { return false; }

    if (distX <= (barrier.width/2)) { return true; }
    if (distY <= (barrier.height/2)) { return true; }

    var dx = distX-barrier.width/2;
    var dy = distY-barrier.height/2;
    return (dx*dx+dy<=(player.r*player.r));
}



window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(draw, canvas);

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                   window.mozRequestAnimationFrame    || 
                                   window.oRequestAnimationFrame      || 
                                   window.msRequestAnimationFrame     || 
                                   function(callback, element) {
                                     window.setTimeout(function() { callback(Date.now()); }, 1000 / 60);
                                   };
  }
  