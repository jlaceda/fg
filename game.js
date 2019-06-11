let FRAMECOUNT = 0;
let ATTACK_LENGTH = 10;

// keyboard stuff
const aKey = 65;
const dKey = 68;
const gKey = 71;

const leftKey = 37;
const rightKey = 39;
const num0Key = 48;

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
let gameState = SCENE.FIGHT;
let previousInput = INPUT.NOOP;
let inputBuffer = [];

let playerState = {
	state: PLAYER_STATE.STANDING,
	direction: DIRECTION.RIGHT,
}

// uses controlState
// writes to inputBuffer
document.onkeydown = function(e) {
	e.preventDefault();
	console.log(e);
	if (e.keyCode === gKey) {
		inputBuffer.push(INPUT.ATTACK);
	} else if (e.keyCode === aKey) {
		inputBuffer.push(INPUT.LEFT);
	} else if (e.keyCode === dKey) {
		inputBuffer.push(INPUT.RIGHT);
	} else {
		inputBuffer.push(INPUT.NOOP);
	}
	console.log(inputBuffer)
};

// shifts inputBuffer
// writes playerState
const playerControl = () => {
	console.log(inputBuffer)

	// do nothing if inputBuffer is empty
	if (inputBuffer.length < 1) {
		playerState.state = PLAYER_STATE.STANDING;
		return;
	}

	const input = inputBuffer.shift();

	switch (input) {
		case INPUT.ATTACK:
			if (!playerState.attacking) {
				playerState.state = PLAYER_STATE.ATTACKING;
			}
			break;
		case INPUT.RIGHT:
			if (playerState.direction === DIRECTION.RIGHT) {
				playerState.state = PLAYER_STATE.WALKING
			} else {
				playerState.direction = DIRECTION.RIGHT;
				playerState.state = PLAYER_STATE.STANDING;
			}
			break;
		case INPUT.LEFT:
			if (playerState.direction === DIRECTION.LEFT) {
				playerState.state = PLAYER_STATE.WALKING
			} else {
				playerState.direction = DIRECTION.LEFT;
				playerState.state = PLAYER_STATE.STANDING;
			}
			break;
		default:
			if (playerState.state === PLAYER_STATE.WALKING) {
				playerState.state = PLAYER_STATE.STANDING;
			}
			break;
	}
}

let { init, Sprite, GameLoop } = kontra;
let { canvas, context } = init();

context.imageSmoothingEnabled = false;

// reads playerState
const playerSprite = Sprite({
	x: 100,
	y: 100,
	color: 'grey',
	width: 20,
	height: 40,
	update: function() {

		if (playerState.state === PLAYER_STATE.ATTACKING) {
			this.color = 'red';
		} else {
			this.color = 'grey';
		}

		if (playerState.state === PLAYER_STATE.WALKING) {
			if (playerState.direction === DIRECTION.LEFT) {
				this.x--;
				return;
			}
			if (playerState.direction === DIRECTION.RIGHT) {
				this.x++;
				return;
			}
		}
	}
});

const update = () => {
	FRAMECOUNT++;
	playerControl();
	playerSprite.update();
};

const render = () => {
	playerSprite.render();
}

let loop = GameLoop({ update, render });

loop.start();