class WinnerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinnerScene' });
  }

  preload() {
    this.load.image('lair', 'assets/rooms/clownlair.png');
    this.load.image('playerSprite', 'assets/sprites/player.png');
    this.load.audio('clownAmbience', 'assets/audio/clown.wav');
    this.load.audio('horn', 'assets/audio/horn.wav');
    this.load.audio('scream', 'assets/audio/scream.wav');
    this.load.audio('open', 'assets/audio/open.wav');
    this.load.audio('rat', 'assets/audio/rat.wav');
    this.load.audio('splatter', 'assets/audio/splatter.wav');
  }

  create() {
    console.log("WinnerScene loaded");
    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'lair').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(144, 897, 'playerSprite').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.controlsEnabled = false;

    this.ambience = this.sound.add('clownAmbience', { loop: true, volume: 0.6 });
    this.ambience.play();

    // 🧷 Fixed position interaction box
    this.interactBox = this.add.rectangle(this.scale.width / 2, 80, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(3, 0xff0000)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(99)
      .setVisible(true);

    this.interactText = this.add.text(this.scale.width / 2, 80, "I think we found the Killer Clown's Hideout.", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ff4444',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(99)
      .setVisible(true);

    this.time.delayedCall(1000, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.interactBox.setVisible(false);
        this.interactText.setVisible(false);
        this.controlsEnabled = true;
      });
    });

    const wall = this.add.rectangle(1110, 128, 30, 769, 0x000000, 0).setOrigin(0);
    this.physics.add.existing(wall, true);
    this.physics.add.collider(this.player, wall);

    this.drawerStep = 0;

    this.time.delayedCall(300000, () => {
      this.cameras.main.fadeOut(2000, 0, 0, 0);
      this.ambience.stop();
      this.time.delayedCall(3000, () => this.scene.start('EntranceScene'));
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled) return;

      const x = this.player.x;
      const y = this.player.y;

      if (x >= 128 && x <= 244 && y >= 0 && y <= 1025) {
        this.trigger("I sure hope that isn't blood.", 'clownAmbience');
      } else if (x >= 480 && x <= 680 && y >= 620 && y <= 750) {
        this.trigger("What an ugly clown.", 'horn');
      } else if (x >= 680 && x <= 880 && y >= 620 && y <= 750) {
        if (this.drawerStep === 0) {
          this.show("The drawer seems stuck, maybe I can wiggle it free.");
          this.drawerStep = 1;
        } else if (this.drawerStep === 1) {
          this.sound.play('open');
          this.cameras.main.flash(200, 255, 255, 255);
          this.time.delayedCall(800, () => {
            this.player.setPosition(1918, 860);
            this.sound.play('scream');
            this.show("OMG it's his KILLING ROOM!!!!!");
          });
        }
      } else if (x >= 1892 && x <= 2125 && y >= 560 && y <= 690) {
        this.trigger("What a creepy mask.", 'splatter');
      } else if (x >= 1485 && x <= 1745 && y >= 560 && y <= 690) {
        this.trigger("OMG a body!!!", 'splatter');
      } else if (x >= 1280 && x <= 1420) {
        this.show("I would rather leave this box alone.");
      } else if (x >= 2055 && x <= 2176 && y >= 777 && y <= 897) {
        this.show("I'm not opening that box.");
      } else if (x >= 1805 && x <= 1950 && y >= 697 && y <= 793) {
        this.trigger("Gross it's squishy.", 'splatter');
      } else if (x >= 1622 && x <= 1810 && y >= 817 && y <= 897) {
        this.trigger("I think I found a bloody knife.", 'rat');
      } else if (x >= 1468 && x <= 1645 && y >= 740 && y <= 800) {
        this.trigger("I'm pretty sure that's a leg bone.", 'rat');
      }
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.ambience.stop();
      this.scene.start('EntranceScene');
    });
  }

  trigger(message, soundKey) {
    if (soundKey) this.sound.play(soundKey);
    this.show(message);
  }

  show(message) {
    this.interactText.setText(message);
    this.interactText.setVisible(true);
    this.interactBox.setVisible(true);
    this.time.delayedCall(3000, () => {
      this.interactText.setVisible(false);
      this.interactBox.setVisible(false);
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
    if (this.cursors.up.isDown) this.player.setVelocityY(-200);
    else if (this.cursors.down.isDown) this.player.setVelocityY(200);

    console.log(`WinnerScene X: ${this.player.x.toFixed(2)}, Y: ${this.player.y.toFixed(2)}`);
  }
}

window.WinnerScene = WinnerScene;
