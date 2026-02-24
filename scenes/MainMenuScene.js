// Main Menu Scene - Entry point with options to select levels or upgrades
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600

        console.log('MainMenuScene: Starting main menu...')

        // LCARS background using 9-slice.
        // Source image (lcars-menu-background.jpeg) is 1280x876.
        // Stretch zone: bottom 1px row across the full image width
        //   (topHeight=875, all else fixed). The orange on the left column
        //   at the bottom edge repeats downward to fill any extra height.
        // Display at least the natural image width to prevent horizontal squishing;
        // on narrow screens the canvas clips the right side.
        const IMAGE_WIDTH = 1280
        const IMAGE_HEIGHT = 876
        const displayWidth = Math.max(width, IMAGE_WIDTH)
        const displayHeight = Math.max(height, IMAGE_HEIGHT)
        this.add.nineslice(
            0, 0,
            'lcars-menu-background', null,
            displayWidth, displayHeight,
            0, 0, IMAGE_HEIGHT - 1, 0
        ).setOrigin(0, 0)

        // ── Title – upper black section (image y 0–275, fixed in 9-slice) ──
        const titleSize = isMobile ? '40px' : '60px'
        const subtitleSize = isMobile ? '28px' : '44px'
        const titleY = isMobile ? 90 : 110
        const subtitleY = titleY + (isMobile ? 44 : 60)

        const title = this.add.text(width / 2, titleY, 'STAR TREK', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)

        const subtitle = this.add.text(width / 2, subtitleY, 'AURORA', {
            fontSize: subtitleSize,
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        subtitle.setOrigin(0.5)

        // ── Buttons – lower black section (below stripe at y=340) ──
        const saveData = ProgressConfig.loadProgress()
        const unlockedCount = saveData.unlockedLevels.length

        const buttonSpacing = isMobile ? 65 : 85
        // Keep buttons comfortably below the LCARS stripe
        const buttonBaseY = isMobile ? 360 : Math.max(Math.floor(height * 0.62), 360)
        const buttonSize = isMobile ? '22px' : '32px'
        const infoSize = isMobile ? '12px' : '16px'

        // Mission Select button
        const levelSelectButton = this.add.text(width / 2, buttonBaseY, '[ MISSION SELECT ]', {
            fontSize: buttonSize,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        levelSelectButton.setOrigin(0.5)
        levelSelectButton.setInteractive()

        const levelProgress = this.add.text(width / 2, buttonBaseY + (isMobile ? 24 : 34), `${unlockedCount} of 10 missions unlocked`, {
            fontSize: infoSize,
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace'
        })
        levelProgress.setOrigin(0.5)

        levelSelectButton.on('pointerdown', () => { this.scene.start('LevelSelectScene') })
        levelSelectButton.on('pointerover', () => {
            levelSelectButton.setColor('#00FFFF')
            levelSelectButton.setScale(1.05)
        })
        levelSelectButton.on('pointerout', () => {
            levelSelectButton.setColor('#00FF00')
            levelSelectButton.setScale(1.0)
        })

        // Ship Upgrades button
        const upgradesButton = this.add.text(width / 2, buttonBaseY + buttonSpacing, '[ SHIP UPGRADES ]', {
            fontSize: buttonSize,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        upgradesButton.setOrigin(0.5)
        upgradesButton.setInteractive()

        const upgradePoints = this.add.text(width / 2, buttonBaseY + buttonSpacing + (isMobile ? 24 : 34), `${saveData.upgradePoints} upgrade points available`, {
            fontSize: infoSize,
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace'
        })
        upgradePoints.setOrigin(0.5)

        upgradesButton.on('pointerdown', () => { this.scene.start('UpgradesScene') })
        upgradesButton.on('pointerover', () => {
            upgradesButton.setColor('#00FFFF')
            upgradesButton.setScale(1.05)
        })
        upgradesButton.on('pointerout', () => {
            upgradesButton.setColor('#00FF00')
            upgradesButton.setScale(1.0)
        })

        // ── Footer – high score & version ──
        const highScore = this.getHighScore()
        const highScoreY = isMobile ? height - 50 : height - 40
        const highScoreSize = isMobile ? '14px' : '18px'
        this.add.text(width / 2, highScoreY, `High Score: ${highScore}`, {
            fontSize: highScoreSize,
            color: '#FFD700',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)

        const versionY = isMobile ? height - 25 : height - 18
        this.add.text(width / 2, versionY, 'v1.0.0', {
            fontSize: isMobile ? '11px' : '13px',
            color: '#888888',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)

        // Keyboard shortcut
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('LevelSelectScene')
        })
    }

    getHighScore() {
        try {
            const saved = localStorage.getItem('starTrekAdventuresHighScore')
            return saved ? parseInt(saved, 10) : 0
        } catch (e) {
            return 0
        }
    }
}
