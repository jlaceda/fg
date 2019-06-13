let { init, Sprite, GameLoop, initKeys, keyPressed } = kontra;
let { canvas, context } = init();
let ws = new WebSocket("ws://127.0.0.1:8080");
context.imageSmoothingEnabled = false;
initKeys();

let FRAMECOUNT = 0;
let ATTACK_LENGTH = 10;

// enums
const DIRECTION = Object.freeze({
	"LEFT": 1, 
	"RIGHT": 2
});
const SCENE = Object.freeze({
	"FIGHT": 0,
	"MENU": 1,
	"END": 2
});
const INPUT = Object.freeze({
	"NOOP": 0,
	"LEFT": 1,
	"RIGHT": 2,
	"ATTACK": 3
});
const PLAYER_STATE = Object.freeze({
	"STANDING": 0,
	"WALKING": 1,
	"ATTACKING": 2,
	"STUN": 3
});

// STATES
let scene = SCENE.FIGHT;
let currentInput = INPUT.NOOP;

let playerId = 0;

// writes to inputBuffer
const getLocalButtons = () => {
	
	if (keyPressed('j')) {
		currentInput = INPUT.ATTACK;
	} else if (keyPressed('s')) {
		currentInput = INPUT.LEFT;
	} else if (keyPressed('f')) {
		currentInput = INPUT.RIGHT;
	} else {
		currentInput = INPUT.NOOP;
	}
}

const sendButtons = () => {
	ws.send(JSON.stringify({
		player: playerId,
		input: currentInput
	}));
}

let WORLD = {};

ws.onmessage = function(event) {
	var msg = JSON.parse(event.data);
	console.log(msg);
	if (msg.refused) {
		throw new Error("game is full");
	}
	if (msg.connected) {
		playerId = msg.playerId;
		return;
	}
	WORLD = msg;
}


// reads playerState
const playerSprite = Sprite({
	x: 50,
	y: 200,
	color: 'grey',
	width: 20,
	height: 40,
	anchor: {x:0.5, y:1},
	update: function() {

		if (WORLD['1'].state === PLAYER_STATE.ATTACKING) {
			this.color = 'red';
		} else {
			this.color = 'grey';
		}

		this.x = WORLD['1'].x;
	}
});

const player2Sprite = Sprite({
	x: 200,
	y: 200,
	color: 'grey',
	width: 20,
	height: 40,
	anchor: {x:0.5, y:1},
	update: function() {
		
		if (WORLD['2'].state === PLAYER_STATE.ATTACKING) {
			this.color = 'red';
		} else {
			this.color = 'grey';
		}

		this.x = WORLD['2'].x;
	}
});



const update = () => {
	getLocalButtons();
	sendButtons();
	playerSprite.update()
	player2Sprite.update()
};

const render = () => {
	playerSprite.render();
	player2Sprite.render()
}

let loop = GameLoop({ update, render });

ws.onopen = function (event) {
	console.log(event);
	loop.start();
}