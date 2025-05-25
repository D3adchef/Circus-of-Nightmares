class LairScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LairScene' });
  }

  preload() {
    this.load.image('lair', 'assets/rooms/clownlair2.png');
    this.load.image('clown', 'assets/sprites/clown.png');
    this.load.audio('clownAmbience', 'assets/audio/clown.wav');
    this.load.audio('horn', 'assets/audio/horn.wav');
    this.load.audio('scream', 'assets/audio/scream.wav');
    this.load.audio('open', 'assets/audio/open.wav');
    this.load.audio('rat', 'assets/audio/rat.wav');
    this.load.audio('splatter', 'assets/audio/splatter.wav');
  }

  create() {
    console.log("LairScene loaded");

    this.physics.world.setBounds(0, 0, 2304, 1025);
    this.cameras.main.setBounds(0, 0, 2304, 1025);
    this.add.image(0, 0, 'lair').setOrigin(0, 0).setDisplaySize(2304, 1025);

    this.player = this.physics.add.sprite(144, 897, 'clown').setScale(4);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(0.75);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.controlsEnabled = false;

    this.ambience = this.sound.add('clownAmbience', { loop: true, volume: 0.6 });
    this.ambience.play();

    this.interactBox = this.add.rectangle(1152, 700, 600, 140, 0x000000, 0.85)
      .setStrokeStyle(3, 0xff0000).setOrigin(0.5).setVisible(true);
    this.interactText = this.add.text(1152, 700, "Home Sweet Home.", {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ff4444',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5).setVisible(true);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.interactBox.setVisible(false);
      this.interactText.setVisible(false);
      this.controlsEnabled = true;
    });

    // Invisible wall
    const wall = this.add.rectangle(1110, 128, 30, 769, 0x000000, 0).setOrigin(0);
    this.physics.add.existing(wall, true);
    this.physics.add.collider(this.player, wall);

    this.drawerStep = 0;

    // ⏳ Hidden 5-minute timer
    this.time.delayedCall(300000, () => {
      this.controlsEnabled = false;
      this.player.setVelocity(0);
      this.ambience.stop();

      this.cameras.main.fadeOut(3000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EntranceScene');
      });
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.controlsEnabled) return;

      const x = this.player.x;
      const y = this.player.y;

      if (x >= 128 && x <= 344 && y >= 540 && y <= 720) {
        this.trigger("Dang, a stain on best suit.", 'clownAmbience');
      } else if (x >= 440 && x <= 660 && y >= 560 && y <= 700) {
        this.trigger("Wow, what a knockout.", 'horn');
      } else if (x >= 820 && x <= 980 && y >= 560 && y <= 700) {
        if (this.drawerStep === 0) {
          this.show("The drawer seems stuck, maybe I can wiggle it free.");
          this.drawerStep = 1;
        } else if (this.drawerStep === 1) {
          this.sound.play('open');
          this.cameras.main.flash(200, 255, 255, 255);
          this.time.delayedCall(800, () => {
            this.player.setPosition(1918, 860);
            this.sound.play('scream');
            this.show("My favorite place to be.");
          });
        }
      } else if (x >= 1900 && x <= 2125 && y >= 520 && y <= 650) {
        this.trigger("I wondered where I left that mask", null);
      } else if (x >= 1285 && x <= 1745 && y >= 520 && y <= 650) {
        this.trigger("Another one bites the dust.", null);
      } else if (x >= 1260 && x <= 1380 && y >= 750 && y <= 897) {
        this.show("Just some skulls in there.");
      } else if (x >= 2055 && x <= 2176 && y >= 750 && y <= 897) {
        this.show("Bones. Bones. and more Bones");
      } else if (x >= 1770 && x <= 1950 && y >= 697 && y <= 793) {
        this.trigger("Tasty", 'splatter');
      } else if (x >= 1524 && x <= 1810 && y >= 750 && y <= 880) {
        this.trigger("Been looking everywhere for this knife.", 'rat');
      } else if (x >= 1476 && x <= 1680 && y >= 670 && y <= 750) {
        this.trigger("Need to add this bone to the soup.", 'rat');
      }
    });

    // ESC to return to EntranceScene
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
    this.time.delayedCall(300000, () => {
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
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    console.log(`LairScene X: ${this.player.x.toFixed(2)}, Y: ${this.player.y.toFixed(2)}`);
  }
}

window.LairScene = LairScene;
