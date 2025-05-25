class MirrorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MirrorScene' });
  }

  preload() {
    this.load.image('mirrors', 'assets/rooms/mirrors.png');
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.audio('mirrorsMusic', 'assets/audio/mirrors.wav');
  }

  create() {
    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'mirrors').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(1152, 950, 'player').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey('ESC');

    if (!window.GameTimer.start) {
      window.GameTimer.start = Date.now();
    }

    this.music = this.sound.add('mirrorsMusic', { loop: true, volume: 0.4 });
    this.music.play();

    // ✅ Fixed-position timer
    this.timerText = this.add.text(this.scale.width - 20, 20, '', {
      fontFamily: 'Courier New',
      fontSize: '36px',
      color: '#ff0000'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(99);

    // ✅ Start popup box remains in center
    this.startBox = this.add.rectangle(this.scale.width / 2, 240, 1400, 140, 0x000000, 0.85)
      .setStrokeStyle(4, 0xff00ff).setOrigin(0.5).setScrollFactor(0);
    this.startText = this.add.text(this.scale.width / 2, 240,
      "A shard is missing and you must replace it to leave.\nI recommend finding it before someone finds it and sticks it in you.",
      {
        fontFamily: 'monospace',
        fontSize: '24px',
        fill: '#ffff00',
        align: 'center',
        wordWrap: { width: 1200 }
      }).setOrigin(0.5).setScrollFactor(0);

    this.controlsEnabled = false;
    this.hasShard = false;

    this.input.keyboard.once('keydown-SPACE', () => {
      this.startBox.setVisible(false);
      this.startText.setVisible(false);
      this.controlsEnabled = true;
    });

    // ✅ Fixed-position interaction box
    this.interactBox = this.add.rectangle(this.scale.width / 2, this.scale.height - 120, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(3, 0xffffff).setOrigin(0.5).setVisible(false).setScrollFactor(0).setDepth(99);

    this.interactText = this.add.text(this.scale.width / 2, this.scale.height - 120, "", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5).setVisible(false).setScrollFactor(0).setDepth(99);

    this.flashOverlay = this.add.rectangle(1152, 512, 2304, 1025, 0xffffff, 0).setDepth(20);

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled) return;

      const x = this.player.x;
      const y = this.player.y;
      const interaction = this.getInteractionFromZones(x, y);

      if (interaction === "SHARD") {
        this.hasShard = true;
        this.flashOverlay.setAlpha(1);
        this.tweens.add({ targets: this.flashOverlay, alpha: 0, duration: 300 });
        this.time.delayedCall(500, () => {
          this.music.stop();
          this.scene.start("StorageScene");
        });
      } else if (interaction === "EXIT" && this.hasShard) {
        this.scene.start("StorageScene");
      } else if (interaction) {
        this.showInteraction(interaction);
      }
    });

    this.walls = this.physics.add.staticGroup();
    const topWall = this.add.rectangle(0, 0, 2304, 150.33, 0x000000, 0).setOrigin(0);
    this.physics.add.existing(topWall, true);
    this.walls.add(topWall);
    const mirrorWall = this.add.rectangle(128, 500.33, 1144, 153.34, 0x000000, 0).setOrigin(0);
    this.physics.add.existing(mirrorWall, true);
    this.walls.add(mirrorWall);
    this.physics.add.collider(this.player, this.walls);

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
  }

  update() {
    if (!this.controlsEnabled) return;

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.music.stop();
      this.scene.start("EntranceScene");
    }

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
      this.interactText.setVisible(false);
      this.interactBox.setVisible(false);
    });
  }

  getInteractionFromZones(x, y) {
    const zones = [
      { xMin: 921, xMax: 1118, yMin: 716, yMax: 790, message: "I promise that you don't want what lurks in here." },
      { xMin: 561, xMax: 765, yMin: 716, yMax: 790, message: "I promise that you don't want what lurks in here." },
      { xMin: 358, xMax: 451, yMin: 716, yMax: 790, message: "The only thing wrong with these mirrors is the reflection in them." },
      { xMin: 135, xMax: 241, yMin: 716, yMax: 790, message: "The only thing wrong with these mirrors is the reflection in them." },
      { xMin: 1075, xMax: 1188, yMin: 306, yMax: 397, message: "There's nothing to see here but me." },
      { xMin: 861, xMax: 965, yMin: 306, yMax: 397, message: "There's nothing to see here but me." },
      { xMin: 638, xMax: 735, yMin: 306, yMax: 397, message: this.hasShard ? "EXIT" : "It appears a piece is missing. We should find it." },
      { xMin: 421, xMax: 538, yMin: 306, yMax: 397, message: "There's nothing to see here but me." },
      { xMin: 215, xMax: 310, yMin: 306, yMax: 397, message: "There's nothing to see here but me." },
      { xMin: 1735, xMax: 1875, yMin: 313, yMax: 457, message: "It appears to house some skeletons and rats." },
      { xMin: 1995, xMax: 2125, yMin: 286, yMax: 417, message: "It appears to house some skeletons and rats." },
      { xMin: 1780, xMax: 1940, yMin: 543, yMax: 690, message: "Not sure what's in them, but the smell is putrid." },
      { xMin: 1990, xMax: 2110, yMin: 673, yMax: 816, message: "Not sure what's in them, but the smell is putrid." },
      { xMin: 1745, xMax: 1810, yMin: 723, yMax: 816, message: "Just stay away, trust me." },
      { xMin: 2065, xMax: 2150, yMin: 380, yMax: 503, message: "SHARD" }
    ];

    for (let zone of zones) {
      const inX = x >= zone.xMin && x <= zone.xMax;
      const inY = y >= zone.yMin && y <= zone.yMax;
      if (inX && inY) return zone.message;
    }

    return null;
  }
}

window.MirrorScene = MirrorScene;
