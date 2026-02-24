// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.wave = data.wave || 0;
        this.podsRescued = data.podsRescued || 0;
        this.levelNumber = data.levelNumber || 1;
        this.pointsEarned = data.pointsEarned || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // Responsive font sizing based on screen width
        // Mobile detection: screens < 600px get scaled fonts (min sizes prevent too-small text)
        const isMobile = width < 600;
        const titleFontSize = isMobile ? Math.max(32, width * 0.08) : 64;
        const subtitleFontSize = isMobile ? Math.max(14, width * 0.035) : 20;
        const statsFontSize = isMobile ? Math.max(14, width * 0.035) : 20;
        const buttonFontSize = isMobile ? Math.max(18, width * 0.045) : 28;
        
        // LCARS-style title with level info
        // On mobile, start title at 10% to leave maximum room for stats and buttons below
        const titleY = isMobile ? height * 0.1 : height / 3;
        const levelInfo = ProgressConfig.levelInfo[this.levelNumber];
        const title = this.add.text(width / 2, titleY, 'MISSION FAILED', {
            fontSize: `${titleFontSize}px`,
            color: '#FF0000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        const subtitleYOffset = isMobile ? 40 : 65;
        const levelText = this.add.text(width / 2, titleY + subtitleYOffset, `Level ${this.levelNumber}: ${levelInfo.name}`, {
            fontSize: `${subtitleFontSize}px`,
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace'
        });
        levelText.setOrigin(0.5);
        
        // Get high score
        const highScore = this.getHighScore();
        
        // Stats with LCARS border - responsive panel width and position
        const statsY = isMobile ? height * 0.32 : height / 2;
        const statsPanel = this.add.graphics();
        statsPanel.lineStyle(3, 0xFF0000, 1);
        const panelWidth = Math.min(440, width * 0.85);
        const panelHeight = isMobile ? 200 : 220;
        statsPanel.strokeRect(width / 2 - panelWidth / 2, statsY - 20, panelWidth, panelHeight);
        
        this.add.text(width / 2, statsY, `FINAL SCORE: ${this.finalScore}`, {
            fontSize: `${statsFontSize + 4}px`,
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 40, `HIGH SCORE: ${highScore}`, {
            fontSize: `${statsFontSize}px`,
            color: '#FFD700',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 80, `WAVE REACHED: ${this.wave}`, {
            fontSize: `${statsFontSize}px`,
            color: '#FFFFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 120, `PODS RESCUED: ${this.podsRescued}`, {
            fontSize: `${statsFontSize}px`,
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        // Display credits earned (roguelite progression!)
        const creditsY = statsY + 160; // Positioned below pods rescued
        this.add.text(width / 2, creditsY, `CREDITS EARNED: +${this.pointsEarned}`, {
            fontSize: `${statsFontSize}px`,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Navigation buttons - on mobile, always place below stats panel within safe area (~76% of height)
        const buttonY = isMobile ? Math.min(statsY + panelHeight + 25, height * 0.76) : height * 0.75;
        const buttonSpacing = isMobile ? Math.round(height * 0.07) : 60;
        
        // Restart button
        const restartButton = this.add.text(width / 2, buttonY, '[ RETRY MISSION ]', {
            fontSize: `${buttonFontSize}px`,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        
        restartButton.on('pointerdown', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber });
        });
        
        restartButton.on('pointerover', () => {
            restartButton.setColor('#00FFFF');
            restartButton.setScale(1.05);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setColor('#00FF00');
            restartButton.setScale(1.0);
        });
        
        // Return to Menu button
        const menuButton = this.add.text(width / 2, buttonY + buttonSpacing, '[ RETURN TO MENU ]', {
            fontSize: `${buttonFontSize - 4}px`,
            color: '#888888',
            fontFamily: 'Courier New, monospace'
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive();
        
        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setColor('#00FFFF');
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setColor('#888888');
        });
        
        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber });
        });
        
        this.input.keyboard.once('keydown-M', () => {
            this.scene.start('MainMenuScene');
        });
    }
    
    getHighScore() {
        try {
            const saved = localStorage.getItem('starTrekAdventuresHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }
}
