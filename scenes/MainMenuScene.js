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

        // Background - starfield effect
        this.createStarfield()

        // LCARS frame (header bar + sidebar + footer)
        const layout = this.createLCARSFrame(width, height, isMobile)
        const { hH, sW, cR, fH, contentX, contentW } = layout

        // Load progress to check if player has unlocked levels
        const saveData = ProgressConfig.loadProgress()
        const unlockedCount = saveData.unlockedLevels.length

        // --- TITLE ---
        const titleY = hH + (isMobile ? 28 : 50)
        this.add.text(contentX, titleY, 'STAR TREK', {
            fontSize: isMobile ? '38px' : '60px',
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        this.add.text(contentX, titleY + (isMobile ? 42 : 66), 'AURORA', {
            fontSize: isMobile ? '26px' : '42px',
            color: '#88CCFF',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Decorative LCARS divider bars
        const divY = titleY + (isMobile ? 82 : 120)
        const divLeft = contentX - contentW * 0.42
        const divRight = contentX + contentW * 0.42
        const divGfx = this.add.graphics()
        divGfx.fillStyle(0xFF9900, 0.8)
        divGfx.fillRect(divLeft, divY, divRight - divLeft, 3)
        divGfx.fillStyle(0x9999CC, 0.5)
        divGfx.fillRect(divLeft + 30, divY + 7, divRight - divLeft - 60, 2)

        // --- BUTTONS ---
        const btnAreaY = divY + (isMobile ? 22 : 32)
        const btnW = isMobile ? Math.min(190, contentW - 30) : Math.min(270, contentW - 60)
        const btnH = isMobile ? 46 : 58
        const btnGap = isMobile ? 78 : 98
        const btnFontSize = isMobile ? '18px' : '26px'
        const infoFontSize = isMobile ? '12px' : '14px'

        // Mission Select button
        const msnY = btnAreaY + btnH / 2
        this.createLCARSButton({
            x: contentX, y: msnY, w: btnW, h: btnH,
            label: '[ MISSION SELECT ]', fontSize: btnFontSize,
            bgColor: 0x003322, strokeColor: 0x00AA55, textColor: '#00FF88',
            hoverBgColor: 0x005533, hoverTextColor: '#00FFCC',
            callback: () => this.scene.start('LevelSelectScene')
        })
        this.add.text(contentX, msnY + btnH / 2 + (isMobile ? 10 : 13),
            `${unlockedCount} of 10 missions unlocked`, {
                fontSize: infoFontSize,
                color: '#FFCC00',
                fontFamily: 'Courier New, monospace'
            }).setOrigin(0.5)

        // Ship Upgrades button
        const upgY = msnY + btnGap
        this.createLCARSButton({
            x: contentX, y: upgY, w: btnW, h: btnH,
            label: '[ SHIP UPGRADES ]', fontSize: btnFontSize,
            bgColor: 0x332200, strokeColor: 0xFF9900, textColor: '#FF9900',
            hoverBgColor: 0x553300, hoverTextColor: '#FFCC44',
            callback: () => this.scene.start('UpgradesScene')
        })
        this.add.text(contentX, upgY + btnH / 2 + (isMobile ? 10 : 13),
            `${saveData.upgradePoints} upgrade points available`, {
                fontSize: infoFontSize,
                color: '#FFCC00',
                fontFamily: 'Courier New, monospace'
            }).setOrigin(0.5)

        // --- FOOTER: high score + version ---
        const highScore = this.getHighScore()
        this.add.text(contentX, height - fH / 2, `HIGH SCORE: ${highScore}`, {
            fontSize: isMobile ? '12px' : '15px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        this.add.text(width - 12, height - fH / 2, 'v1.0.0', {
            fontSize: isMobile ? '10px' : '12px',
            color: '#000000',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(1, 0.5)

        // Keyboard shortcut
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('LevelSelectScene')
        })
    }

    // Draws the LCARS frame: orange header (right), peach sidebar (left),
    // concave quarter-circle inner corner, and orange footer.
    createLCARSFrame(width, height, isMobile) {
        const hH = isMobile ? 44 : 62     // header height
        const sW = isMobile ? 98 : 128    // sidebar width
        const cR = isMobile ? 24 : 32     // inner corner radius
        const fH = isMobile ? 28 : 36     // footer height

        const HEADER_COLOR = 0xFF9900     // orange
        const SIDEBAR_COLOR = 0xFF9966    // peach / salmon

        const gfx = this.add.graphics()

        // Orange header bar (right portion, beside sidebar)
        gfx.fillStyle(HEADER_COLOR, 1)
        gfx.fillRect(sW, 0, width - sW, hH)

        // Peach corner piece (top-left, same height as header)
        gfx.fillStyle(SIDEBAR_COLOR, 1)
        gfx.fillRect(0, 0, sW, hH)

        // Peach corner extension strip (just below header, extends cR right for arc)
        gfx.fillRect(0, hH, sW + cR, cR)

        // Peach main sidebar (below corner strip)
        gfx.fillRect(0, hH + cR, sW, height - hH - cR - fH)

        // Black concave quarter-circle arc at the inner corner.
        // Centered at (sW, hH): the pie slice from angle 0 (right) to π/2 (down)
        // removes the frame color that would otherwise form a sharp 90° inner corner,
        // producing the characteristic LCARS concave curve.
        gfx.fillStyle(0x000000, 1)
        gfx.slice(sW, hH, cR, 0, Math.PI / 2, false)
        gfx.fillPath()

        // Orange footer bar (full width)
        gfx.fillStyle(HEADER_COLOR, 1)
        gfx.fillRect(0, height - fH, width, fH)

        // Thin accent lines below the header (LCARS horizontal dividers)
        gfx.fillStyle(HEADER_COLOR, 0.4)
        gfx.fillRect(sW + cR + 4, hH + 4, width - sW - cR - 8, 2)
        gfx.fillStyle(0x9999CC, 0.35)
        gfx.fillRect(sW + cR + 4, hH + 9, width - sW - cR - 8, 1)

        // --- Sidebar data blocks ---
        const blockDefs = [
            { label: 'STARDATE', value: '47634.4', color: 0xFF6655 },
            { label: 'USS AURORA', value: 'NCC-7100', color: 0x9999CC },
            { label: 'SHIELDS', value: '100%', color: 0xFFAA44 },
            { label: 'WARP CORE', value: 'NOMINAL', color: 0x66AACC },
            { label: 'TACTICAL', value: 'READY', color: 0xAA66AA },
        ]
        const bW = sW - 14
        const bH = isMobile ? 30 : 36
        const bGap = isMobile ? 40 : 48
        let bY = hH + cR + (isMobile ? 12 : 16)

        blockDefs.forEach(block => {
            if (bY + bH < height - fH - 12) {
                gfx.fillStyle(block.color, 1)
                gfx.fillRoundedRect(7, bY, bW, bH, 5)
                this.add.text(7 + bW / 2, bY + bH / 2 - (isMobile ? 5 : 6), block.label, {
                    fontSize: isMobile ? '8px' : '9px',
                    color: '#000000',
                    fontFamily: 'Courier New, monospace',
                    fontStyle: 'bold'
                }).setOrigin(0.5)
                this.add.text(7 + bW / 2, bY + bH / 2 + (isMobile ? 5 : 7), block.value, {
                    fontSize: isMobile ? '9px' : '10px',
                    color: '#000000',
                    fontFamily: 'Courier New, monospace'
                }).setOrigin(0.5)
                bY += bGap
            }
        })

        // Header text labels (on the orange bar)
        this.add.text(sW + cR + 10, hH / 2, 'LCARS INTERFACE', {
            fontSize: isMobile ? '12px' : '16px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)

        this.add.text(width - 10, hH / 2, 'USS AURORA', {
            fontSize: isMobile ? '11px' : '15px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5)

        // Return layout constants for content placement
        const contentX = sW + (width - sW) / 2
        const contentW = width - sW - 10
        return { hH, sW, cR, fH, contentX, contentW }
    }

    // Creates a rectangular LCARS-style button with hover effects.
    // opts: { x, y, w, h, label, fontSize, bgColor, strokeColor, textColor, hoverBgColor, hoverTextColor, callback }
    createLCARSButton(opts) {
        const { x, y, w, h, label, fontSize, bgColor, strokeColor, textColor, hoverBgColor, hoverTextColor, callback } = opts
        const bg = this.add.rectangle(x, y, w, h, bgColor, 1)
        bg.setStrokeStyle(2, strokeColor, 1)
        bg.setInteractive({ useHandCursor: true })

        const text = this.add.text(x, y, label, {
            fontSize,
            color: textColor,
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        bg.on('pointerdown', callback)
        bg.on('pointerover', () => {
            bg.setFillStyle(hoverBgColor)
            text.setColor(hoverTextColor)
        })
        bg.on('pointerout', () => {
            bg.setFillStyle(bgColor)
            text.setColor(textColor)
        })
        return { bg, text }
    }

    createStarfield() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height

        // Create animated starfield background
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width)
            const y = Phaser.Math.Between(0, height)
            const size = Phaser.Math.Between(1, 3)
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8)

            const star = this.add.circle(x, y, size, 0xFFFFFF, alpha)

            // Twinkling animation
            this.tweens.add({
                targets: star,
                alpha: alpha * 0.3,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            })
        }
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
