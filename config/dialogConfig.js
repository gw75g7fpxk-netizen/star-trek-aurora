// Dialog Configuration for Communications System
// Manages story dialog, character communications, and HUD presentation

const DialogConfig = {
    // Communication HUD styling
    hud: {
        // Position in top-left corner
        x: 20,
        y: 60,
        width: 500,
        height: 160,
        
        // Mobile adjustments
        mobileWidth: 320,
        mobileHeight: 140,
        
        // Portrait/avatar section (left side)
        portraitSize: 100,
        mobilePortraitSize: 70,
        portraitPadding: 10,
        
        // Text section (right side)
        textPadding: 15,
        lineHeight: 24,
        mobileLineHeight: 20,
        speakerTextGap: 8,          // Gap between speaker name and dialog text
        mobileSpeakerTextGap: 6,
        
        // Colors
        backgroundColor: 0x000000,
        backgroundAlpha: 0.85,
        borderColor: 0x00FFFF,
        borderWidth: 3,
        
        speakerColor: '#FFD700',    // Gold for speaker name
        textColor: '#FFFFFF',       // White for dialog text
        
        // Font sizes - improved readability
        speakerFontSize: '16px',
        textFontSize: '15px',
        mobileSpeakerFontSize: '13px',
        mobileTextFontSize: '12px',
        fontFamily: 'Arial, sans-serif',  // Clearer font than Courier New
        
        // Typewriter effect
        typewriterSpeed: 30,        // milliseconds per character
        skipAllowed: true,
        
        // Dialogue advancement
        advanceResetDelay: 100,     // milliseconds to wait before allowing next advance
        
        // Advance prompt
        advanceText: '[SPACE] Continue',
        mobileAdvanceText: '[TAP] Continue',
        advanceFontSize: '12px',
        advanceColor: '#00FF00'
    },
    
    // Camera and player ship settings for dramatic effect during communications
    camera: {
        normalZoom: 1.0,
        focusOnPlayer: true,        // Center on player ship during comms
        panDuration: 800            // milliseconds for pan transition
    },
    
    // Player ship scale settings during communications
    playerShip: {
        normalScale: 1.0,           // Default scale (for reference)
        communicationScale: 2.0,    // Scale player ship to 2x size during comms
        scaleDuration: 800          // milliseconds for scale transition
    },
    
    // Ship portraits for communications
    // Maps ship/character identifiers to their image keys
    portraits: {
        playerShip: 'player-ship',           // USS Aurora
        enemyFighter: 'enemy-fighter',       // Crystalis fighter
        enemyCruiser: 'enemy-cruiser',       // Crystalis cruiser
        enemyBattleship: 'enemy-battleship', // Crystalis battleship
        escapePod: 'escape-pod',             // Federation escape pod
        ussSentinel: 'uss-sentinel',         // USS Sentinel (reinforcement flagship)
        starfleetCommand: 'starfleet-command', // Starfleet Command
        romulanWarbird: 'romulan-warbird',   // Romulan Warbird Thar'Khul
        
        // For future use with custom portrait assets
        // captain: 'captain-portrait',
        // officer: 'officer-portrait',
        // alien: 'alien-portrait'
    },
    
    // Level-specific dialog sequences
    // Each level can have multiple dialog sequences (intro, mid-level, outro, etc.)
    levelDialogs: {
        1: {
            // Dialog at level start (intro)
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captains log, star date 78350.4',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The USS Aurora has been dispatched to assist the science vessel Horizon with some troubling readings near the Omicron Theta system.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'They are investigating the possibility that a new Crystalline Entity may have emerged.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, sensors are detecting an unknown fleet ahead. They match no known signatures in our database.',
                        audio: null
                    },
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Crystal-like vessels, Captain. And they\'re powering weapons! All frequencies jammed - we can\'t hail them.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Red alert! All hands to battle stations. This first contact just went hostile. Shields up, prepare to engage!',
                        audio: 'red-alert-sound'
                    }
                ]
            },
            
            // Dialog at level end (outro/victory)
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The vanguard ship is destroyed, Captain. Enemy forces are pulling back to regroup for another attack.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Good work. Get me Starfleet command. Helm, take us toward that asteroid field. We need cover while we figure out what we\'re dealing with.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Communications are still jammed, Captain. We\'re on our own for now.',
                        audio: null
                    }
                ]
            }
        },
        
        2: {
            // Dialog at level start (intro)
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Communications are heavily jammed. We need to navigate through this asteroid field carefully.',
                        audio: null  // Optional: path to audio file for voice-over
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Sensors detect multiple escape pods in the field, Captain. Survivors from a Federation science vessel.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'All hands to rescue stations. Helm, take us in. Tactical, keep shields at maximum. We have people to save.',
                        audio: null
                    }
                ]
            },
            
            // Dialog at level end (outro/victory)
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The crystal node is destroyed! Communications jamming has ceased.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Incredible... these Crystalis vessels are constructed from fragments of the Crystalline Entity itself.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Contact Starfleet immediately. They need to know what we\'re dealing with. Aurora out.',
                        audio: null
                    }
                ]
            }
        },
        
        // Level 3: Siege of New Horizon - Orbital defense
        3: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: "Captain, we're receiving a priority distress call from the Federation colony on New Horizon!",
                        audio: null
                    },
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, New Horizon is under heavy Crystalis attack. Provide orbital defense until reinforcements arrive.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Understood, Command. Helm, set course for New Horizon. All hands to battle stations. We hold the line!',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: "Detecting multiple evacuation pods launching from the surface. They're evacuating civilians, Captain.",
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The Crystalis flagship is destroyed! Remaining enemy forces are breaking off their attack.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Dray',
                        ship: 'USS Sentinel',
                        portrait: 'ussSentinel',
                        text: 'Well done, Aurora. Reinforcements have arrived and are securing the colony. New Horizon is safe.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'All civilian evacuation pods recovered successfully. New Horizon colony is secure. Aurora standing by.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, the Crystalis are becoming more coordinated. Their attack patterns are evolving.',
                        audio: null
                    }
                ]
            }
        },

        // Level 4: Fractured Nexus - Weapon platforms, minefields, and convoy rescue
        4: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The Sentinel and the reinforcements have gone to pursue the fleeing Crystalis. We\'re falling behind — hull repairs still aren\'t finished.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Structural integrity is restored to 87%, Captain. We should be fully operational within minutes.',
                        audio: null
                    },
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain! Priority distress call from a Federation resupply convoy — they\'re caught in a Crystalis trap. Weapon platforms and minefields everywhere.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Set course immediately. Aurora may be running alone, but we\'re not leaving that convoy out there. All hands to battle stations.',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The boss is down! All fragments neutralized. Their weapons network is offline.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The resupply convoy has been secured, Captain. All vessels are reporting minimal damage.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Signal the convoy to proceed on its way. Helm, set course to rejoin the Sentinel. We need to reconnect with the fleet.',
                        audio: null
                    }
                ]
            }
        },

        // Level 5: Guardian Protocol - Escort the crippled USS Sentinel through Crystalis swarms
        5: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, we are picking up a distress signal from the Sentinel. They have struck a minefield — analysis confirms Romulan origin.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Dray',
                        ship: 'USS Sentinel',
                        portrait: 'ussSentinel',
                        text: 'Aurora, this is Sentinel! We\'ve lost shields and weapons. Crystalis swarms are closing in fast — we can\'t hold them off!',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Sentinel, Aurora is on her way. We\'ll cover you until your systems are back online. Tactical — use our shields to protect them. Move!',
                        audio: null
                    },
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, these mines are locked onto warp signatures. We\'ll need to destroy them before they close on the Sentinel\'s warp core.',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The crystal swarm is breaking off! The multi-phase boss has been neutralized. Sentinel is secure!',
                        audio: null
                    },
                    {
                        speaker: 'Captain Dray',
                        ship: 'USS Sentinel',
                        portrait: 'ussSentinel',
                        text: 'Aurora... shields and weapons are fully restored. You\'ve bought us the time we needed. We owe you one.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, the minefield was designed to destroy both ships simultaneously. This has Romulan Intelligence written all over it.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Log everything and transmit it to Starfleet Intelligence. Sentinel — form up on our wing. Something larger is at play here.',
                        audio: null
                    }
                ]
            }
        },

        // Level 6: Resonant Swarm - Synchronized crystal formations with convoy rescue
        6: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, sensors are picking up Crystalis formations unlike anything we\'ve seen. They\'re moving in perfect synchronization.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Our previous engagements appear to have drawn them. The crystal resonance frequency is amplifying with each new ship that joins.',
                        audio: null
                    },
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, a Federation supply convoy is caught in the middle of those formations. Get those pods out before the swarm closes in.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Understood. Tactical, adapt firing patterns on the fly - these formations are going to learn our moves. Let\'s make it count.',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'All three carrier ships destroyed! The crystal resonance is collapsing - their synchronized formations are breaking apart!',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Remarkable. The carriers were acting as a relay network for the swarm\'s coordination signal. Without them the drones are scattered.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Supply convoy pods are secure. Helm, get us clear of the debris field. We need to report these new tactics to Starfleet.',
                        audio: null
                    }
                ]
            }
        },

        // Level 7: Romulan Shadows - Romulan warbird decloaks and pursues the Aurora
        7: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain! Energy spike — decloak signature! A Romulan warbird is dropping out of cloak directly behind us!',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Khara',
                        ship: 'Thar\'Khul',
                        portrait: 'romulanWarbird',
                        text: 'Aurora, you have interfered in Romulan affairs for the last time. The Crystalis were our leverage against the Federation. Your meddling ends here.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Their disruptors are charged and targeting us. They are moving to cut off our escape vectors.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Evasive maneuvers! All power to engines and aft shields. We can\'t fight that warbird head-on — we need to find a way to destroy its cloaking matrix.',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The cloaking matrix is offline! The warbird is fully exposed and taking heavy damage — they\'re breaking off!',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Khara',
                        ship: 'Thar\'Khul',
                        portrait: 'romulanWarbird',
                        text: 'You have made an enemy this day, Aurora. This is not over.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The Thar\'Khul is retreating at maximum warp. Crystalis fighters are scattering without their coordination signal. The immediate threat has passed.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Log this encounter and transmit it to Starfleet Command. The Romulans were exploiting the Crystalis conflict to weaken our position. That changes our tactical picture considerably.',
                        audio: null
                    }
                ]
            }
        },

        // Level 8: Federation Counterstrike - Assault the Crystalis staging ground with the USS Sentinel
        8: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, Starfleet reinforcements have arrived. The USS Sentinel has been fully repaired and rearmed. It is time to take the fight to the Crystalis.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Dray',
                        ship: 'USS Sentinel',
                        portrait: 'ussSentinel',
                        text: 'Aurora, this is Sentinel. Glad to be back in fighting shape. We\'re moving to assault the Crystalis staging ground. Form up on my wing.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, sensors detect a heavily fortified Crystalis position ahead. A battleship enforcer is protecting the staging ground with shield generator sub-systems.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Sentinel, Aurora is with you. Destroy the shield generators to bring that enforcer down. All hands to battle stations — for the Federation!',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The battleship enforcer is down! Their shield generators are offline. The Crystalis staging ground has been neutralized!',
                        audio: null
                    },
                    {
                        speaker: 'Captain Dray',
                        ship: 'USS Sentinel',
                        portrait: 'ussSentinel',
                        text: 'Excellent coordination, Aurora. Together we\'ve broken through their defenses. The Federation has regained the initiative.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Begin recovery operations on all rescue pods. Aurora and Sentinel standing by for next orders. We\'re not done yet.',
                        audio: null
                    }
                ]
            }
        },

        // Level 9: Harbinger's Wake - Proto-entity home planet with reality-warping waves
        9: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, we have traced the Crystalis fleet back to its point of origin — a planet unlike anything in our records. Sensors are detecting massive energy pulses emanating from the surface.',
                        audio: null
                    },
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'It\'s a proto-entity, Captain. The planet itself appears to be awakening. The pulses are destabilizing local space — our targeting sensors are going haywire.',
                        audio: null
                    },
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, there is a Federation outpost in that system. They have been attempting to evacuate but the Crystalis have them pinned down. Get those people out.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Understood. The reality distortions will make this difficult, but we\'re not leaving anyone behind. All hands, stay sharp — the rules of engagement have changed.',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The harbinger guardians are destroyed! The reality distortions are collapsing. All outpost escape pods have been recovered.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, the proto-entity below is still awakening. These guardians were only the beginning. Whatever is emerging from that planet — it dwarfs anything we\'ve faced.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Then we end this here. Set course for the Crystalis flagship. We stop them before that entity fully awakens. Aurora out.',
                        audio: null
                    }
                ]
            }
        },

        // Level 10: Crystalline Reckoning - Epic finale against the Crystalis flagship
        10: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, we\'ve found it. The Crystalis flagship is dead ahead — it\'s massive. I\'m reading shields, multiple turret emplacements, and an energy core unlike anything in our database.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The flagship is the nexus of the entire Crystalis fleet. Destroy the entity core at its heart and the fleet loses its command signal. This ends here.',
                        audio: null
                    },
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, Starfleet is counting on you. Destroy those turrets first to breach the shields, then target the core. The Federation stands with you.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Red alert! All hands to battle stations. We\'ve come too far to fail now. Destroy those turrets, breach the core, and end this war. For the Federation — fire at will!',
                        audio: 'red-alert-sound'
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The entity core is destroyed! The flagship is breaking apart! Enemy vessels throughout the sector are going dark — their command signal is gone!',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Incredible. Without the flagship\'s core to coordinate them, the Crystalis fleet is scattering. The threat is over, Captain.',
                        audio: null
                    },
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, this is Starfleet Command. You\'ve done it. The Crystalis offensive has collapsed. The Federation owes you a debt we can never repay. Outstanding work.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'All hands — stand down from battle stations. Begin recovery operations and set course for home. Captains log: the Crystalis threat has been neutralized. Aurora out.',
                        audio: null
                    }
                ]
            }
        }
    },
    
    // Get dialog sequence for a specific level and trigger
    getDialog(levelNumber, trigger = 'intro') {
        const dialogsForLevel = this.levelDialogs[levelNumber]
        if (dialogsForLevel && dialogsForLevel[trigger]) {
            return dialogsForLevel[trigger]
        }
        return null
    },
    
    // Check if a level has any dialogs defined
    hasDialog(levelNumber, trigger = 'intro') {
        return this.getDialog(levelNumber, trigger) !== null
    }
}
