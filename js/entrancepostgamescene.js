class EntrancePostGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EntrancePostGameScene' });
  }

  preload() {
    this.load.image('entrance', 'assets/rooms/entrance.png');
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.audio('entranceMusic', 'assets/audio/circusLoop.wav');
  }

  create() {
    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'entrance').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(1152, 950, 'player').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);

    this.entranceMusic = this.sound.add('entranceMusic', { loop: true, volume: 0.4 });
    this.entranceMusic.play();

    this.controlsEnabled = false;
    this.cursors = this.input.keyboard.createCursorKeys();

    // 💬 Fixed-position warning and dialogue boxes
    this.warningBox = this.add.rectangle(this.scale.width / 2, this.scale.height - 100, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(4, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(99)
      .setVisible(false);

    this.warningText = this.add.text(this.scale.width / 2, this.scale.height - 100, "", {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(99)
      .setVisible(false);

    this.dialogueBox = this.add.rectangle(this.scale.width / 2, this.scale.height / 2 - 40, 600, 140, 0x000000, 0.9)
      .setStrokeStyle(3, 0xff0000)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(99)
      .setVisible(true);

    this.dialogueText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
      "Now you may see what's behind the STAFF door.", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(99)
      .setVisible(true);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.dialogueBox.setVisible(false);
      this.dialogueText.setVisible(false);
      this.controlsEnabled = true;
    });

    this.clown = this.add.image(0, 0, 'clown').setAlpha(0).setScale(4).setDepth(10);
    this.scheduleClownFlicker();

    this.input.keyboard.on('keydown-ESC', () => {
      this.entranceMusic.stop();
      this.scene.start('EntranceScene');
    });
  }

  update() {
    if (!this.controlsEnabled) return;

    this.player.setVelocity(0);
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    const x = this.player.x;
    const y = this.player.y;
    console.log(`Player X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);

    const atStaffDoor = x > 322 && x < 652 && Math.abs(y - 687) < 30;

    if (atStaffDoor) {
      this.showWarning("What's hiding behind this door?");
    } else {
      this.warningBox.setVisible(false);
      this.warningText.setVisible(false);
    }

    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'), 250)) {
      if (atStaffDoor) {
        this.entranceMusic.stop();
        this.scene.start('WinnerScene');
      }
    }
  }

  showWarning(message) {
    this.warningText.setText(message);
    this.warningText.setVisible(true);
    this.warningBox.setVisible(true);
  }

  scheduleClownFlicker() {
    const delay = Phaser.Math.Between(10000, 20000);
    this.time.delayedCall(delay, () => {
      this.flickerClown();
      this.scheduleClownFlicker();
    });
  }

  flickerClown() {
    const screenWidth = this.scale.width;
    const x = Phaser.Math.Between(0, screenWidth);
    const y = Phaser.Math.Between(687, 897);
    this.clown.setPosition(x, y).setAlpha(1);
    const duration = Phaser.Math.Between(3000, 5000);
    this.time.delayedCall(duration, () => {
      this.clown.setAlpha(0);
    });
  }
}

window.EntrancePostGameScene = EntrancePostGameScene;
