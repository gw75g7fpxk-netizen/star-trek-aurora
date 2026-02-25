// Level Select Scene - Shows map of all levels as space route (LCARS theme)
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' })
        this.selectedLevel = 1
        this.secretTapCount = 0 // Track taps on "MISSION SELECT" subtitle
        this.secretTapTimer = null // Timer to reset tap count
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600

        console.log('LevelSelectScene: Loading level selection...')

        this.saveData = ProgressConfig.loadProgress()
        this.isNavigatingBack = false
        this.mapElements = []

        // ── LCARS background – same nineslice config as MainMenuScene ──
        const IMAGE_WIDTH = 1280
        const IMAGE_HEIGHT = 876
        const UPPER_BLACK_BOTTOM_Y = 275  // texture y of upper black section bottom
        const LOWER_BLACK_START_Y = 490   // texture y where lower black area begins
        const scale = width / IMAGE_WIDTH
        const neededHeight = Math.max(IMAGE_HEIGHT, Math.ceil(height / scale))
        this.add.nineslice(
            0, 0,
            'lcars-menu-background', null,
            IMAGE_WIDTH, neededHeight,
            0, 0, IMAGE_HEIGHT - 1, 0
        ).setOrigin(0, 0).setScale(scale)

        const lcarsFont = 'Antonio, Oswald, Arial Narrow, sans-serif'
        // Left chrome panel is ~12.9% (165px at 1280px) of image width
        const lcarsChromePad = Math.round(165 * width / 1280) + 8
        this.lcarsChromePad = lcarsChromePad

        const btnW = Math.min(Math.round(width * 0.65), 340)
        const btnLeft = Math.round(width / 2 - btnW / 2)

        // ── Upper black section ──
        const upperBlackBottom = Math.round(UPPER_BLACK_BOTTOM_Y * scale)
        const titleSize = upperBlackBottom > 200 ? '60px' : upperBlackBottom > 120 ? '40px' : '28px'
        const titleY = Math.round(upperBlackBottom * 0.50)

        this.isMobile = isMobile

        // ← MAIN MENU – interactive back button in the upper area
        this.backBtn = this.add.text(btnLeft, titleY, '← MAIN MENU', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)
        // Use an explicit zone for the hit target so the touch area is always
        // large enough regardless of rendered text size (important on mobile).
        const backZoneW = Math.min(Math.round(width * 0.55), 360)
        const backZoneH = Math.max(parseInt(titleSize), 44) + 8
        this.backBtnZone = this.add.zone(btnLeft + backZoneW / 2, titleY, backZoneW, backZoneH)
            .setInteractive({ useHandCursor: true })
        this.backBtnZone.on('pointerover', () => this.backBtn.setStyle({ color: '#FFCC44' }))
        this.backBtnZone.on('pointerout',  () => this.backBtn.setStyle({ color: '#FF9900' }))
        this.backBtnZone.on('pointerdown', () => {
            this.sound.play('button-click')
            this.navigateBack()
        })

        // MISSION SELECT subtitle – tucked below the back button, carries secret tap counter
        const subY = Math.round(titleY + (upperBlackBottom - titleY) * 0.60)
        const subSize = isMobile ? '13px' : '15px'
        this.missionSubtitle = this.add.text(btnLeft, subY, 'MISSION SELECT', {
            fontSize: subSize,
            color: '#FFAA44',
            fontFamily: lcarsFont
        }).setOrigin(0, 0.5)

        // Secret tap handler on subtitle
        const hitArea = new Phaser.Geom.Rectangle(-10, -20, 300, 40)
        this.missionSubtitle.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
        this.missionSubtitle.on('pointerdown', () => {
            this.secretTapCount++
            console.log(`Tap ${this.secretTapCount}/5 on MISSION SELECT`)
            if (this.secretTapTimer) this.secretTapTimer.remove()
            this.secretTapTimer = this.time.delayedCall(2000, () => { this.secretTapCount = 0 })
            if (this.secretTapCount >= 5) this.unlockSecretLevel()
        })

        // ── Lower black section ──
        const lowerBlackStart = Math.round(LOWER_BLACK_START_Y * scale)

        // Info panel (left side of lower area)
        this.createInfoPanel(isMobile, lcarsFont, lcarsChromePad, lowerBlackStart)

        // Level map (right side of lower area)
        this.createLevelMap(isMobile, lcarsFont, lcarsChromePad, lowerBlackStart)

        // Keyboard shortcut
        this.input.keyboard.once('keydown-ESC', () => { this.navigateBack() })

        // Update info panel with initial selection
        this.updateInfoPanel()

        // ── Fade-in animation (top → bottom stagger) ──
        this.performFadeIn()
    }

    // ── LCARS button (rounded rectangle) – same helper as UpgradesScene ──
    createLcarsButton(x, y, btnWidth, btnHeight, radius, fontFamily, label, fillColor, textColor, onPress) {
        const bg = this.add.graphics()
        const drawBg = (alpha) => {
            bg.clear()
            bg.fillStyle(fillColor, alpha)
            bg.fillRoundedRect(x - btnWidth / 2, y, btnWidth, btnHeight, radius)
        }
        drawBg(1)

        const btnFontSize = btnHeight > 42 ? '18px' : '14px'
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

    createInfoPanel(isMobile, lcarsFont, lcarsChromePad, lowerBlackStart) {
        const width  = this.cameras.main.width
        const height = this.cameras.main.height

        let panelX, panelY, panelWidth, panelHeight

        if (isMobile) {
            panelX      = lcarsChromePad
            panelY      = lowerBlackStart + 8
            panelWidth  = Math.round(width * 0.40)
            panelHeight = height - panelY - 8
        } else {
            panelX      = lcarsChromePad
            panelY      = lowerBlackStart + 14
            panelWidth  = Math.round(width * 0.33)
            panelHeight = height - panelY - 14
        }

        // LCARS-styled panel background
        this.infoPanelBg = this.add.graphics()
        this.infoPanelBg.fillStyle(0x080818, 0.88)
        this.infoPanelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 6)
        this.infoPanelBg.lineStyle(1, 0xFF9900, 0.35)
        this.infoPanelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 6)

        const padding   = isMobile ? 10 : 16
        const nameSize  = isMobile ? '18px' : '22px'
        const descSize  = isMobile ? '13px' : '15px'
        const statsSize = isMobile ? '12px' : '14px'

        // Store for dynamic repositioning in updateInfoPanel()
        this.infoPanelTextX    = panelX + padding
        this.infoPanelTextBaseY = panelY + padding
        this.infoPanelLineGap  = isMobile ? 8 : 10

        this.infoPanelTexts = {
            levelName: this.add.text(this.infoPanelTextX, this.infoPanelTextBaseY, '', {
                fontSize: nameSize,
                color: '#FF9900',
                fontFamily: lcarsFont,
                fontStyle: 'bold',
                wordWrap: { width: panelWidth - padding * 2 }
            }),
            description: this.add.text(this.infoPanelTextX, this.infoPanelTextBaseY, '', {
                fontSize: descSize,
                color: '#CCCCCC',
                fontFamily: lcarsFont,
                wordWrap: { width: panelWidth - padding * 2 }
            }),
            stats: this.add.text(this.infoPanelTextX, this.infoPanelTextBaseY, '', {
                fontSize: statsSize,
                color: '#66CCFF',
                fontFamily: lcarsFont,
                wordWrap: { width: panelWidth - padding * 2 }
            }),
            locked: this.add.text(this.infoPanelTextX, this.infoPanelTextBaseY, '', {
                fontSize: descSize,
                color: '#CC4444',
                fontFamily: lcarsFont,
                wordWrap: { width: panelWidth - padding * 2 }
            })
        }

        // Launch button at bottom of panel
        const btnH  = isMobile ? 32 : 38
        const btnY  = panelY + panelHeight - (isMobile ? 44 : 54)
        const btnBW = panelWidth - padding * 2
        const btnCX = panelX + padding + btnBW / 2
        this.launchBtn = this.createLcarsButton(
            btnCX, btnY, btnBW, btnH, 6, lcarsFont,
            isMobile ? 'LAUNCH' : 'LAUNCH MISSION',
            0xFF9900, '#000000',
            () => { this.launchLevel() }
        )
    }

    createLevelMap(isMobile, lcarsFont, lcarsChromePad, lowerBlackStart) {
        const width  = this.cameras.main.width
        const height = this.cameras.main.height
        const rightChromePad = Math.round(20 * width / 1280) + 5

        let levelPositions

        if (isMobile) {
            // Map area: right of info panel
            const mapLeft   = lcarsChromePad + Math.round(width * 0.43)
            const mapRight  = width - rightChromePad
            const mapTop    = lowerBlackStart + 10
            const mapBottom = height - 10
            const mw = mapRight - mapLeft
            const mh = mapBottom - mapTop

            levelPositions = [
                { x: mapLeft + mw * 0.20, y: mapTop + mh * 0.04 },  // Level 1
                { x: mapLeft + mw * 0.78, y: mapTop + mh * 0.04 },  // Level 2
                { x: mapLeft + mw * 0.20, y: mapTop + mh * 0.18 },  // Level 3
                { x: mapLeft + mw * 0.78, y: mapTop + mh * 0.18 },  // Level 4
                { x: mapLeft + mw * 0.20, y: mapTop + mh * 0.32 },  // Level 5
                { x: mapLeft + mw * 0.78, y: mapTop + mh * 0.32 },  // Level 6
                { x: mapLeft + mw * 0.20, y: mapTop + mh * 0.46 },  // Level 7
                { x: mapLeft + mw * 0.78, y: mapTop + mh * 0.46 },  // Level 8
                { x: mapLeft + mw * 0.20, y: mapTop + mh * 0.60 },  // Level 9
                { x: mapLeft + mw * 0.78, y: mapTop + mh * 0.60 },  // Level 10
                { x: mapLeft + mw * 0.50, y: mapTop + mh * 0.76 }   // Level 11 (secret)
            ]
        } else {
            // Map area: right of the info panel
            const mapLeft   = lcarsChromePad + Math.round(width * 0.36)
            const mapRight  = width - rightChromePad
            const mapTop    = lowerBlackStart + 20
            const mapBottom = height - 20
            const mw = mapRight - mapLeft
            const mh = mapBottom - mapTop

            levelPositions = [
                { x: mapLeft + mw * 0.10, y: mapTop + mh * 0.08 },  // Level 1
                { x: mapLeft + mw * 0.30, y: mapTop + mh * 0.16 },  // Level 2
                { x: mapLeft + mw * 0.52, y: mapTop + mh * 0.08 },  // Level 3
                { x: mapLeft + mw * 0.72, y: mapTop + mh * 0.16 },  // Level 4
                { x: mapLeft + mw * 0.88, y: mapTop + mh * 0.30 },  // Level 5
                { x: mapLeft + mw * 0.80, y: mapTop + mh * 0.50 },  // Level 6
                { x: mapLeft + mw * 0.60, y: mapTop + mh * 0.58 },  // Level 7
                { x: mapLeft + mw * 0.40, y: mapTop + mh * 0.50 },  // Level 8
                { x: mapLeft + mw * 0.24, y: mapTop + mh * 0.64 },  // Level 9
                { x: mapLeft + mw * 0.10, y: mapTop + mh * 0.78 },  // Level 10
                { x: mapLeft + mw * 0.50, y: mapTop + mh * 0.88 }   // Level 11 (secret)
            ]
        }

        this.levelNodes = []

        // Connecting lines between levels
        const graphics = this.add.graphics()
        graphics.lineStyle(2, 0x00FFFF, 0.3)
        for (let i = 0; i < levelPositions.length - 1; i++) {
            const s = levelPositions[i]
            const e = levelPositions[i + 1]
            graphics.lineBetween(s.x, s.y, e.x, e.y)
        }
        this.mapElements.push(graphics)

        const nodeSize  = isMobile ? 15 : 20
        const fontSize  = isMobile ? '12px' : '16px'
        const aboveNode = isMobile ? -25 : -35

        for (let i = 1; i <= 11; i++) {
            const pos         = levelPositions[i - 1]
            const isUnlocked  = ProgressConfig.isLevelUnlocked(i, this.saveData)
            const stats       = ProgressConfig.getLevelStats(i, this.saveData)
            const isCompleted = stats !== null

            const nodeColor = isCompleted ? 0x00FF00 : (isUnlocked ? 0xFFFF00 : 0x666666)
            const nodeAlpha = isUnlocked ? 1.0 : 0.5

            const node = this.add.circle(pos.x, pos.y, nodeSize, nodeColor, nodeAlpha)
            node.setStrokeStyle(isMobile ? 2 : 3, 0x00FFFF, nodeAlpha)
            this.mapElements.push(node)

            if (isUnlocked) {
                node.setInteractive({ useHandCursor: true })
                node.on('pointerdown', () => { this.sound.play('button-click'); this.selectLevel(i) })
                node.on('pointerover', () => { node.setScale(1.2); node.setAlpha(1.0) })
                node.on('pointerout',  () => { node.setScale(1.0); node.setAlpha(nodeAlpha) })
            }

            // Level number label
            const levelText = this.add.text(pos.x, pos.y, i.toString(), {
                fontSize: fontSize,
                color: '#000000',
                fontFamily: lcarsFont,
                fontStyle: 'bold'
            }).setOrigin(0.5)
            this.mapElements.push(levelText)

            // Completion star
            if (isCompleted) {
                const star = this.add.text(pos.x, pos.y + aboveNode, '★', {
                    fontSize: isMobile ? '16px' : '20px',
                    color: '#FFD700'
                }).setOrigin(0.5)
                this.mapElements.push(star)
            }

            // Lock icon for locked levels
            if (!isUnlocked) {
                const lock = this.add.text(pos.x, pos.y + aboveNode, '🔒', {
                    fontSize: isMobile ? '12px' : '16px'
                }).setOrigin(0.5)
                this.mapElements.push(lock)
            }

            this.levelNodes.push({ node, levelNumber: i, isUnlocked })
        }
    }

    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber
        this.updateInfoPanel()
        console.log(`Selected level ${levelNumber}`)
    }

    updateInfoPanel() {
        const levelInfo  = ProgressConfig.levelInfo[this.selectedLevel]
        const isUnlocked = ProgressConfig.isLevelUnlocked(this.selectedLevel, this.saveData)
        const stats      = ProgressConfig.getLevelStats(this.selectedLevel, this.saveData)
        const tx         = this.infoPanelTexts
        const gap        = this.infoPanelLineGap

        // Set level name first so we can measure its rendered height
        if (isUnlocked) {
            tx.levelName.setText(`LEVEL ${this.selectedLevel}: ${levelInfo.name}`)
            tx.description.setText(levelInfo.description)
        } else {
            tx.levelName.setText(`LEVEL ${this.selectedLevel}: ???`)
            tx.description.setText('Complete previous missions to unlock')
        }

        // Reposition description below the rendered level name
        tx.description.setY(tx.levelName.y + tx.levelName.height + gap)

        // Reposition stats/locked below the rendered description
        const statsY = tx.description.y + tx.description.height + gap
        tx.stats.setY(statsY)
        tx.locked.setY(statsY)

        if (stats) {
            tx.stats.setText(
                `STATUS: COMPLETED ★\n\n` +
                `High Score: ${stats.highScore}\n` +
                `Enemies Defeated: ${stats.enemiesKilled}\n` +
                `Pods Rescued: ${stats.podsRescued}\n` +
                `Waves Cleared: ${stats.wave}`
            )
            tx.stats.setVisible(true)
            tx.locked.setVisible(false)
            this.launchBtn.bg.setVisible(true)
            this.launchBtn.text.setVisible(true)
            this.launchBtn.zone.setInteractive()
        } else if (isUnlocked) {
            tx.stats.setText('STATUS: READY\n\nMission not yet attempted')
            tx.stats.setVisible(true)
            tx.locked.setVisible(false)
            this.launchBtn.bg.setVisible(true)
            this.launchBtn.text.setVisible(true)
            this.launchBtn.zone.setInteractive()
        } else {
            tx.stats.setVisible(false)
            tx.locked.setText('🔒 LOCKED\n\nComplete previous missions to unlock this level')
            tx.locked.setVisible(true)
            this.launchBtn.bg.setVisible(false)
            this.launchBtn.text.setVisible(false)
            this.launchBtn.zone.disableInteractive()
        }
    }

    launchLevel() {
        const isUnlocked = ProgressConfig.isLevelUnlocked(this.selectedLevel, this.saveData)
        if (isUnlocked) {
            console.log(`Launching Level ${this.selectedLevel}`)
            // All levels use Level1Scene with level number parameter
            this.scene.start('Level1Scene', { levelNumber: this.selectedLevel })
        }
    }

    unlockSecretLevel() {
        console.log('Secret testing level unlocked!')
        ProgressConfig.unlockLevel(11, this.saveData)
        this.secretTapCount = 0
        if (this.secretTapTimer) this.secretTapTimer.remove()
        // Recreate the level map to show level 11
        this.scene.restart()
    }

    // ── Helpers to build ordered fade groups (top → bottom) ──

    buildFadeGroups() {
        return [
            [this.backBtn, this.missionSubtitle],
            [
                this.infoPanelBg,
                this.infoPanelTexts.levelName,
                this.infoPanelTexts.description,
                this.infoPanelTexts.stats,
                this.infoPanelTexts.locked,
                this.launchBtn.bg,
                this.launchBtn.text
            ],
            this.mapElements
        ]
    }

    performFadeIn() {
        const groups = this.buildFadeGroups()
        const GAP_MS = 150
        const DUR_MS = 400
        groups.forEach((group, i) => {
            group.forEach(el => el.setAlpha(0))
            this.tweens.add({
                targets: group,
                alpha: 1,
                duration: DUR_MS,
                delay: i * GAP_MS,
                ease: 'Linear'
            })
        })
    }

    navigateBack() {
        if (this.isNavigatingBack) return
        this.isNavigatingBack = true

        // Stop any running tweens (e.g. the fade-in) to avoid conflicts
        this.tweens.killAll()

        // Disable all interactive elements
        this.backBtnZone.disableInteractive()
        this.missionSubtitle.disableInteractive()
        if (this.launchBtn) this.launchBtn.zone.disableInteractive()
        this.levelNodes.forEach(({ node }) => node.disableInteractive())

        const groups  = this.buildFadeGroups()
        const GAP_MS  = 100
        const DUR_MS  = 300
        groups.forEach((group, i) => {
            this.tweens.add({
                targets: group,
                alpha: 0,
                duration: DUR_MS,
                delay: i * GAP_MS,
                ease: 'Linear'
            })
        })

        const totalDelay = (groups.length - 1) * GAP_MS + DUR_MS
        this.time.delayedCall(totalDelay, () => {
            this.scene.start('MainMenuScene')
        })
    }
}
