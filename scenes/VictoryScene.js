// Victory Scene
class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' })
    }

    init(data) {
        this.finalScore    = data.score         || 0
        this.wave          = data.wave           || 0
        this.podsRescued   = data.podsRescued    || 0
        this.enemiesKilled = data.enemiesKilled  || 0
        this.levelNumber   = data.levelNumber    || 1
        this.pointsEarned  = data.pointsEarned   || 0
    }

    create() {
        const width  = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600

        this.saveLevelProgress()

        // ── LCARS background – same nineslice config as MainMenuScene ──
        const IMAGE_WIDTH          = 1280
        const IMAGE_HEIGHT         = 876
        const UPPER_BLACK_BOTTOM_Y = 275
        const LOWER_BLACK_START_Y  = 490
        const scale                = width / IMAGE_WIDTH
        const neededHeight         = Math.max(IMAGE_HEIGHT, Math.ceil(height / scale))
        this.add.nineslice(
            0, 0, 'lcars-menu-background', null,
            IMAGE_WIDTH, neededHeight,
            0, 0, IMAGE_HEIGHT - 1, 0
        ).setOrigin(0, 0).setScale(scale)

        const lcarsFont      = 'Antonio, Oswald, Arial Narrow, sans-serif'
        const lcarsChromePad = Math.round(165 * width / 1280) + 8
        const contentW       = width - 2 * lcarsChromePad
        const btnW           = Math.min(Math.round(width * 0.65), 340)
        const btnLeft        = Math.round(width / 2 - btnW / 2)

        // ── Upper black section: title + level subtitle ──
        const upperBlackBottom = Math.round(UPPER_BLACK_BOTTOM_Y * scale)
        const titleSize        = upperBlackBottom > 200 ? '60px' : upperBlackBottom > 120 ? '40px' : '28px'
        const titleY           = Math.round(upperBlackBottom * 0.50)
        const subY             = Math.round(titleY + (upperBlackBottom - titleY) * 0.60)
        const levelInfo        = ProgressConfig.levelInfo[this.levelNumber]

        this.titleEl = this.add.text(btnLeft, titleY, 'MISSION COMPLETE', {
            fontSize: titleSize,
            color: '#00FF88',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)

        this.subEl = this.add.text(btnLeft, subY, `LEVEL ${this.levelNumber}: ${levelInfo.name}`, {
            fontSize: isMobile ? '13px' : '15px',
            color: '#FF9900',
            fontFamily: lcarsFont
        }).setOrigin(0, 0.5)

        // ── Lower black section: stats + buttons ──
        const lowerBlackStart = Math.round(LOWER_BLACK_START_Y * scale)
        const availH          = height - lowerBlackStart

        // Layout modes based on available height
        const minimal = availH < 160
        const compact = !minimal && availH < 250

        const topPad    = minimal ? 6  : compact ? 8  : isMobile ? 12 : 18
        const innerPad  = minimal ? 4  : compact ? 5  : isMobile ? 9  : 12
        const lineGap   = minimal ? 2  : compact ? 3  : isMobile ? 6  : 7
        const scoreSize = minimal ? 16 : compact ? 19 : isMobile ? 21 : 25
        const statSize  = minimal ? 10 : compact ? 11 : isMobile ? 13 : 14
        const btnH      = minimal ? 28 : compact ? 32 : isMobile ? 40 : 44
        const btnGap    = minimal ? 4  : compact ? 5  : isMobile ? 8  : 10

        // Stats panel height: innerPad×2 + score + [hscore + summary in non-minimal] + credits
        const panelH = innerPad * 2 + scoreSize + lineGap
            + (minimal ? 0 : statSize + lineGap)
            + (minimal ? 0 : statSize + lineGap)
            + statSize

        const statsY = lowerBlackStart + topPad

        // Stats panel background
        this.panelBg = this.add.graphics()
        this.panelBg.fillStyle(0x080818, 0.88)
        this.panelBg.fillRoundedRect(lcarsChromePad, statsY, contentW, panelH, 6)
        this.panelBg.lineStyle(1, 0x00CC66, 0.55)
        this.panelBg.strokeRoundedRect(lcarsChromePad, statsY, contentW, panelH, 6)

        const highScore      = this.getHighScore()
        const isNewHighScore = this.finalScore > highScore
        let cy = statsY + innerPad

        this.scoreEl = this.add.text(width / 2, cy, `FINAL SCORE: ${this.finalScore}`, {
            fontSize: `${scoreSize}px`,
            color: isNewHighScore ? '#FFD700' : '#FFFF00',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0.5, 0)
        cy += scoreSize + lineGap

        this.hsEl    = null
        this.statsEl = null
        if (!minimal) {
            const hsLabel = isNewHighScore ? '★  NEW HIGH SCORE  ★' : `HIGH SCORE: ${highScore}`
            this.hsEl = this.add.text(width / 2, cy, hsLabel, {
                fontSize: `${statSize}px`,
                color: '#FFD700',
                fontFamily: lcarsFont,
                fontStyle: isNewHighScore ? 'bold' : 'normal'
            }).setOrigin(0.5, 0)
            cy += statSize + lineGap

            this.statsEl = this.add.text(width / 2, cy,
                `WAVES: ${this.wave}   ENEMIES: ${this.enemiesKilled}   PODS: ${this.podsRescued}`, {
                    fontSize: `${statSize}px`,
                    color: '#AACCFF',
                    fontFamily: lcarsFont
                }).setOrigin(0.5, 0)
            cy += statSize + lineGap
        }

        this.creditsEl = this.add.text(width / 2, cy, `CREDITS EARNED: +${this.pointsEarned}`, {
            fontSize: `${statSize}px`,
            color: '#00FF88',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0.5, 0)

        // ── Buttons ──
        this.buttons = []
        let btnY = statsY + panelH + btnGap

        this.replayBtn = this.createLcarsButton(
            width / 2, btnY, btnW, btnH, 8, lcarsFont,
            'REPLAY MISSION', 0x005533, '#FFFFFF',
            () => { this.scene.start('Level1Scene', { levelNumber: this.levelNumber }) }
        )
        this.buttons.push(this.replayBtn)
        btnY += btnH + btnGap

        if (!minimal && this.levelNumber < 10) {
            this.nextBtn = this.createLcarsButton(
                width / 2, btnY, btnW, btnH, 8, lcarsFont,
                'NEXT MISSION', 0xFF9900, '#000000',
                () => { this.scene.start('Level1Scene', { levelNumber: this.levelNumber + 1 }) }
            )
            this.buttons.push(this.nextBtn)
            btnY += btnH + btnGap
        }

        this.menuBtn = this.createLcarsButton(
            width / 2, btnY, btnW, btnH, 8, lcarsFont,
            'RETURN TO MENU', 0x333355, '#FFFFFF',
            () => { this.scene.start('MainMenuScene') }
        )
        this.buttons.push(this.menuBtn)

        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber })
        })
        this.input.keyboard.once('keydown-M', () => {
            this.scene.start('MainMenuScene')
        })

        // Celebratory particles
        this.time.addEvent({
            delay: 150,
            callback: () => {
                const px = Phaser.Math.Between(0, width)
                const py = Phaser.Math.Between(0, height)
                const color = Phaser.Utils.Array.GetRandom([0xFFFF00, 0x00FFFF, 0xFF9900])
                const p = this.add.circle(px, py, 3, color)
                this.tweens.add({ targets: p, alpha: 0, y: py + 50, duration: 1000, onComplete: () => p.destroy() })
            },
            loop: true
        })

        this.performFadeIn()
    }

    createLcarsButton(x, y, btnWidth, btnHeight, radius, fontFamily, label, fillColor, textColor, onPress) {
        const bg = this.add.graphics()
        const drawBg = (alpha) => {
            bg.clear()
            bg.fillStyle(fillColor, alpha)
            bg.fillRoundedRect(x - btnWidth / 2, y, btnWidth, btnHeight, radius)
        }
        drawBg(1)

        const btnFontSize = btnHeight > 38 ? '17px' : '13px'
        const text = this.add.text(x, y + btnHeight / 2, label, {
            fontSize: btnFontSize,
            color: textColor,
            fontFamily: fontFamily,
            fontStyle: 'bold'
        }).setOrigin(0.5)

        const zone = this.add.zone(x, y + btnHeight / 2, btnWidth, btnHeight).setInteractive()
        zone.on('pointerdown', () => { this.sound.play('button-click'); onPress() })
        zone.on('pointerover', () => { drawBg(0.7); text.setScale(1.04) })
        zone.on('pointerout',  () => { drawBg(1);   text.setScale(1.0)  })

        return { bg, text, zone }
    }

    performFadeIn() {
        const panelGroup = [this.panelBg, this.scoreEl, this.creditsEl]
        if (this.hsEl)    panelGroup.push(this.hsEl)
        if (this.statsEl) panelGroup.push(this.statsEl)

        const groups = [
            [this.titleEl, this.subEl],
            panelGroup,
            ...this.buttons.map(b => [b.bg, b.text])
        ]
        groups.forEach((group, i) => {
            group.forEach(el => el.setAlpha(0))
            this.tweens.add({ targets: group, alpha: 1, duration: 400, delay: i * 150, ease: 'Linear' })
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

    saveLevelProgress() {
        const saveData = ProgressConfig.loadProgress()
        ProgressConfig.saveLevelStats(this.levelNumber, {
            score: this.finalScore,
            enemiesKilled: this.enemiesKilled,
            podsRescued: this.podsRescued,
            wave: this.wave
        }, saveData)
    }
}
