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
        // Strategy:
        //   1. Scale the nineslice proportionally to fit the screen WIDTH
        //      (uniform setScale) — no horizontal distortion on any screen size.
        //   2. topHeight=IMAGE_HEIGHT-1 locks the full LCARS chrome;
        //      only the bottom 1px row (orange strip + black) repeats downward
        //      to cover any extra screen height.
        //   3. neededHeight is calculated in texture-space so that after
        //      uniform scale the rendered height exactly covers the screen.
        const IMAGE_WIDTH = 1280
        const IMAGE_HEIGHT = 876
        const UPPER_BLACK_BOTTOM_Y = 275  // texture y of upper black section bottom
        const STRIPE_BOTTOM_Y = 340       // texture y of horizontal stripe bottom
        const scale = width / IMAGE_WIDTH  // proportional scale to fit screen width
        const neededHeight = Math.max(IMAGE_HEIGHT, Math.ceil(height / scale))
        this.add.nineslice(
            0, 0,
            'lcars-menu-background', null,
            IMAGE_WIDTH, neededHeight,
            0, 0, IMAGE_HEIGHT - 1, 0
        ).setOrigin(0, 0).setScale(scale)

        // ── Title – upper black section (texture y 0–UPPER_BLACK_BOTTOM_Y → screen px) ──
        const upperBlackBottom = Math.round(UPPER_BLACK_BOTTOM_Y * scale)
        let titleSize, subtitleSize
        if (upperBlackBottom > 200) {
            titleSize = '60px'
            subtitleSize = '44px'
        } else if (upperBlackBottom > 120) {
            titleSize = '40px'
            subtitleSize = '28px'
        } else {
            titleSize = '28px'
            subtitleSize = '20px'
        }
        const titleY = Math.round(upperBlackBottom * 0.40)
        const subtitleY = Math.round(upperBlackBottom * 0.65)

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
        // Buttons start below the LCARS horizontal stripe (texture y=STRIPE_BOTTOM_Y → screen px)
        const stripeBottom = Math.round(STRIPE_BOTTOM_Y * scale)
        const buttonBaseY = Math.max(stripeBottom + 30, Math.round(height * 0.55))
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
