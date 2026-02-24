// Upgrades Scene - Ship upgrade system with LCARS theme
class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600

        console.log('UpgradesScene: Opening upgrades...')

        this.saveData = ProgressConfig.loadProgress()
        this.selectedCategory = 'offensive'
        this.upgradeElements = []
        this.isNavigatingBack = false

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
        const btnW = Math.min(Math.round(width * 0.65), 340)
        const btnLeft = Math.round(width / 2 - btnW / 2)

        // ── Upper black section ──
        const upperBlackBottom = Math.round(UPPER_BLACK_BOTTOM_Y * scale)
        const titleSize = upperBlackBottom > 200 ? '60px' : upperBlackBottom > 120 ? '40px' : '28px'
        const titleY = Math.round(upperBlackBottom * 0.50)

        // ← MAIN MENU – interactive back button in the same position as MainMenuScene title
        this.ussAurora = this.add.text(btnLeft, titleY, '← MAIN MENU', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: lcarsFont,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)
        this.ussAurora.setInteractive({ useHandCursor: true })
        this.ussAurora.on('pointerover', () => this.ussAurora.setStyle({ color: '#FFCC44' }))
        this.ussAurora.on('pointerout',  () => this.ussAurora.setStyle({ color: '#FF9900' }))
        this.ussAurora.on('pointerdown', () => {
            this.sound.play('button-click')
            this.navigateBack()
        })

        // Credits display – tucked in the upper area below USS Aurora
        const creditsY = Math.round(titleY + (upperBlackBottom - titleY) * 0.60)
        const creditsSize = isMobile ? '13px' : '15px'
        this.creditsText = this.add.text(btnLeft, creditsY,
            `${this.saveData.upgradePoints} upgrade points available`, {
                fontSize: creditsSize,
                color: '#FFAA44',
                fontFamily: lcarsFont
            }).setOrigin(0, 0.5)

        // ── Lower black section ──
        const lowerBlackStart = Math.round(LOWER_BLACK_START_Y * scale)
        const topPad    = isMobile ? 12 : 20
        const tabH      = isMobile ? 32 : 38
        const tabRadius = 8
        const tabGap    = isMobile ? 6  : 8
        const tabY      = lowerBlackStart + topPad

        // Three category tabs side-by-side using LCARS button style.
        // lcarsChromePad keeps all content within the visible black area on every screen
        // size: the LCARS left panel is ~12.9% (165 px at 1280 px) of the image width.
        const lcarsChromePad = Math.round(165 * width / 1280) + 8
        const maxContentWidth = width - 2 * lcarsChromePad
        this.lcarsChromePad = lcarsChromePad
        const tabW = Math.min(Math.floor((maxContentWidth - 2 * tabGap) / 3), 175)
        const totalTabsWidth = 3 * tabW + 2 * tabGap
        const tabsStartX = Math.round(width / 2 - totalTabsWidth / 2)

        const TAB_CONFIGS = [
            { key: 'offensive', label: 'OFFENSIVE', activeColor: 0xFF6600 },
            { key: 'defensive', label: 'DEFENSIVE', activeColor: 0x5577CC },
            { key: 'movement',  label: 'MOVEMENT',  activeColor: 0xBB9900 }
        ]

        this.categoryButtons = {}
        TAB_CONFIGS.forEach((cfg, i) => {
            const tx = tabsStartX + i * (tabW + tabGap) + tabW / 2
            const btn = this.createCategoryTab(
                tx, tabY, tabW, tabH, tabRadius, lcarsFont,
                cfg.label, cfg.key, cfg.activeColor, isMobile
            )
            this.categoryButtons[cfg.key] = btn
        })

        // ── Upgrade list ──
        // Compute spacing/boxH dynamically so items + reset button always fit
        // within the screen, even at 16:9 resolutions like 1280×720.
        const listGap = isMobile ? 8 : 10
        const listStartY = tabY + tabH + listGap
        this.upgradeListY = listStartY
        this.isMobile = isMobile

        const ITEM_COUNT   = 3
        const normalSpacing = isMobile ? 70 : 56
        const normalBoxH    = isMobile ? 60 : 50
        const normalResetH  = isMobile ? 32 : 34
        const normalResetGap = isMobile ? 8 : 10
        const normalFooterPad = isMobile ? 10 : 14
        const normalTotalNeeded = (ITEM_COUNT - 1) * normalSpacing + normalBoxH
            + normalResetGap + normalResetH + normalFooterPad

        // Switch to compact mode (desktop only) when the screen is too short
        // to fit 3 items + reset button without overlap.
        const compact = !isMobile && (height - listStartY) < (normalTotalNeeded - 10)
        this.compact  = compact
        this.spacing  = compact ? 44 : normalSpacing
        this.boxH     = compact ? 36 : normalBoxH

        const resetH      = compact ? 30 : normalResetH
        const resetGap    = compact ? 6  : normalResetGap
        const footerPad   = compact ? 4  : normalFooterPad
        const resetBtnW   = Math.min(Math.round(width * 0.55), 280)

        // Position reset button so it starts after the last item and fits on screen.
        const naturalResetY = listStartY + (ITEM_COUNT - 1) * this.spacing + this.boxH + resetGap
        const resetY = Math.min(naturalResetY, height - footerPad - resetH)

        this.createUpgradeList(isMobile)

        this.resetButton = this.createLcarsButton(
            width / 2, resetY, resetBtnW, resetH, 8, lcarsFont,
            'RESET ALL UPGRADES', 0xCC3300, '#FFFFFF',
            () => { this.resetUpgrades() }
        )

        // Keyboard shortcut
        this.input.keyboard.once('keydown-ESC', () => { this.navigateBack() })

        // ── Fade-in animation (top → bottom stagger) ──
        this.performFadeIn()
    }

    // ── LCARS button (rounded rectangle) – same helper as MainMenuScene ──
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

    // ── Category tab – like a LCARS button but tracks active/inactive fill ──
    createCategoryTab(x, y, w, h, radius, fontFamily, label, key, activeColor, isMobile) {
        const INACTIVE_COLOR = 0x2A2A44
        const isActive = () => key === this.selectedCategory

        const bg = this.add.graphics()
        const drawBg = (color) => {
            bg.clear()
            bg.fillStyle(color, 1)
            bg.fillRoundedRect(x - w / 2, y, w, h, radius)
        }
        drawBg(isActive() ? activeColor : INACTIVE_COLOR)

        const tabFontSize = isMobile ? '13px' : '15px'
        const text = this.add.text(x, y + h / 2, label, {
            fontSize: tabFontSize,
            color: isActive() ? '#000000' : '#7777AA',
            fontFamily: fontFamily,
            fontStyle: 'bold'
        }).setOrigin(0.5)

        const zone = this.add.zone(x, y + h / 2, w, h).setInteractive()
        zone.on('pointerdown', () => { this.sound.play('button-click'); this.switchCategory(key) })
        zone.on('pointerover', () => { if (!isActive()) drawBg(0x444466) })
        zone.on('pointerout',  () => { drawBg(isActive() ? activeColor : INACTIVE_COLOR) })

        return { bg, text, zone, drawBg, activeColor, INACTIVE_COLOR }
    }

    switchCategory(key) {
        if (this.selectedCategory === key) return
        this.selectedCategory = key

        // Update tab visuals
        Object.keys(this.categoryButtons).forEach(k => {
            const btn = this.categoryButtons[k]
            const active = k === key
            btn.drawBg(active ? btn.activeColor : btn.INACTIVE_COLOR)
            btn.text.setStyle({ color: active ? '#000000' : '#7777AA' })
        })

        this.clearUpgradeList()
        this.createUpgradeList(this.isMobile)
    }

    clearUpgradeList() {
        if (this.upgradeElements) {
            this.upgradeElements.forEach(el => el.destroy())
        }
        this.upgradeElements = []
    }

    createUpgradeList(isMobile) {
        this.upgradeElements = []
        const width = this.cameras.main.width
        const upgrades = UpgradesConfig.getUpgradesByCategory(this.selectedCategory)
        const lcarsFont = 'Antonio, Oswald, Arial Narrow, sans-serif'

        const startY   = this.upgradeListY
        const spacing  = this.spacing
        const boxH     = this.boxH
        const compact  = this.compact
        const boxWidth = width - 2 * this.lcarsChromePad
        const nameSize  = compact ? '13px' : (isMobile ? '14px' : '15px')
        const levelSize = compact ? '11px' : (isMobile ? '12px' : '13px')
        const btnSize   = compact ? '11px' : (isMobile ? '12px' : '13px')
        // Text row positions within each box (proportional to boxH)
        const nameRelY  = Math.round(boxH * 0.18)
        const levelRelY = Math.round(boxH * 0.48)
        const btnRelY   = Math.round(boxH * 0.76)

        upgrades.forEach((upgrade, index) => {
            const y = startY + index * spacing
            const currentLevel = this.saveData.upgrades[upgrade.key] || 0
            const maxLevel = upgrade.maxLevel
            const cost = UpgradesConfig.getCostToUpgrade(upgrade.key, currentLevel)
            const canAfford = cost !== null && this.saveData.upgradePoints >= cost
            const isMaxed = currentLevel >= maxLevel

            // Box background with subtle LCARS accent border
            const boxBg = this.add.graphics()
            boxBg.fillStyle(0x080818, 0.88)
            boxBg.fillRoundedRect(width / 2 - boxWidth / 2, y, boxWidth, boxH, 6)
            boxBg.lineStyle(1, 0xFF9900, 0.35)
            boxBg.strokeRoundedRect(width / 2 - boxWidth / 2, y, boxWidth, boxH, 6)
            this.upgradeElements.push(boxBg)

            // Upgrade name
            const nameText = this.add.text(width / 2, y + nameRelY, upgrade.name, {
                fontSize: nameSize,
                color: '#FFFFFF',
                fontFamily: lcarsFont,
                fontStyle: 'bold'
            }).setOrigin(0.5)
            this.upgradeElements.push(nameText)

            // Level indicator
            const levelText = this.add.text(width / 2, y + levelRelY, `Level: ${currentLevel} / ${maxLevel}`, {
                fontSize: levelSize,
                color: '#66CCFF',
                fontFamily: lcarsFont
            }).setOrigin(0.5)
            this.upgradeElements.push(levelText)

            // Purchase or max-level label
            const btnY = y + btnRelY
            if (!isMaxed) {
                const btnLabel = `[ UPGRADE - ${cost} pts ]`
                const btnColor = canAfford ? '#FF9900' : '#555577'
                const btn = this.add.text(width / 2, btnY, btnLabel, {
                    fontSize: btnSize,
                    color: btnColor,
                    fontFamily: lcarsFont,
                    fontStyle: 'bold'
                }).setOrigin(0.5)
                if (canAfford) {
                    btn.setInteractive({ useHandCursor: true })
                    btn.on('pointerdown', () => {
                        this.sound.play('button-click')
                        this.purchaseUpgrade(upgrade.key, cost)
                    })
                    btn.on('pointerover', () => { btn.setStyle({ color: '#FFCC44' }); btn.setScale(1.04) })
                    btn.on('pointerout',  () => { btn.setStyle({ color: '#FF9900' }); btn.setScale(1) })
                }
                this.upgradeElements.push(btn)
            } else {
                const maxTxt = this.add.text(width / 2, btnY, '[ MAX LEVEL ]', {
                    fontSize: btnSize,
                    color: '#FFD700',
                    fontFamily: lcarsFont,
                    fontStyle: 'bold'
                }).setOrigin(0.5)
                this.upgradeElements.push(maxTxt)
            }
        })
    }

    // ── Helpers to build ordered fade groups (top → bottom) ──

    buildUpgradeItemGroups() {
        // Each upgrade item pushes exactly 4 elements in createUpgradeList:
        // boxBg, nameText, levelText, purchaseBtn/maxTxt
        const ELEMS_PER_ITEM = 4
        const groups = []
        for (let i = 0; i < this.upgradeElements.length; i += ELEMS_PER_ITEM) {
            groups.push(this.upgradeElements.slice(i, i + ELEMS_PER_ITEM))
        }
        return groups
    }

    buildCurrentFadeGroups() {
        return [
            [this.ussAurora, this.creditsText],
            ...Object.values(this.categoryButtons).map(btn => [btn.bg, btn.text]),
            ...this.buildUpgradeItemGroups(),
            [this.resetButton.bg, this.resetButton.text]
        ]
    }

    performFadeIn() {
        const groups = this.buildCurrentFadeGroups()
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

        // Disable all interactive zones
        this.ussAurora.disableInteractive()
        Object.values(this.categoryButtons).forEach(btn => btn.zone.disableInteractive())
        if (this.resetButton) this.resetButton.zone.disableInteractive()

        const groups = this.buildCurrentFadeGroups()
        const GAP_MS = 100
        const DUR_MS = 300
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

    purchaseUpgrade(upgradeKey, cost) {
        const currentLevel = this.saveData.upgrades[upgradeKey] || 0
        this.saveData.upgrades[upgradeKey] = currentLevel + 1
        this.saveData.upgradePoints -= cost
        ProgressConfig.saveProgress(this.saveData)
        this.creditsText.setText(`${this.saveData.upgradePoints} upgrade points available`)
        this.clearUpgradeList()
        this.createUpgradeList(this.isMobile)
        console.log(`Purchased ${upgradeKey} level ${currentLevel + 1}`)
    }

    resetUpgrades() {
        let totalRefund = 0
        Object.keys(this.saveData.upgrades).forEach(upgradeKey => {
            const currentLevel = this.saveData.upgrades[upgradeKey]
            if (currentLevel > 0) {
                const upgrade = UpgradesConfig.upgrades[upgradeKey]
                if (upgrade) totalRefund += upgrade.costPerLevel * currentLevel
            }
        })
        Object.keys(this.saveData.upgrades).forEach(upgradeKey => {
            this.saveData.upgrades[upgradeKey] = 0
        })
        this.saveData.upgradePoints += totalRefund
        ProgressConfig.saveProgress(this.saveData)
        this.creditsText.setText(`${this.saveData.upgradePoints} upgrade points available`)
        this.clearUpgradeList()
        this.createUpgradeList(this.isMobile)
        console.log(`All upgrades reset. Refunded ${totalRefund} credits.`)
    }
}
