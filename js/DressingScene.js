class DressingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DressingScene' });
  }

  preload() {
    this.load.image('dressingroom', 'assets/rooms/dressingroom.png');
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.audio('dressingMusic', 'assets/audio/dressingroom.mp3');
    this.load.audio('applause', 'assets/audio/applause.wav');
    this.load.audio('horn', 'assets/audio/horn.wav');
    this.load.audio('fail', 'assets/audio/fail.mp3');
    this.load.audio('windup', 'assets/audio/windup.wav');
    this.load.audio('jack', 'assets/audio/jack.mp3');
  }

  create() {
    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'dressingroom').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(172, 827, 'player').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.timerBackground = this.add.rectangle(2100, 30, 160, 50, 0x000000, 0.6)
      .setOrigin(1, 0)
      .setStrokeStyle(3, 0xff0000);
    this.timerText = this.add.text(2100, 30, '', {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#ff0000'
    }).setOrigin(1, 0);

    this.music = this.sound.add('dressingMusic', { loop: true, volume: 0.4 });
    this.music.play();

    this.interactBox = this.add.rectangle(1152, 700, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(3, 0xffffff).setOrigin(0.5).setVisible(true);
    this.interactText = this.add.text(1152, 700,
      "To retrieve the jack-in-the-box you must face yourself before and after becoming the clown.", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5).setVisible(true);

    this.boxRiddleShown = false;
    this.rightRoomUnlocked = false;
    this.controlsEnabled = false;

    this.input.keyboard.once('keydown-SPACE', () => {
      this.interactText.setVisible(false);
      this.interactBox.setVisible(false);
      this.controlsEnabled = true;
    });

    this.playerOrder = [];
    this.correctSequence = ['rightMirror', 'clownSuit', 'leftMirror'];
    this.jackSequence = ['closest', 'farthest', 'middle', 'jack'];
    this.jackInput = [];

    this.walls = this.physics.add.staticGroup();
    const wall = this.add.rectangle(1204, 128, 30, 769, 0x000000, 0).setOrigin(0);
    this.physics.add.existing(wall, true);
    this.walls.add(wall);
    this.physics.add.collider(this.player, this.walls);

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled) return;

      const x = this.player.x;
      const y = this.player.y;

      if (this.boxRiddleShown && !this.rightRoomUnlocked) {
        this.interactText.setVisible(false);
        this.interactBox.setVisible(false);
        this.rightRoomUnlocked = true;
      }

      if (!this.rightRoomUnlocked && this.boxRiddleShown) return;

      if (x >= 348 && x <= 642 && y >= 690 && y <= 797) {
        this.showInteraction("I don't think we can leave yet.");
      } else if (x >= 1025 && x <= 1120 && y >= 410 && y <= 470) {
        this.sound.play('horn');
        this.playerOrder.push('clownSuit');
        this.checkMirrorSequence("Don't we make you laugh?");
      } else if (x >= 645 && x <= 940 && y >= 410 && y <= 470) {
        this.sound.play('applause');
        this.playerOrder.push('rightMirror');
        this.checkMirrorSequence("Don't you like clowns?");
      } else if (x >= 200 && x <= 500 && y >= 410 && y <= 500) {
        this.sound.play('applause');
        this.playerOrder.push('leftMirror');
        if (this.playerOrder.join(',') === this.correctSequence.join(',')) {
          this.showInteraction("Aren't we funny???");
          this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(1000, 255, 255, 255);
            this.time.delayedCall(1000, () => {
              this.player.setPosition(1335, 547);
              this.cameras.main.fadeIn(1000, 255, 255, 255);
              if (!this.boxRiddleShown) {
                this.interactText.setText(
                  "Start with the box that's closest near, Then try the two farthest from the fear. One in the middle hides the clue, Then wind the one that stares at you"
                );
                this.interactText.setVisible(true);
                this.interactBox.setVisible(true);
                this.boxRiddleShown = true;
              }
            });
          });
        } else {
          this.sound.play('fail');
          this.showInteraction("That's not right...");
          this.playerOrder = [];
        }
      } else if (x >= 1204 && x <= 1274 && y >= 690 && y <= 797) {
        this.showInteraction("There's something off about this wall...");
      } else if (x >= 2008 && x <= 2140 && y >= 643 && y <= 725) {
        this.sound.play('windup');
        this.checkJackSequence('closest', "Getting warmer");
      } else if (x >= 1372 && x <= 1725 && y >= 153 && y <= 240) {
        this.sound.play('windup');
        this.checkJackSequence('farthest', "Smells weird");
      } else if (x >= 1915 && x <= 2080 && y >= 287 && y <= 410) {
        this.sound.play('windup');
        this.checkJackSequence('middle', "Empty... try again");
      } else if (x >= 1662 && x <= 1822 && y >= 767 && y <= 897) {
        if (this.jackInput.join(',') === this.jackSequence.slice(0, 3).join(',')) {
          this.sound.play('jack');
          this.showInteraction("Hope this works");
          this.time.delayedCall(1000, () => {
            this.music.stop();
            this.scene.start("ExitScene");
          });
        } else {
          this.sound.play('fail');
          this.showInteraction("Too soon. It reset...");
          this.jackInput = [];
        }
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

    // ✅ ESC key to return to entrance
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
      if (!this.boxRiddleShown) {
        this.interactText.setVisible(false);
        this.interactBox.setVisible(false);
      }
    });
  }

  checkMirrorSequence(message) {
    const current = this.playerOrder.join(',');
    const correct = this.correctSequence.slice(0, this.playerOrder.length).join(',');
    if (current === correct) {
      this.showInteraction(message);
    } else {
      this.sound.play('fail');
      this.showInteraction("That's not right...");
      this.playerOrder = [];
    }
  }

  checkJackSequence(expected, message) {
    this.jackInput.push(expected);
    const correct = this.jackSequence.slice(0, this.jackInput.length).join(',');
    const actual = this.jackInput.join(',');
    if (correct === actual) {
      this.showInteraction(message);
    } else {
      this.sound.play('fail');
      this.showInteraction("That’s not right...");
      this.jackInput = [];
    }
  }
}

window.DressingScene = DressingScene;
