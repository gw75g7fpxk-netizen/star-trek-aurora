// Upgrades Scene - Ship upgrade system
class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600
        
        console.log('UpgradesScene: Opening upgrades...')
        
        // Load progress data
        this.saveData = ProgressConfig.loadProgress()
        this.selectedCategory = 'offensive' // Default category

        // Background
        this.createStarfield()

        // LCARS header + footer bands
        const hH = isMobile ? 44 : 58
        const fH = isMobile ? 28 : 36
        this.lcarsHeaderH = hH
        this.lcarsFooterH = fH
        this.createLCARSHeader(width, height, hH, fH, isMobile)
        
        // Title placed inside the header band
        this.add.text(width / 2, hH / 2, 'SHIP UPGRADES', {
            fontSize: isMobile ? '22px' : '30px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        
        // Credits display (will be updated) — just below the header
        const pointsY = hH + (isMobile ? 20 : 24)
        this.pointsText = this.add.text(width / 2, pointsY, `Credits: ${this.saveData.upgradePoints}`, {
            fontSize: isMobile ? '16px' : '20px',
            color: '#FFCC00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        this.pointsText.setOrigin(0.5)
        
        // Category tabs (LCARS-styled, just below credits)
        this.createCategoryTabs(isMobile)
        
        // Upgrade list
        const listStartY = hH + (isMobile ? 90 : 110)
        this.upgradeListY = listStartY
        this.createUpgradeList(isMobile)
        
        // Reset button — anchored above the footer
        const resetButtonY = height - fH - (isMobile ? 52 : 58)
        const resetBtnW = isMobile ? 200 : 240
        const resetBtnH = isMobile ? 34 : 40
        const resetBg = this.add.rectangle(width / 2, resetButtonY, resetBtnW, resetBtnH, 0x330800, 1)
        resetBg.setStrokeStyle(2, 0xFF6600, 1)
        resetBg.setInteractive({ useHandCursor: true })
        const resetText = this.add.text(width / 2, resetButtonY, '[ RESET ALL UPGRADES ]', {
            fontSize: isMobile ? '14px' : '16px',
            color: '#FF6600',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        resetBg.on('pointerdown', () => this.resetUpgrades())
        resetBg.on('pointerover', () => {
            resetBg.setFillStyle(0x551100)
            resetText.setColor('#FF9900')
        })
        resetBg.on('pointerout', () => {
            resetBg.setFillStyle(0x330800)
            resetText.setColor('#FF6600')
        })
        
        // Back button in the orange footer bar
        const backButton = this.add.text(width / 2, height - fH / 2, '[ BACK TO MENU ]', {
            fontSize: isMobile ? '14px' : '16px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        backButton.setInteractive()
        backButton.on('pointerdown', () => this.scene.start('MainMenuScene'))
        backButton.on('pointerover', () => backButton.setColor('#333300'))
        backButton.on('pointerout', () => backButton.setColor('#000000'))
        
        // Keyboard shortcut
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MainMenuScene')
        })
    }

    // Converts a CSS hex colour string (e.g. '#FF6600') to a Phaser integer colour.
    hexToInt(hex) {
        return parseInt(hex.slice(1), 16)
    }

    // Draws a slim LCARS-style header band and footer bar (shared with LevelSelectScene style).
    createLCARSHeader(width, height, hH, fH, isMobile) {
        const gfx = this.add.graphics()

        // Orange header band (full width)
        gfx.fillStyle(0xFF9900, 1)
        gfx.fillRect(0, 0, width, hH)

        // Peach accent stripe on the left
        gfx.fillStyle(0xFF9966, 1)
        gfx.fillRect(0, 0, isMobile ? 60 : 80, hH)

        // System label on the left accent
        this.add.text(isMobile ? 30 : 40, hH / 2, 'LCARS', {
            fontSize: isMobile ? '10px' : '12px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Thin accent lines below the header
        gfx.fillStyle(0xFF9900, 0.5)
        gfx.fillRect(0, hH + 3, width, 2)
        gfx.fillStyle(0x9999CC, 0.35)
        gfx.fillRect(0, hH + 8, width, 1)

        // Orange footer bar
        gfx.fillStyle(0xFF9900, 1)
        gfx.fillRect(0, height - fH, width, fH)

        // Right-side header data tag
        this.add.text(width - 10, hH / 2, 'USS AURORA', {
            fontSize: isMobile ? '10px' : '13px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5)
    }
    
    createCategoryTabs(isMobile) {
        const width = this.cameras.main.width
        const hH = this.lcarsHeaderH || 58
        const tabY = hH + (isMobile ? 52 : 62)
        const tabW = isMobile ? 100 : 130
        const tabH = isMobile ? 28 : 34
        const tabSize = isMobile ? '13px' : '15px'
        const spacing = isMobile ? 110 : 145
        
        this.categoryTabs = {}
        const categories = ['offensive', 'defensive', 'movement']
        const startX = width / 2 - (categories.length - 1) * spacing / 2
        
        categories.forEach((categoryKey, index) => {
            const category = UpgradesConfig.categories[categoryKey]
            const x = startX + index * spacing
            const isActive = categoryKey === this.selectedCategory
            const activeColorInt = this.hexToInt(category.color)
            const inactiveColorInt = 0x333333

            const bg = this.add.rectangle(x, tabY, tabW, tabH, isActive ? activeColorInt : inactiveColorInt, 1)
            bg.setStrokeStyle(1, isActive ? activeColorInt : 0x666666, 1)
            bg.setInteractive({ useHandCursor: true })

            const tab = this.add.text(x, tabY, category.name, {
                fontSize: tabSize,
                color: isActive ? '#000000' : '#888888',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5)

            bg.on('pointerdown', () => {
                this.switchCategory(categoryKey)
            })
            bg.on('pointerover', () => {
                if (categoryKey !== this.selectedCategory) {
                    bg.setFillStyle(0x555555)
                    tab.setColor('#CCCCCC')
                }
            })
            bg.on('pointerout', () => {
                if (categoryKey !== this.selectedCategory) {
                    bg.setFillStyle(inactiveColorInt)
                    tab.setColor('#888888')
                }
            })
            
            this.categoryTabs[categoryKey] = { bg, text: tab }
        })
    }
    
    switchCategory(categoryKey) {
        if (this.selectedCategory === categoryKey) return
        
        this.selectedCategory = categoryKey
        
        // Update tab background and text colours
        Object.keys(this.categoryTabs).forEach(key => {
            const category = UpgradesConfig.categories[key]
            const { bg, text } = this.categoryTabs[key]
            const isActive = key === categoryKey
            const activeColorInt = this.hexToInt(category.color)
            bg.setFillStyle(isActive ? activeColorInt : 0x333333)
            bg.setStrokeStyle(1, isActive ? activeColorInt : 0x666666, 1)
            text.setColor(isActive ? '#000000' : '#888888')
        })
        
        // Recreate upgrade list
        this.clearUpgradeList()
        this.createUpgradeList(this.cameras.main.width < 600 || this.cameras.main.height < 600)
    }
    
    clearUpgradeList() {
        if (this.upgradeElements) {
            this.upgradeElements.forEach(element => element.destroy())
        }
        this.upgradeElements = []
    }
    
    createUpgradeList(isMobile) {
        this.upgradeElements = []
        const width = this.cameras.main.width
        const upgrades = UpgradesConfig.getUpgradesByCategory(this.selectedCategory)
        
        const startY = this.upgradeListY
        const spacing = isMobile ? 90 : 110
        const nameSize = isMobile ? '14px' : '16px'
        const descSize = isMobile ? '11px' : '12px'
        const levelSize = isMobile ? '12px' : '14px'
        const buttonSize = isMobile ? '12px' : '14px'
        
        upgrades.forEach((upgrade, index) => {
            const y = startY + index * spacing
            const currentLevel = this.saveData.upgrades[upgrade.key] || 0
            const maxLevel = upgrade.maxLevel
            const cost = UpgradesConfig.getCostToUpgrade(upgrade.key, currentLevel)
            const canAfford = cost !== null && this.saveData.upgradePoints >= cost
            const isMaxed = currentLevel >= maxLevel
            
            // Background box for this upgrade option
            const boxPadding = isMobile ? 8 : 10
            const boxWidth = isMobile ? width - 40 : width - 160
            const boxHeight = isMobile ? 75 : 80
            const boxX = width / 2
            const boxY = y + (isMobile ? 24 : 27)
            
            const background = this.add.rectangle(
                boxX,
                boxY,
                boxWidth,
                boxHeight,
                0x000000,
                0.7
            )
            this.upgradeElements.push(background)
            
            // Upgrade name
            const nameText = this.add.text(width / 2, y, upgrade.name, {
                fontSize: nameSize,
                color: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            })
            nameText.setOrigin(0.5)
            this.upgradeElements.push(nameText)
            
            // Description
            const descText = this.add.text(width / 2, y + (isMobile ? 16 : 18), upgrade.description, {
                fontSize: descSize,
                color: '#AAAAAA',
                fontFamily: 'Courier New, monospace'
            })
            descText.setOrigin(0.5)
            this.upgradeElements.push(descText)
            
            // Level indicator
            const levelText = this.add.text(width / 2, y + (isMobile ? 32 : 36), `Level: ${currentLevel} / ${maxLevel}`, {
                fontSize: levelSize,
                color: '#00FFFF',
                fontFamily: 'Courier New, monospace'
            })
            levelText.setOrigin(0.5)
            this.upgradeElements.push(levelText)
            
            // Upgrade button
            if (!isMaxed) {
                const buttonY = y + (isMobile ? 48 : 54)
                const buttonText = `[ UPGRADE - ${cost} Credits ]`
                const buttonColor = canAfford ? '#00FF00' : '#666666'
                
                const button = this.add.text(width / 2, buttonY, buttonText, {
                    fontSize: buttonSize,
                    color: buttonColor,
                    fontFamily: 'Courier New, monospace',
                    fontStyle: 'bold'
                })
                button.setOrigin(0.5)
                
                if (canAfford) {
                    button.setInteractive()
                    
                    button.on('pointerdown', () => {
                        this.purchaseUpgrade(upgrade.key, cost)
                    })
                    
                    button.on('pointerover', () => {
                        button.setColor('#00FFFF')
                        button.setScale(1.05)
                    })
                    
                    button.on('pointerout', () => {
                        button.setColor('#00FF00')
                        button.setScale(1.0)
                    })
                }
                
                this.upgradeElements.push(button)
            } else {
                // Max level text
                const maxText = this.add.text(width / 2, y + (isMobile ? 48 : 54), '[ MAX LEVEL ]', {
                    fontSize: buttonSize,
                    color: '#FFD700',
                    fontFamily: 'Courier New, monospace',
                    fontStyle: 'bold'
                })
                maxText.setOrigin(0.5)
                this.upgradeElements.push(maxText)
            }
        })
    }
    
    purchaseUpgrade(upgradeKey, cost) {
        const currentLevel = this.saveData.upgrades[upgradeKey] || 0
        
        // Deduct points and upgrade
        this.saveData.upgrades[upgradeKey] = currentLevel + 1
        this.saveData.upgradePoints -= cost
        
        // Save progress
        ProgressConfig.saveProgress(this.saveData)
        
        // Update display
        this.pointsText.setText(`Credits: ${this.saveData.upgradePoints}`)
        
        // Recreate upgrade list to show new state
        this.clearUpgradeList()
        this.createUpgradeList(this.cameras.main.width < 600 || this.cameras.main.height < 600)
        
        console.log(`Purchased ${upgradeKey} level ${currentLevel + 1}`)
    }
    
    resetUpgrades() {
        // Calculate total points to refund
        let totalRefund = 0
        Object.keys(this.saveData.upgrades).forEach(upgradeKey => {
            const currentLevel = this.saveData.upgrades[upgradeKey]
            if (currentLevel > 0) {
                const upgrade = UpgradesConfig.upgrades[upgradeKey]
                if (upgrade) {
                    // Refund cost per level * number of levels
                    totalRefund += upgrade.costPerLevel * currentLevel
                }
            }
        })
        
        // Reset all upgrades to level 0
        Object.keys(this.saveData.upgrades).forEach(upgradeKey => {
            this.saveData.upgrades[upgradeKey] = 0
        })
        
        // Add refunded points back
        this.saveData.upgradePoints += totalRefund
        
        // Save progress
        ProgressConfig.saveProgress(this.saveData)
        
        // Update display
        this.pointsText.setText(`Credits: ${this.saveData.upgradePoints}`)
        
        // Recreate upgrade list to show new state
        this.clearUpgradeList()
        this.createUpgradeList(this.cameras.main.width < 600 || this.cameras.main.height < 600)
        
        console.log(`All upgrades reset. Refunded ${totalRefund} credits.`)
    }
    
    createStarfield() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Create starfield background
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width)
            const y = Phaser.Math.Between(0, height)
            const size = Phaser.Math.Between(1, 2)
            const alpha = Phaser.Math.FloatBetween(0.3, 0.7)
            
            this.add.circle(x, y, size, 0xFFFFFF, alpha)
        }
    }
}
