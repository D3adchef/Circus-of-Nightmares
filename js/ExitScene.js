class ExitScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ExitScene' });
  }

  preload() {
    this.load.image('exit', 'assets/rooms/exit.png');
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.audio('jack', 'assets/audio/jack.mp3');
    this.load.audio('balloon', 'assets/audio/balloon.wav');
    this.load.audio('crash', 'assets/audio/crash.wav');
    this.load.audio('door', 'assets/audio/door.wav');
    this.load.audio('clap', 'assets/audio/clap.wav');
    this.load.audio('fail', 'assets/audio/fail.mp3');
  }

  create() {
    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'exit').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(161, 840, 'player').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.timerBackground = this.add.rectangle(2100, 30, 160, 50, 0x000000, 0.6)
      .setOrigin(1, 0).setStrokeStyle(3, 0xff0000);
    this.timerText = this.add.text(2100, 30, '', {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#ff0000'
    }).setOrigin(1, 0);

    this.music = this.sound.add('jack', { loop: true, volume: 0.4 });
    this.music.play();

    this.interactBox = this.add.rectangle(1152, 700, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(3, 0xffffff).setOrigin(0.5).setVisible(true);
    this.interactText = this.add.text(1152, 700, "You made it out... but the circus remembers.", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5).setVisible(true);

    this.step = 0;
    this.controlsEnabled = false;
    this.justStarted = true;

    this.input.keyboard.once('keydown-SPACE', () => {
      this.interactBox.setVisible(false);
      this.interactText.setVisible(false);
      this.controlsEnabled = true;
      this.time.delayedCall(300, () => {
        this.justStarted = false;
      });
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled || this.justStarted) return;

      const x = this.player.x;
      const y = this.player.y;

      if (x >= 1544 && x <= 2041 && y >= 500 && y <= 617 && this.step < 4) {
        this.sound.play('fail');
        this.showInteraction("Not so fast, Pal.");
        return;
      }

      if (x >= 1290 && x <= 1600 && y >= 730 && y <= 897 && this.step === 0) {
        this.sound.play('balloon');
        this.showInteraction("There's nothing here but weird smells and busted balloons.");
        this.step = 1;
      } else if (x >= 818 && x <= 980 && y >= 530 && y <= 670 && this.step === 1) {
        this.sound.play('crash');
        this.showInteraction("I heard something move by the exit door.");
        this.step = 2;
      } else if (x >= 1110 && x <= 1268 && y >= 503 && y <= 623 && this.step === 2) {
        this.sound.play('crash');
        this.showInteraction("I heard another noise near the exit.");
        this.step = 3;
      } else if (x >= 234 && x <= 670 && y >= 600 && y <= 713 && this.step === 3) {
        this.sound.play('door');
        this.showInteraction("I heard the door unlock.");
        this.step = 4;
      } else if (x >= 1544 && x <= 2041 && y >= 500 && y <= 617 && this.step === 4) {
        this.sound.play('clap');
        this.showInteraction("I can't believe I'm free.");
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.time.delayedCall(1500, () => {
          this.music.stop();
          this.scene.start("EntrancePostGameScene");
        });
      } else {
        this.sound.play('fail');
        this.showInteraction("The door just locked.");
      }
    });

    this.clown = this.add.image(0, 0, 'clown').setScale(4).setVisible(false);
    this.time.addEvent({
      delay: Phaser.Math.Between(5000, 9000),
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(300, 2000);
        const y = Phaser.Math.Between(687, 897);
        this.clown.setPosition(x, y).setVisible(true);
        this.time.delayedCall(Phaser.Math.Between(3000, 5000), () => {
          this.clown.setVisible(false);
        });
      }
    });

    // ESC to return to EntranceScene
    this.input.keyboard.on('keydown-ESC', () => {
      this.music.stop();
      this.scene.start('EntranceScene');
    });
  }

  update() {
    if (!this.controlsEnabled) return;

    if (window.GameTimer.getRemaining() <= 0) {
      this.music.stop();
      this.scene.start("LairScene");
      return;
    }

    this.player.setVelocity(0);
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
    }
    if (this.cursors.up.isDown) this.player.setVelocityY(-200);
    else if (this.cursors.down.isDown) this.player.setVelocityY(200);

    const x = this.player.x.toFixed(2);
    const y = this.player.y.toFixed(2);
    console.log(`Player X: ${x}, Y: ${y}`);

    const remaining = window.GameTimer.getRemaining();
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    this.timerText.setText(`${minutes}:${(seconds % 60).toString().padStart(2, '0')}`);
  }

  showInteraction(message) {
    this.interactText.setText(message);
    this.interactText.setVisible(true);
    this.interactBox.setVisible(true);
    this.time.delayedCall(2500, () => {
      this.interactText.setVisible(false);
      this.interactBox.setVisible(false);
    });
  }
}

window.ExitScene = ExitScene;
