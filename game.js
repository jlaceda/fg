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
let previousInput = INPUT.NOOP;
let inputBuffer = [];

let playerState = {
	state: PLAYER_STATE.STANDING,
	direction: DIRECTION.RIGHT,
}

let player2State = {
	state: PLAYER_STATE.STANDING,
	direction: DIRECTION.RIGHT,
}

// writes to inputBuffer
const getLocalButtons = () => {
	console.log('getLocalButtons');
	if (keyPressed('j')) {
		inputBuffer.push(INPUT.ATTACK);
	} else if (keyPressed('s')) {
		inputBuffer.push(INPUT.LEFT);
	} else if (keyPressed('f')) {
		inputBuffer.push(INPUT.RIGHT);
	} else {
		inputBuffer.push(INPUT.NOOP);
	}
}

const sendButtons = () => {
	console.log('sendButtons');
	ws.send(JSON.stringify({
		type: 'BUTTONS',
		frame: FRAMECOUNT,
		inputBuffer: inputBuffer
	}));
}

// shifts inputBuffer
// writes playerState
const playerControl = () => {
	console.log('playerControl');
	// do nothing if inputBuffer is empty
	if (inputBuffer.length < 1) {
		return;
	}

	const input = inputBuffer[0];

	switch (input) {
		case INPUT.ATTACK:
			if (!playerState.attacking) {
				playerState.state = PLAYER_STATE.ATTACKING;
			}
			break;
		case INPUT.RIGHT:
			playerState.direction = DIRECTION.RIGHT
			playerState.state = PLAYER_STATE.WALKING
			break;
		case INPUT.LEFT:
			playerState.direction = DIRECTION.LEFT
			playerState.state = PLAYER_STATE.WALKING
			break;
		default:
			if (playerState.state === PLAYER_STATE.WALKING
				|| playerState.state === PLAYER_STATE.ATTACKING) {
				playerState.state = PLAYER_STATE.STANDING;
			}
			break;
	}
}


ws.onmessage = function(event) {
	var msg = JSON.parse(JSON.parse(event.data));
	if (msg.inputBuffer) {
		var input = msg.inputBuffer[0];
		switch (input) {
			case INPUT.ATTACK:
				if (!player2State.attacking) {
					player2State.state = PLAYER_STATE.ATTACKING;
				}
				break;
			case INPUT.RIGHT:
					player2State.direction = DIRECTION.RIGHT
					player2State.state = PLAYER_STATE.WALKING
				break;
			case INPUT.LEFT:
					player2State.direction = DIRECTION.LEFT
					player2State.state = PLAYER_STATE.WALKING
				break;
			default:
				if (player2State.state === PLAYER_STATE.WALKING
					|| player2State.state === PLAYER_STATE.ATTACKING) {
						player2State.state = PLAYER_STATE.STANDING;
				}
				break;
		}
	}
}

const player2Control = () => {
	console.log('player2Control');
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
		console.log('playerSprite.update');
		this.advance();

		if (playerState.state === PLAYER_STATE.ATTACKING) {
			this.color = 'red';
		} else {
			this.color = 'grey';
		}

		if (playerState.state === PLAYER_STATE.WALKING) {
			if (playerState.direction === DIRECTION.LEFT) {
				this.dx = -2.5;
			}
			if (playerState.direction === DIRECTION.RIGHT) {
				this.dx = 2.5;
			}
		} else {
			this.dx = 0;
		}
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
		console.log('playerSprite.update');
		this.advance();

		if (player2State.state === PLAYER_STATE.ATTACKING) {
			this.color = 'red';
		} else {
			this.color = 'grey';
		}

		if (player2State.state === PLAYER_STATE.WALKING) {
			if (player2State.direction === DIRECTION.LEFT) {
				this.dx = -2.5;
			}
			if (player2State.direction === DIRECTION.RIGHT) {
				this.dx = 2.5;
			}
		} else {
			this.dx = 0;
		}
	}
});

const update = () => {
	FRAMECOUNT++;
	getLocalButtons();
	playerControl();
	playerSprite.update();
	player2Sprite.update()
	sendButtons();
	const _ = inputBuffer.shift();
};

const render = () => {
	playerSprite.render();
	player2Sprite.render()
}

let loop = GameLoop({ update, render });

ws.onopen = function (event) {
	loop.start();
}