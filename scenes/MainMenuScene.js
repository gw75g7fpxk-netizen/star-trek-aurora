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
        const LOWER_BLACK_START_Y = 490   // texture y where lower black area begins
        const scale = width / IMAGE_WIDTH  // proportional scale to fit screen width
        const neededHeight = Math.max(IMAGE_HEIGHT, Math.ceil(height / scale))
        this.add.nineslice(
            0, 0,
            'lcars-menu-background', null,
            IMAGE_WIDTH, neededHeight,
            0, 0, IMAGE_HEIGHT - 1, 0
        ).setOrigin(0, 0).setScale(scale)

        const lcarsFont = 'Antonio, Oswald, Arial Narrow, sans-serif'

        // Button width computed here so title can share the same left alignment
        const btnW = Math.min(Math.round(width * 0.65), 340)
        const btnLeft = Math.round(width / 2 - btnW / 2)

        // ── Title – upper black section (texture y 0–UPPER_BLACK_BOTTOM_Y → screen px) ──
        const upperBlackBottom = Math.round(UPPER_BLACK_BOTTOM_Y * scale)
        const titleSize = upperBlackBottom > 200 ? '60px' : upperBlackBottom > 120 ? '40px' : '28px'
        const titleY = Math.round(upperBlackBottom * 0.50)

        this.add.text(btnLeft, titleY, 'USS AURORA', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)

        // ── Buttons – lower black section (at top of lower black area) ──
        const saveData = ProgressConfig.loadProgress()
        const unlockedCount = saveData.unlockedLevels.length

        // Place buttons just inside the top of the lower black section.
        // Clamp so buttons always fit above the footer (60px) regardless of screen size.
        const lowerBlackStart = Math.round(LOWER_BLACK_START_Y * scale)
        const btnH = isMobile ? 44 : 54
        const btnRadius = 10
        const infoSize = isMobile ? '12px' : '14px'
        const infoGap = isMobile ? 6 : 8
        const infoH = isMobile ? 20 : 24
        const btnGap = isMobile ? 14 : 18
        const topPad = isMobile ? 16 : 24
        const FOOTER_HEIGHT = 60  // reserved space at the bottom for high score + version
        // Total vertical space needed for both buttons + info rows + gap
        const totalBtnBlock = 2 * btnH + 2 * infoGap + 2 * infoH + btnGap
        const maxBtnStart = height - totalBtnBlock - FOOTER_HEIGHT
        const btn1Y = Math.min(lowerBlackStart + topPad, maxBtnStart)
        const btn2Y = btn1Y + btnH + infoGap + infoH + btnGap

        // Mission Select button
        const btn1 = this.createLcarsButton(
            width / 2, btn1Y, btnW, btnH, btnRadius, lcarsFont,
            'MISSION SELECT', 0xFF9900, '#000000',
            () => { this.scene.start('LevelSelectScene') }
        )
        const btn1Info = this.add.text(width / 2, btn1Y + btnH + infoGap, `${unlockedCount} of 10 missions unlocked`, {
            fontSize: infoSize,
            color: '#FFAA44',
            fontFamily: lcarsFont
        }).setOrigin(0.5)

        // Ship Upgrades button – clicking fades out both buttons then transitions
        const btn2 = this.createLcarsButton(
            width / 2, btn2Y, btnW, btnH, btnRadius, lcarsFont,
            'SHIP UPGRADES', 0x9999CC, '#000000',
            () => {
                // Disable zones for the duration of the animation; the scene
                // is destroyed by scene.start so they never need re-enabling.
                btn1.zone.disableInteractive()
                btn2.zone.disableInteractive()
                // Fade out top button first
                this.tweens.add({
                    targets: [btn1.bg, btn1.text, btn1Info],
                    alpha: 0,
                    duration: 500,
                    ease: 'Linear'
                })
                // Fade out bottom button slightly after, then start scene
                this.tweens.add({
                    targets: [btn2.bg, btn2.text, btn2Info],
                    alpha: 0,
                    duration: 500,
                    delay: 200,
                    ease: 'Linear',
                    onComplete: () => { this.scene.start('UpgradesScene') }
                })
            }
        )
        const btn2Info = this.add.text(width / 2, btn2Y + btnH + infoGap, `${saveData.upgradePoints} upgrade points available`, {
            fontSize: infoSize,
            color: '#AAAAEE',
            fontFamily: lcarsFont
        }).setOrigin(0.5)

        // ── Footer – high score & version ──
        const highScore = this.getHighScore()
        this.add.text(width / 2, height - (isMobile ? 50 : 40), `High Score: ${highScore}`, {
            fontSize: isMobile ? '14px' : '18px',
            color: '#FFD700',
            fontFamily: lcarsFont
        }).setOrigin(0.5)

        this.add.text(width / 2, height - (isMobile ? 25 : 18), 'v1.0.0', {
            fontSize: isMobile ? '11px' : '13px',
            color: '#888888',
            fontFamily: lcarsFont
        }).setOrigin(0.5)

        // Keyboard shortcut
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('LevelSelectScene')
        })

        // Fade in buttons top → bottom; the LCARS background and USS Aurora title
        // stay at full alpha (they are present on the upgrades screen too).
        const fadeGroups = [
            [btn1.bg, btn1.text, btn1Info],
            [btn2.bg, btn2.text, btn2Info]
        ]
        fadeGroups.forEach((group, i) => {
            group.forEach(el => el.setAlpha(0))
            this.tweens.add({
                targets: group,
                alpha: 1,
                duration: 500,
                delay: i * 200,
                ease: 'Linear'
            })
        })
    }

    createLcarsButton(x, y, btnWidth, btnHeight, radius, fontFamily, label, fillColor, textColor, onPress) {
        const bg = this.add.graphics()

        const drawBg = (alpha) => {
            bg.clear()
            bg.fillStyle(fillColor, alpha)
            bg.fillRoundedRect(x - btnWidth / 2, y, btnWidth, btnHeight, radius)
        }
        drawBg(1)

        const btnFontSize = btnHeight > 48 ? '24px' : '20px'
        const text = this.add.text(x, y + btnHeight / 2, label, {
            fontSize: btnFontSize,
            color: textColor,
            fontFamily: fontFamily,
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Interactive zone over the button area
        const zone = this.add.zone(x, y + btnHeight / 2, btnWidth, btnHeight).setInteractive()
        zone.on('pointerdown', () => {
            this.sound.play('button-click')
            onPress()
        })
        zone.on('pointerover', () => {
            drawBg(0.7)
            text.setScale(1.04)
        })
        zone.on('pointerout', () => {
            drawBg(1)
            text.setScale(1.0)
        })
        return { bg, text, zone }
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
