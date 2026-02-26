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

        // ← MAIN MENU – interactive back button, identical pattern to UpgradesScene
        this.backBtn = this.add.text(btnLeft, titleY, '← MAIN MENU', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)
        this.backBtn.setInteractive({ useHandCursor: true })
        this.backBtn.on('pointerover', () => this.backBtn.setStyle({ color: '#FFCC44' }))
        this.backBtn.on('pointerout',  () => this.backBtn.setStyle({ color: '#FF9900' }))
        this.backBtn.on('pointerdown', () => {
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

        // Secret tap handler – use natural text bounds so the hit area never
        // overlaps the back button above it
        this.missionSubtitle.setInteractive({ useHandCursor: false })
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
        let _y = y
        const drawBg = (alpha) => {
            bg.clear()
            bg.fillStyle(fillColor, alpha)
            bg.fillRoundedRect(x - btnWidth / 2, _y, btnWidth, btnHeight, radius)
        }
        drawBg(1)

        const btnFontSize = btnHeight > 42 ? '18px' : '14px'
        const text = this.add.text(x, _y + btnHeight / 2, label, {
            fontSize: btnFontSize,
            color: textColor,
            fontFamily: fontFamily,
            fontStyle: 'bold'
        }).setOrigin(0.5)

        const zone = this.add.zone(x, _y + btnHeight / 2, btnWidth, btnHeight).setInteractive()
        zone.on('pointerdown', () => { this.sound.play('button-click'); onPress() })
        zone.on('pointerover', () => { drawBg(0.7); text.setScale(1.04) })
        zone.on('pointerout',  () => { drawBg(1);   text.setScale(1.0)  })

        // moveButton(newY) redraws background and repositions text/zone at a new Y
        const moveButton = (newY) => {
            _y = newY
            drawBg(1)
            text.setY(newY + btnHeight / 2)
            zone.setY(newY + btnHeight / 2)
        }

        return { bg, text, zone, moveButton }
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

        // Launch button – Y position is set dynamically in updateInfoPanel()
        // so it always appears directly below the content, never off-screen.
        const btnH  = isMobile ? 36 : 42
        const btnBW = panelWidth - padding * 2
        const btnCX = panelX + padding + btnBW / 2
        this.launchBtnH  = btnH
        this.launchBtnCX = btnCX
        this.launchBtn = this.createLcarsButton(
            btnCX, panelY + padding, btnBW, btnH, 6, lcarsFont,
            isMobile ? 'LAUNCH' : 'LAUNCH MISSION',
            0xFF9900, '#000000',
            () => { this.launchLevel() }
        )
    }

    createLevelMap(isMobile, lcarsFont, lcarsChromePad, lowerBlackStart) {
        const width  = this.cameras.main.width
        const height = this.cameras.main.height
        const rightChromePad = Math.round(20 * width / 1280) + 5

        // Map area boundaries (right of info panel)
        const mapLeft   = lcarsChromePad + Math.round(width * (isMobile ? 0.43 : 0.36))
        const mapRight  = width - rightChromePad
        const mapTop    = lowerBlackStart + (isMobile ? 10 : 20)
        const mapBottom = height - (isMobile ? 10 : 20)
        const mw = mapRight - mapLeft
        const mh = mapBottom - mapTop

        // LCARS grid layout: 5 columns on desktop, 3 on mobile
        const cols    = isMobile ? 3 : 5
        const btnGap  = isMobile ? 5 : 7
        const btnW    = Math.floor((mw - (cols - 1) * btnGap) / cols)
        const rows    = Math.ceil(10 / cols)
        // Cap button height; leave vertical room for the secret level row
        const btnH    = Math.min(
            Math.floor((mh - rows * btnGap) / (rows + 0.6)),
            isMobile ? 54 : 62
        )

        // Helper: compute bounding rect for level i
        const getBtnRect = (i) => {
            if (i <= 10) {
                const col = (i - 1) % cols
                const row = Math.floor((i - 1) / cols)
                return {
                    x: mapLeft + col * (btnW + btnGap),
                    y: mapTop  + row * (btnH + btnGap),
                    w: btnW,
                    h: btnH
                }
            }
            // Secret level 11: centred below the main grid, slightly smaller
            const secH = Math.round(btnH * 0.80)
            const secW = Math.min(Math.round(btnW * 1.6), Math.round(mw * 0.55))
            return {
                x: mapLeft + Math.round((mw - secW) / 2),
                y: mapTop  + rows * (btnH + btnGap) + btnGap,
                w: secW,
                h: secH
            }
        }

        // Store rects keyed by level for the selection-cursor overlay
        this.levelButtonRects = {}
        this.levelNodes = []

        for (let i = 1; i <= 11; i++) {
            const isUnlocked  = ProgressConfig.isLevelUnlocked(i, this.saveData)
            const stats       = ProgressConfig.getLevelStats(i, this.saveData)
            const isCompleted = stats !== null

            // Secret level 11 is hidden until unlocked
            if (i === 11 && !isUnlocked) {
                this.levelNodes.push({ node: null, levelNumber: i, isUnlocked: false })
                continue
            }

            const rect = getBtnRect(i)
            this.levelButtonRects[i] = rect

            // ── LCARS colour scheme based on mission state ──
            // Locked   : very dark navy, dim border, barely-visible text
            // Available: dark orange fill with bright orange border, black text
            // Completed: dark amber fill with gold border, gold text
            let fillColor, borderColor, textColor, statusIcon, statusColor
            if (!isUnlocked) {
                fillColor   = 0x0D0D1A
                borderColor = 0x222244
                textColor   = '#222244'
                statusIcon  = 'LOCKED'
                statusColor = '#222244'
            } else if (isCompleted) {
                fillColor   = 0x553300
                borderColor = 0xAA7700
                textColor   = '#FFD700'
                statusIcon  = '★'
                statusColor = '#FFD700'
            } else {
                fillColor   = 0xAA4400
                borderColor = 0xFF8800
                textColor   = '#000000'
                statusIcon  = '▶'
                statusColor = '#000000'
            }

            // Button background graphic (redrawn on hover)
            const bg = this.add.graphics()
            const redrawBg = (dimmed) => {
                bg.clear()
                bg.fillStyle(fillColor, dimmed ? 0.55 : 0.90)
                bg.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 4)
                bg.lineStyle(1, borderColor, dimmed ? 0.40 : 0.85)
                bg.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 4)
            }
            redrawBg(false)
            this.mapElements.push(bg)

            // Level number
            const numSize = isMobile ? '16px' : '20px'
            const numText = this.add.text(
                rect.x + rect.w / 2,
                rect.y + Math.round(rect.h * 0.34),
                String(i), {
                    fontSize: numSize,
                    color: textColor,
                    fontFamily: lcarsFont,
                    fontStyle: 'bold'
                }).setOrigin(0.5)
            this.mapElements.push(numText)

            // Status icon / label
            const iconSize = isMobile ? '11px' : '13px'
            const iconEl = this.add.text(
                rect.x + rect.w / 2,
                rect.y + Math.round(rect.h * 0.72),
                statusIcon, {
                    fontSize: iconSize,
                    color: statusColor,
                    fontFamily: lcarsFont,
                    fontStyle: 'bold'
                }).setOrigin(0.5)
            this.mapElements.push(iconEl)

            // Interactive zone for unlocked levels only
            if (isUnlocked) {
                const zone = this.add.zone(
                    rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h
                ).setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => { this.sound.play('button-click'); this.selectLevel(i) })
                zone.on('pointerover', () => redrawBg(true))
                zone.on('pointerout',  () => redrawBg(false))
                this.levelNodes.push({ node: zone, levelNumber: i, isUnlocked: true })
            } else {
                this.levelNodes.push({ node: null, levelNumber: i, isUnlocked: false })
            }
        }

        // Selection cursor drawn on top of all buttons
        this.selectionCursor = this.add.graphics()
        this.mapElements.push(this.selectionCursor)
        this.updateSelectionCursor()
    }

    // Redraws the cyan LCARS selection border around the currently selected level
    updateSelectionCursor() {
        if (!this.selectionCursor) return
        this.selectionCursor.clear()
        const rect = this.levelButtonRects && this.levelButtonRects[this.selectedLevel]
        if (!rect) return
        this.selectionCursor.lineStyle(2, 0x00FFFF, 1.0)
        this.selectionCursor.strokeRoundedRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2, 5)
    }

    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber
        this.updateInfoPanel()
        this.updateSelectionCursor()
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
            this.launchBtn.moveButton(tx.stats.y + tx.stats.height + gap * 2)
            this.launchBtn.bg.setVisible(true)
            this.launchBtn.text.setVisible(true)
            this.launchBtn.zone.setInteractive()
        } else if (isUnlocked) {
            tx.stats.setText('STATUS: READY\n\nMission not yet attempted')
            tx.stats.setVisible(true)
            tx.locked.setVisible(false)
            this.launchBtn.moveButton(tx.stats.y + tx.stats.height + gap * 2)
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

        // Disable all interactive elements – identical pattern to UpgradesScene
        this.backBtn.disableInteractive()
        this.missionSubtitle.disableInteractive()
        if (this.launchBtn) this.launchBtn.zone.disableInteractive()
        this.levelNodes.forEach(({ node }) => { if (node) node.disableInteractive() })

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
