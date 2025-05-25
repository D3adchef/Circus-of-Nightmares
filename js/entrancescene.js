class EntranceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EntranceScene' });
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
    this.cameras.main.setZoom(0.6);

    this.entranceMusic = this.sound.add('entranceMusic', { loop: true, volume: 0.4 });

    this.titleBox = this.add.rectangle(1152, 240, 1200, 150, 0x000000, 0.85).setStrokeStyle(6, 0xff00ff).setOrigin(0.5);
    this.titleText = this.add.text(1152, 200, "WELCOME TO THE CIRCUS OF NIGHTMARES", {
      fontFamily: 'monospace',
      fontSize: '48px',
      fill: '#ff00ff',
      align: 'center',
      wordWrap: { width: 1100 }
    }).setOrigin(0.5);
    this.subtitleText = this.add.text(1152, 260,
  "Press SPACEBAR to begin game and to interact with items.\nPress ESC key anytime to quit.",
  {
    fontFamily: 'monospace',
    fontSize: '32px',
    fill: '#ffff00',
    align: 'center',
    lineSpacing: 10
  }
).setOrigin(0.5);


    this.tweens.add({
      targets: [this.titleText, this.subtitleText],
      alpha: { from: 1, to: 0.3 },
      yoyo: true,
      repeat: -1,
      duration: 1000
    });

    this.controlsEnabled = false;

    this.input.keyboard.once('keydown-SPACE', () => {
      this.entranceMusic.play();
      this.titleBox.setVisible(false);
      this.titleText.setVisible(false);
      this.subtitleText.setVisible(false);
      this.controlsEnabled = true;
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // ✅ Updated warning and dialogue boxes (smaller, square format)
    this.warningBox = this.add.rectangle(1152, 700, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(4, 0xffffff).setOrigin(0.5).setVisible(false);
    this.warningText = this.add.text(1152, 700, "", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5).setVisible(false);

    this.dialogueBox = this.add.rectangle(1152, 600, 500, 140, 0x000000, 0.9)
      .setStrokeStyle(3, 0xff0000).setOrigin(0.5).setVisible(false);
    this.dialogueText = this.add.text(1152, 600, "", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5).setVisible(false);

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled) return;

      if (this.atEnterDoor) {
        this.entranceMusic.stop();
        this.scene.start('MirrorScene');
      } else if (this.atStaffDoor) {
        this.showDialogue("It won't budge.");
      } else if (this.atExitDoor) {
        this.showDialogue("Not so fast.");
      }
    });

    // ✅ Clown flicker logic copied from StorageScene
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

    if (!window.GameTimer.start) {
      window.GameTimer.start = Date.now();
    }

    this.timerBackground = this.add.rectangle(2100, 30, 160, 50, 0x000000, 0.6)
      .setOrigin(1, 0)
      .setStrokeStyle(3, 0xff0000);
    this.timerText = this.add.text(2100, 30, '', {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(1, 0);
  }

  update() {
    if (!this.controlsEnabled) return;

    if (window.GameTimer.getRemaining() <= 0) {
      this.entranceMusic.stop();
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

    const x = this.player.x;
    const y = this.player.y;
    console.log(`Player X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);

    this.atEnterDoor = false;
    this.atStaffDoor = false;
    this.atExitDoor = false;

    if (x > 322 && x < 652 && Math.abs(y - 687) < 30) {
      this.atStaffDoor = true;
      this.showWarning("Probably not the circus experience you're looking for");
    } else if (x > 832 && x < 1405 && Math.abs(y - 687) < 30) {
      this.atEnterDoor = true;
      this.showWarning("Press SPACEBAR if you dare!");
    } else if (x > 1642 && x < 1942 && Math.abs(y - 687) < 30) {
      this.atExitDoor = true;
      this.showWarning("You can't leave yet. You're the MAIN attraction");
    } else {
      this.warningBox.setVisible(false);
      this.warningText.setVisible(false);
      this.dialogueBox.setVisible(false);
      this.dialogueText.setVisible(false);
    }

    const remaining = window.GameTimer.getRemaining();
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const formatted = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    this.timerText.setText(formatted);
  }

  showWarning(message) {
    this.warningText.setText(message);
    this.warningText.setVisible(true);
    this.warningBox.setVisible(true);
  }

  showDialogue(message) {
    this.dialogueText.setText(message);
    this.dialogueText.setVisible(true);
    this.dialogueBox.setVisible(true);
  }
}

window.EntranceScene = EntranceScene;
