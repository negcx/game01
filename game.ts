import Phaser from 'phaser';

let platforms;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let bombs;
let stars;

let score = 0;
let scoreText;

let velocity = 300;

let gameOver = false;

class GameScene extends Phaser.Scene {
    constructor() {
        super('main');
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    resetStar(star) {
        const x = Phaser.Math.Between(0, 800);
        star.setX(x);
        star.setY(Phaser.Math.Between(-600, 0));
        star.setVelocity(0, 0);
    }

    create() {
        cursors = this.input.keyboard!.createCursorKeys();

        this.add.image(400, 300, 'sky');

        platforms = this.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        // Player
        player = this.physics.add.sprite(100, 450, 'dude');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.body.setGravityY(300);
        player.body.setSize(20, 38);
        player.body.setOffset(6, 8);
        this.physics.add.collider(player, platforms);

        this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }], frameRate: 20 });
        this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

        // Stars
        stars = this.physics.add.group({
            key: 'star',
            repeat: 4
        });

        this.physics.add.collider(stars, platforms);

        const scene = this;

        stars.children.iterate(function (child) {
            child.setCollideWorldBounds(true);
            child.setBounce(Phaser.Math.FloatBetween(0.5, 1.0));
            scene.resetStar(child);
        });


        this.physics.add.overlap(player, stars, this.collectStar, undefined, this);

        // Bombs
        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(player, bombs, hitBomb, undefined, this);

        // Score
        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px' });
    }

    update() {
        if (gameOver) { return; }
        if (cursors.left.isDown) {
            player.setVelocityX(-velocity);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(velocity);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-velocity);
        }
    }

    collectStar(player, star) {
        this.resetStar(star);
        score += 1;
        scoreText.setText("Score: " + score);

        if (score % 10 == 0) {
            const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            let bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }
}



const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [GameScene],
    scale: { mode: Phaser.Scale.FIT }
}

let game = new Phaser.Game(config);

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}