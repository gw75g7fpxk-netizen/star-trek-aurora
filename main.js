// Main game entry point
console.log('Star Trek Aurora - Initializing...');

// Initialize PlayFab authentication (restores any existing session)
if (typeof PlayFabManager !== 'undefined') {
    PlayFabManager.initialize();
}

// Configure scenes
GameConfig.scene = [
    BootScene, 
    PreloadScene, 
    MainMenuScene, 
    LevelSelectScene, 
    UpgradesScene, 
    Level1Scene, 
    GameOverScene, 
    VictoryScene
];

// Create Phaser game instance
const game = new Phaser.Game(GameConfig);

// Expose game to window for debugging and testing
window.game = game;

console.log('Star Trek Aurora - Game created');
console.log('Configuration:', {
    width: GameConfig.width,
    height: GameConfig.height,
    scaleMode: 'FIT',
    physics: 'Arcade',
    targetFPS: 60
});
