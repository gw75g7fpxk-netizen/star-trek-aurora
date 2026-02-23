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

        // Mission Select button (purple pill)
        const msnY = btnAreaY + btnH / 2
        this.createLCARSButton({
            x: contentX, y: msnY, w: btnW, h: btnH,
            label: 'MISSION SELECT', fontSize: btnFontSize,
            bgColor: 0x9977BB, textColor: '#000000',
            hoverBgColor: 0xBB99DD, hoverTextColor: '#000000',
            callback: () => this.scene.start('LevelSelectScene')
        })
        this.add.text(contentX, msnY + btnH / 2 + (isMobile ? 10 : 13),
            `${unlockedCount} of 10 missions unlocked`, {
                fontSize: infoFontSize,
                color: '#FFCC00',
                fontFamily: 'Courier New, monospace'
            }).setOrigin(0.5)

        // Ship Upgrades button (orange pill)
        const upgY = msnY + btnGap
        this.createLCARSButton({
            x: contentX, y: upgY, w: btnW, h: btnH,
            label: 'SHIP UPGRADES', fontSize: btnFontSize,
            bgColor: 0xFF9900, textColor: '#000000',
            hoverBgColor: 0xFFCC44, hoverTextColor: '#000000',
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

    // Draws the LCARS frame:
    //  - Purple/lavender top-left block (header height, rounded bottom-right corner)
    //  - Orange header bar (right of purple block)
    //  - Salmon elbow connector + concave quarter-circle arc
    //  - Salmon sidebar blocks with pill-right (rounded-right) edges and gaps
    //  - Orange footer
    createLCARSFrame(width, height, isMobile) {
        const hH = isMobile ? 44 : 62     // header height
        const sW = isMobile ? 110 : 150   // sidebar width
        const cR = isMobile ? 28 : 38     // elbow corner radius
        const fH = isMobile ? 28 : 36     // footer height

        const PURPLE = 0x9977BB   // periwinkle/lavender (header block + accent)
        const SALMON  = 0xCC7766  // terracotta (sidebar blocks)
        const SALMON2 = 0xBB5544  // darker terracotta (alternate blocks)
        const ORANGE  = 0xFF9900  // orange/gold (header bar + footer)

        const gfx = this.add.graphics()

        // --- Purple/lavender top-left block (rounded bottom-right corner only) ---
        gfx.fillStyle(PURPLE, 1)
        gfx.fillRoundedRect(0, 0, sW, hH, { tl: 0, tr: 0, bl: 0, br: cR })

        // --- Orange header bar (right of purple block) ---
        gfx.fillStyle(ORANGE, 1)
        gfx.fillRect(sW, 0, width - sW, hH)

        // --- Elbow connector: salmon strip spanning sidebar+cR so the arc sits flush ---
        gfx.fillStyle(SALMON, 1)
        gfx.fillRect(0, hH, sW + cR, cR)

        // Black concave quarter-circle arc at the inner corner.
        // Centered at (sW, hH): pie slice 0→π/2 removes the sharp corner,
        // producing the characteristic LCARS concave elbow curve.
        gfx.fillStyle(0x000000, 1)
        gfx.slice(sW, hH, cR, 0, Math.PI / 2, false)
        gfx.fillPath()

        // --- Orange footer bar (full width) ---
        gfx.fillStyle(ORANGE, 1)
        gfx.fillRect(0, height - fH, width, fH)

        // --- Thin accent lines below the header ---
        gfx.fillStyle(ORANGE, 0.4)
        gfx.fillRect(sW + cR + 4, hH + 4, width - sW - cR - 8, 2)
        gfx.fillStyle(0x9999CC, 0.35)
        gfx.fillRect(sW + cR + 4, hH + 9, width - sW - cR - 8, 1)

        // --- Sidebar blocks: pill-right shape (rounded right edge), gap between each ---
        // This matches the LCARS reference: discrete labelled blocks that span the full
        // sidebar width with a half-pill on the right and flush on the left.
        const blockH   = isMobile ? 32 : 38
        const blockGap = isMobile ? 4 : 5
        const bR = Math.min(blockH / 2, isMobile ? 12 : 16)  // right-edge radius

        const sidebarBlocks = [
            { label: 'USS AURORA', sub: 'NCC-7100', color: PURPLE   },
            { label: 'STARDATE',   sub: '47634.4',  color: SALMON2  },
            { label: 'SHIELDS',    sub: '100%',     color: SALMON   },
            { label: 'WARP CORE',  sub: 'NOMINAL',  color: SALMON2  },
            { label: 'TACTICAL',   sub: 'READY',    color: ORANGE   },
            { label: 'STATUS',     sub: 'GREEN',    color: SALMON   },
        ]

        let bY = hH + cR + blockGap
        sidebarBlocks.forEach(block => {
            if (bY + blockH <= height - fH - blockGap) {
                gfx.fillStyle(block.color, 1)
                gfx.fillRoundedRect(0, bY, sW, blockH, { tl: 0, tr: bR, bl: 0, br: bR })
                this.add.text(sW / 2, bY + blockH / 2 - (isMobile ? 5 : 6), block.label, {
                    fontSize: isMobile ? '8px' : '9px',
                    color: '#000000',
                    fontFamily: 'Courier New, monospace',
                    fontStyle: 'bold'
                }).setOrigin(0.5)
                this.add.text(sW / 2, bY + blockH / 2 + (isMobile ? 5 : 7), block.sub, {
                    fontSize: isMobile ? '9px' : '10px',
                    color: '#000000',
                    fontFamily: 'Courier New, monospace'
                }).setOrigin(0.5)
                bY += blockH + blockGap
            }
        })

        // Label in the purple header block
        this.add.text(sW / 2, hH / 2, 'LCARS', {
            fontSize: isMobile ? '14px' : '18px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Header info text on the orange bar
        this.add.text(sW + 16, hH / 2, 'STARFLEET ACCESS 4427', {
            fontSize: isMobile ? '11px' : '14px',
            color: '#000000',
            fontFamily: 'Courier New, monospace'
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

    // Creates a pill-shaped (fully rounded) LCARS button with hover effects.
    // opts: { x, y, w, h, label, fontSize, bgColor, textColor, hoverBgColor, hoverTextColor, callback }
    createLCARSButton(opts) {
        const { x, y, w, h, label, fontSize, bgColor, textColor, hoverBgColor, hoverTextColor, callback } = opts
        const r = h / 2  // full pill radius

        const drawPill = (gfx, color) => {
            gfx.clear()
            gfx.fillStyle(color, 1)
            gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, r)
        }

        const gfx = this.add.graphics()
        drawPill(gfx, bgColor)
        gfx.setInteractive(
            new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
            Phaser.Geom.Rectangle.Contains
        )

        const text = this.add.text(x, y, label, {
            fontSize,
            color: textColor,
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        gfx.on('pointerdown', callback)
        gfx.on('pointerover', () => {
            drawPill(gfx, hoverBgColor)
            text.setColor(hoverTextColor)
        })
        gfx.on('pointerout', () => {
            drawPill(gfx, bgColor)
            text.setColor(textColor)
        })
        return { gfx, text }
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
