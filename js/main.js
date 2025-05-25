const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  width: 1152, // Consistent camera view width
  height: 576, // Consistent camera view height
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    EntranceScene,
    MirrorScene,
    StorageScene,
    DressingScene,
    ExitScene,
    EntrancePostGameScene,
    WinnerScene,
    LairScene // ✅ Game over scene if time runs out
  ]
};

// 🔴 Global 10-minute countdown timer (600,000 ms = 10 min)
window.GameTimer = {
  start: null,
  total: 600000,
  getRemaining: function () {
    if (!this.start) return this.total;
    return Math.max(0, this.total - (Date.now() - this.start));
  }
};

const game = new Phaser.Game(config);
