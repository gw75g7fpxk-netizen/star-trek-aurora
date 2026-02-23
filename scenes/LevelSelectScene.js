// Level Select Scene - Shows map of all levels as space route
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' })
        this.selectedLevel = 1
        this.secretTapCount = 0 // Track taps on "MISSION SELECT" title
        this.secretTapTimer = null // Timer to reset tap count
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600
        
        console.log('LevelSelectScene: Loading level selection...')
        
        // Load progress data
        this.saveData = ProgressConfig.loadProgress()
        
        // Background starfield
        this.createStarfield()

        // LCARS header band
        const hH = isMobile ? 44 : 58
        const fH = isMobile ? 28 : 36
        this.lcarsHeaderH = hH
        this.lcarsFooterH = fH
        this.createLCARSHeader(width, height, hH, fH, isMobile)
        
        // Title placed inside the header band
        const titleSize = isMobile ? '22px' : '30px'
        const titleY = hH / 2
        const title = this.add.text(width / 2, titleY, 'MISSION SELECT', {
            fontSize: titleSize,
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        // Make the title interactive with a larger hit area for easier tapping
        const hitArea = new Phaser.Geom.Rectangle(-200, -20, 400, 40)
        title.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
        
        // Add secret tap counter to unlock testing level
        title.on('pointerdown', () => {
            this.secretTapCount++
            console.log(`Tap ${this.secretTapCount}/5 on MISSION SELECT`)
            
            // Reset timer on each tap
            if (this.secretTapTimer) {
                this.secretTapTimer.remove()
            }
            
            // Reset counter after 2 seconds of no taps
            this.secretTapTimer = this.time.delayedCall(2000, () => {
                this.secretTapCount = 0
            })
            
            // Unlock level 11 after 5 taps
            if (this.secretTapCount >= 5) {
                this.unlockSecretLevel()
            }
        })
        
        // Create the level map
        this.createLevelMap(isMobile)
        
        // Create info panel for selected level
        this.createInfoPanel(isMobile)
        
        // Back button
        this.createBackButton(isMobile)
        
        // Update info panel with initial selection
        this.updateInfoPanel()
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

    // Draws a slim LCARS-style header band and footer bar.
    createLCARSHeader(width, height, hH, fH, isMobile) {
        const gfx = this.add.graphics()

        // Orange header band (full width)
        gfx.fillStyle(0xFF9900, 1)
        gfx.fillRect(0, 0, width, hH)

        // Peach accent stripe at the left of the header
        gfx.fillStyle(0xFF9966, 1)
        gfx.fillRect(0, 0, isMobile ? 60 : 80, hH)

        // System label on the left accent
        this.add.text(isMobile ? 30 : 40, hH / 2, 'LCARS', {
            fontSize: isMobile ? '10px' : '12px',
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Thin horizontal accent lines below the header (into content area)
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
    
    createLevelMap(isMobile) {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Define positions for 10 levels in a winding space route
        // For mobile, use a more compact vertical layout
        let levelPositions
        
        if (isMobile) {
            // Mobile: Compact grid layout on the right side
            levelPositions = [
                { x: width * 0.55, y: height * 0.20 },  // Level 1
                { x: width * 0.75, y: height * 0.20 },  // Level 2
                { x: width * 0.55, y: height * 0.32 },  // Level 3
                { x: width * 0.75, y: height * 0.32 },  // Level 4
                { x: width * 0.55, y: height * 0.44 },  // Level 5
                { x: width * 0.75, y: height * 0.44 },  // Level 6
                { x: width * 0.55, y: height * 0.56 },  // Level 7
                { x: width * 0.75, y: height * 0.56 },  // Level 8
                { x: width * 0.55, y: height * 0.68 },  // Level 9
                { x: width * 0.75, y: height * 0.68 },  // Level 10
                { x: width * 0.65, y: height * 0.80 }   // Level 11 (secret)
            ]
        } else {
            // Desktop: Winding space route - shifted right to avoid info panel overlap
            levelPositions = [
                { x: width * 0.45, y: height * 0.25 },  // Level 1
                { x: width * 0.55, y: height * 0.3 },  // Level 2
                { x: width * 0.65, y: height * 0.25 },  // Level 3
                { x: width * 0.75, y: height * 0.3 },  // Level 4
                { x: width * 0.85, y: height * 0.4 },  // Level 5
                { x: width * 0.8, y: height * 0.55 },  // Level 6
                { x: width * 0.68, y: height * 0.6 },  // Level 7
                { x: width * 0.56, y: height * 0.55 },  // Level 8
                { x: width * 0.48, y: height * 0.65 },  // Level 9
                { x: width * 0.45, y: height * 0.75 },  // Level 10
                { x: width * 0.65, y: height * 0.85 }   // Level 11 (secret)
            ]
        }
        
        this.levelNodes = []
        
        // Draw connecting lines between levels (skip for mobile to reduce clutter)
        if (!isMobile) {
            const graphics = this.add.graphics()
            graphics.lineStyle(2, 0x00FFFF, 0.3)
            
            for (let i = 0; i < levelPositions.length - 1; i++) {
                const start = levelPositions[i]
                const end = levelPositions[i + 1]
                graphics.lineBetween(start.x, start.y, end.x, end.y)
            }
        }
        
        // Create level nodes
        const nodeSize = isMobile ? 15 : 20
        const fontSize = isMobile ? '12px' : '16px'
        const starOffset = isMobile ? -25 : -35
        const lockOffset = isMobile ? -25 : -35
        
        for (let i = 1; i <= 11; i++) {
            const pos = levelPositions[i - 1]
            const isUnlocked = ProgressConfig.isLevelUnlocked(i, this.saveData)
            const stats = ProgressConfig.getLevelStats(i, this.saveData)
            const isCompleted = stats !== null
            
            // Node circle
            const nodeColor = isCompleted ? 0x00FF00 : (isUnlocked ? 0xFFFF00 : 0x666666)
            const nodeAlpha = isUnlocked ? 1.0 : 0.5
            
            const node = this.add.circle(pos.x, pos.y, nodeSize, nodeColor, nodeAlpha)
            node.setStrokeStyle(isMobile ? 2 : 3, 0x00FFFF, nodeAlpha)
            
            if (isUnlocked) {
                node.setInteractive({ useHandCursor: true })
                
                node.on('pointerdown', () => {
                    this.selectLevel(i)
                })
                
                node.on('pointerover', () => {
                    node.setScale(1.2)
                    node.setAlpha(1.0)
                })
                
                node.on('pointerout', () => {
                    node.setScale(1.0)
                    node.setAlpha(nodeAlpha)
                })
            }
            
            // Level number
            const levelText = this.add.text(pos.x, pos.y, i.toString(), {
                fontSize: fontSize,
                color: '#000000',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            })
            levelText.setOrigin(0.5)
            
            // Completion star for completed levels
            if (isCompleted) {
                const star = this.add.text(pos.x, pos.y + starOffset, '★', {
                    fontSize: isMobile ? '16px' : '20px',
                    color: '#FFD700'
                })
                star.setOrigin(0.5)
            }
            
            // Lock icon for locked levels
            if (!isUnlocked) {
                const lock = this.add.text(pos.x, pos.y + lockOffset, '🔒', {
                    fontSize: isMobile ? '12px' : '16px'
                })
                lock.setOrigin(0.5)
            }
            
            this.levelNodes.push({ node, levelNumber: i, isUnlocked })
        }
    }
    
    createInfoPanel(isMobile) {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Info panel background - adjust for mobile
        let panelX, panelY, panelWidth, panelHeight
        
        if (isMobile) {
            // Mobile: Smaller panel on left side with reduced height to avoid hiding back button
            panelX = width * 0.03
            panelY = height * 0.14
            panelWidth = width * 0.44
            panelHeight = height * 0.58
        } else {
            // Desktop: Original size
            panelX = width * 0.05
            panelY = height * 0.15
            panelWidth = width * 0.35
            panelHeight = height * 0.7
        }
        
        // LCARS-styled panel: dark fill with orange/peach top accent bar
        const panel = this.add.graphics()
        panel.fillStyle(0x050510, 0.92)
        panel.fillRect(panelX, panelY, panelWidth, panelHeight)

        // Left accent bar (peach)
        panel.fillStyle(0xFF9966, 1)
        panel.fillRect(panelX, panelY, isMobile ? 6 : 8, panelHeight)

        // Top accent bar (orange)
        panel.fillStyle(0xFF9900, 1)
        panel.fillRect(panelX, panelY, panelWidth, isMobile ? 4 : 5)

        // Bottom accent bar (orange)
        panel.fillStyle(0xFF9900, 1)
        panel.fillRect(panelX, panelY + panelHeight - (isMobile ? 4 : 5), panelWidth, isMobile ? 4 : 5)

        // Thin cyan right border
        panel.lineStyle(1, 0x00FFFF, 0.5)
        panel.strokeRect(panelX, panelY, panelWidth, panelHeight)
        
        // Info panel text (will be updated dynamically)
        const leftPad = isMobile ? 14 : 18
        const topPad = isMobile ? 12 : 14
        const nameSize = isMobile ? '18px' : '24px'
        const descSize = isMobile ? '12px' : '16px'
        const statsSize = isMobile ? '11px' : '14px'
        
        this.infoPanelTexts = {
            levelName: this.add.text(panelX + leftPad, panelY + topPad, '', {
                fontSize: nameSize,
                color: '#FF9900',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold',
                wordWrap: { width: panelWidth - leftPad * 2 }
            }),
            description: this.add.text(panelX + leftPad, panelY + topPad + (isMobile ? 50 : 60), '', {
                fontSize: descSize,
                color: '#CCCCCC',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - leftPad * 2 }
            }),
            stats: this.add.text(panelX + leftPad, panelY + topPad + (isMobile ? 100 : 120), '', {
                fontSize: statsSize,
                color: '#88CCFF',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - leftPad * 2 }
            }),
            locked: this.add.text(panelX + leftPad, panelY + topPad + (isMobile ? 100 : 120), '', {
                fontSize: descSize,
                color: '#FF6655',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - leftPad * 2 }
            })
        }
        
        // Launch button styled as a LCARS rectangular button
        const btnW = isMobile ? panelWidth - leftPad * 2 : panelWidth - 40
        const btnH = isMobile ? 36 : 44
        const btnX = panelX + panelWidth / 2
        const btnY = panelY + panelHeight - (isMobile ? 46 : 58)
        const btnLabel = isMobile ? '[ LAUNCH ]' : '[ LAUNCH MISSION ]'

        const btnBg = this.add.rectangle(btnX, btnY, btnW, btnH, 0x003322, 1)
        btnBg.setStrokeStyle(2, 0x00AA55, 1)
        btnBg.setInteractive({ useHandCursor: true })

        this.playButton = this.add.text(btnX, btnY, btnLabel, {
            fontSize: isMobile ? '16px' : '22px',
            color: '#00FF88',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Store the background so setLaunchButtonVisible() can control both together
        this.playButtonBg = btnBg
        
        btnBg.on('pointerdown', () => {
            this.launchLevel()
        })
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x005533)
            this.playButton.setColor('#00FFCC')
        })
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x003322)
            this.playButton.setColor('#00FF88')
        })
    }

    // Controls visibility of both the launch button background and its label together.
    setLaunchButtonVisible(visible) {
        this.playButtonBg.setVisible(visible)
        this.playButton.setVisible(visible)
    }
    
    createBackButton(isMobile) {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const fH = this.lcarsFooterH || 36
        
        // Back button sits centred in the orange footer bar
        const backSize = isMobile ? '14px' : '16px'
        const backX = width / 2
        const backY = height - fH / 2
        
        const backButton = this.add.text(backX, backY, '[ BACK TO MENU ]', {
            fontSize: backSize,
            color: '#000000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        backButton.setOrigin(0.5)
        backButton.setInteractive()
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene')
        })
        
        backButton.on('pointerover', () => {
            backButton.setColor('#333300')
        })
        
        backButton.on('pointerout', () => {
            backButton.setColor('#000000')
        })
    }
    
    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber
        this.updateInfoPanel()
        console.log(`Selected level ${levelNumber}`)
    }
    
    updateInfoPanel() {
        const levelInfo = ProgressConfig.levelInfo[this.selectedLevel]
        const isUnlocked = ProgressConfig.isLevelUnlocked(this.selectedLevel, this.saveData)
        const stats = ProgressConfig.getLevelStats(this.selectedLevel, this.saveData)
        
        // Update level name
        if (isUnlocked) {
            this.infoPanelTexts.levelName.setText(`LEVEL ${this.selectedLevel}: ${levelInfo.name}`)
            this.infoPanelTexts.description.setText(levelInfo.description)
        } else {
            this.infoPanelTexts.levelName.setText(`LEVEL ${this.selectedLevel}: ???`)
            this.infoPanelTexts.description.setText('Complete previous missions to unlock')
        }
        
        // Update stats or locked message
        if (stats) {
            // Show completion stats
            this.infoPanelTexts.stats.setText(
                `STATUS: COMPLETED ★\n\n` +
                `High Score: ${stats.highScore}\n` +
                `Enemies Defeated: ${stats.enemiesKilled}\n` +
                `Pods Rescued: ${stats.podsRescued}\n` +
                `Waves Cleared: ${stats.wave}`
            )
            this.infoPanelTexts.stats.setVisible(true)
            this.infoPanelTexts.locked.setVisible(false)
            this.setLaunchButtonVisible(true)
        } else if (isUnlocked) {
            // Show unlocked but not completed
            this.infoPanelTexts.stats.setText('STATUS: READY\n\nMission not yet attempted')
            this.infoPanelTexts.stats.setVisible(true)
            this.infoPanelTexts.locked.setVisible(false)
            this.setLaunchButtonVisible(true)
        } else {
            // Show locked
            this.infoPanelTexts.stats.setVisible(false)
            this.infoPanelTexts.locked.setText('🔒 LOCKED\n\nComplete previous missions to unlock this level')
            this.infoPanelTexts.locked.setVisible(true)
            this.setLaunchButtonVisible(false)
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
        
        // Unlock level 11 in save data
        ProgressConfig.unlockLevel(11, this.saveData)
        
        // Reset tap counter
        this.secretTapCount = 0
        if (this.secretTapTimer) {
            this.secretTapTimer.remove()
        }
        
        // Recreate the level map to show level 11
        this.scene.restart()
    }
}
