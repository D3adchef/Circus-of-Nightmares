class StorageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StorageScene' });
  }

  preload() {
    this.load.image('storage', 'assets/rooms/storageroom.png');
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.audio('moan', 'assets/audio/moan.wav');
    this.load.audio('clown', 'assets/audio/clown.wav');
    this.load.audio('storageMusic', 'assets/audio/storage.mp3');
  }

  create() {
    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'storage').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(955, 890, 'player').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);
    this.cursors = this.input.keyboard.createCursorKeys();

    if (!window.GameTimer.start) {
      window.GameTimer.start = Date.now();
    }

    // 🕒 Fixed-position timer
    this.timerText = this.add.text(this.scale.width - 20, 20, '', {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#ff0000'
    }).setScrollFactor(0).setOrigin(1, 0).setDepth(99);

    // 💬 Fixed-position intro box
    this.introBox = this.add.rectangle(this.scale.width / 2, 240, 1400, 140, 0x000000, 0.85)
      .setStrokeStyle(4, 0xff00ff).setOrigin(0.5).setScrollFactor(0).setDepth(99);
    this.introText = this.add.text(this.scale.width / 2, 240,
      "Good luck figuring out how to get to the nail before the clown gets to you.",
      {
        fontFamily: 'monospace',
        fontSize: '24px',
        fill: '#ffff00',
        align: 'center',
        wordWrap: { width: 1200 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(99);

    // 💬 Fixed-position interaction box
    this.interactBox = this.add.rectangle(this.scale.width / 2, this.scale.height - 120, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(3, 0xffffff).setOrigin(0.5).setVisible(false).setScrollFactor(0).setDepth(99);
    this.interactText = this.add.text(this.scale.width / 2, this.scale.height - 120, "", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5).setVisible(false).setScrollFactor(0).setDepth(99);

    this.moanSound = this.sound.add('moan', { volume: 0.6 });
    this.clownSound = this.sound.add('clown', { volume: 0.6 });
    this.music = this.sound.add('storageMusic', { loop: true, volume: 0.4 });
    this.music.play();

    this.controlsEnabled = false;
    this.doorInteracted = false;
    this.nailInteracted = false;
    this.transitioning = false;

    const wall = this.add.rectangle(1110, 128, 80, 767, 0x000000, 0).setOrigin(0);
    this.physics.add.existing(wall, true);
    this.physics.add.collider(this.player, wall);

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

    this.input.keyboard.once('keydown-SPACE', () => {
      this.introBox.setVisible(false);
      this.introText.setVisible(false);
      this.controlsEnabled = true;
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled || this.transitioning) return;

      const x = this.player.x;
      const y = this.player.y;

      if (x >= 310 && x <= 505 && y >= 450 && y <= 510) {
        if (!this.doorInteracted) {
          this.showInteraction("The door feels loose. Maybe if we press harder.");
          this.doorInteracted = true;
        } else {
          this.transitioning = true;
          this.cameras.main.fadeOut(1000, 0, 0, 0);
          this.time.delayedCall(1000, () => {
            this.player.setPosition(1280, 500);
            this.cameras.main.fadeIn(1000, 0, 0, 0);
            this.transitioning = false;
          });
        }
        return;
      }

      if (x >= 750 && x <= 980 && y >= 450 && y <= 530) {
        this.showInteraction("How are we supposed to get to the other room?");
        return;
      }

      if (x >= 260 && x <= 410 && y >= 500 && y <= 800) {
        this.showInteraction("This mask seems so real.");
        this.moanSound.play();
        return;
      }

      if (x >= 1500 && x <= 1900 && y >= 450 && y <= 600) {
        this.showInteraction("I heard something move back there.");
        return;
      }

      if (x >= 2010 && x <= 2170 && y >= 630 && y <= 820) {
        this.showInteraction("The smell from these boxes is horrendous.");
        return;
      }

      if (x >= 1210 && x <= 1456 && y >= 630 && y <= 820) {
        this.showInteraction("I'm starting to feel nauseous.");
        return;
      }

      if (x >= 2000 && x <= 2180 && y >= 490 && y <= 600) {
        this.showInteraction("The portrait's eyes are following me.");
        this.clownSound.play();
        return;
      }

      if (x >= 1580 && x <= 1760 && y >= 750 && y <= 880) {
        if (!this.nailInteracted) {
          this.showInteraction("I hope this is the right nail.");
          this.nailInteracted = true;
        } else {
          this.transitioning = true;
          this.cameras.main.flash(200, 255, 255, 255);
          this.time.delayedCall(250, () => {
            this.cameras.main.flash(200, 255, 255, 255);
          });
          this.time.delayedCall(700, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.music.stop();
              this.scene.start('DressingScene');
            });
          });
        }
        return;
      }
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.music.stop();
      this.scene.start('EntranceScene');
    });
  }

  update() {
    if (!this.controlsEnabled) return;

    if (window.GameTimer.getRemaining() <= 0) {
      this.music.stop();
      this.scene.start('LairScene');
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

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
    this.interactBox.setVisible(true);
    this.interactText.setVisible(true);
  }
}

window.StorageScene = StorageScene;
