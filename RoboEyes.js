/**
 * FluxGarage RoboEyes for Web - JavaScript Implementation V 1.1.1
 * Draws smoothly animated robot eyes on web canvas, based on the original
 * FluxGarage RoboEyes library for OLED displays.
 *   
 * Adapted from original C++ library by Dennis Hoelscher
 * Web adaptation for Gismo Pet Robot Interface
 * 
 * Original: www.fluxgarage.com | www.youtube.com/@FluxGarage
 * Web Version: Gismo Pet Robot Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

class RoboEyes {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        // Display colors
        this.BGCOLOR = '#1a1a1a'; // background and overlays
        this.MAINCOLOR = '#00aaff'; // drawings (blue LED color)
        
        // Mood types
        this.MOOD = {
            DEFAULT: 0,
            TIRED: 1,
            ANGRY: 2,
            HAPPY: 3
        };
        
        // Positions
        this.POSITION = {
            DEFAULT: 0,
            N: 1, NE: 2, E: 3, SE: 4,
            S: 5, SW: 6, W: 7, NW: 8
        };
        
        // General setup
        this.screenWidth = 320;
        this.screenHeight = 320;
        this.frameInterval = 20; // 50 FPS
        this.fpsTimer = 0;
        
        // Mood control
        this.tired = false;
        this.angry = false;
        this.happy = false;
        this.curious = false;
        this.cyclops = false;
        this.eyeL_open = true; // Start with eyes open
        this.eyeR_open = true; // Start with eyes open
        
        // Eye geometry - LEFT
        this.eyeLwidthDefault = 150; // Increased from 120 to 150
        this.eyeLheightDefault = 150; // Increased from 120 to 150
        this.eyeLwidthCurrent = this.eyeLwidthDefault;
        this.eyeLheightCurrent = this.eyeLheightDefault; // Changed from 1 to full height
        this.eyeLwidthNext = this.eyeLwidthDefault;
        this.eyeLheightNext = this.eyeLheightDefault;
        this.eyeLheightOffset = 0;
        this.eyeLborderRadiusDefault = 75; // Increased from 60 to 75
        this.eyeLborderRadiusCurrent = this.eyeLborderRadiusDefault;
        this.eyeLborderRadiusNext = this.eyeLborderRadiusDefault;
        
        // Eye geometry - RIGHT
        this.eyeRwidthDefault = this.eyeLwidthDefault;
        this.eyeRheightDefault = this.eyeLheightDefault;
        this.eyeRwidthCurrent = this.eyeRwidthDefault;
        this.eyeRheightCurrent = this.eyeRheightDefault; // Changed from 1 to full height
        this.eyeRwidthNext = this.eyeRwidthDefault;
        this.eyeRheightNext = this.eyeRheightDefault;
        this.eyeRheightOffset = 0;
        this.eyeRborderRadiusDefault = 75; // Increased from 60 to 75
        this.eyeRborderRadiusCurrent = this.eyeRborderRadiusDefault;
        this.eyeRborderRadiusNext = this.eyeRborderRadiusDefault;
        
        // Space between eyes
        this.spaceBetweenDefault = 80; // Increased from 60 to 80
        this.spaceBetweenCurrent = this.spaceBetweenDefault;
        this.spaceBetweenNext = this.spaceBetweenDefault;
        
        // Eye positions
        this.eyeLxDefault = ((this.screenWidth) - (this.eyeLwidthDefault + this.spaceBetweenDefault + this.eyeRwidthDefault)) / 2;
        this.eyeLyDefault = ((this.screenHeight - this.eyeLheightDefault) / 2);
        this.eyeLx = this.eyeLxDefault;
        this.eyeLy = this.eyeLyDefault;
        this.eyeLxNext = this.eyeLx;
        this.eyeLyNext = this.eyeLy;
        
        this.eyeRxDefault = this.eyeLx + this.eyeLwidthDefault + this.spaceBetweenDefault; // Use Default instead of Current
        this.eyeRyDefault = this.eyeLy;
        this.eyeRx = this.eyeRxDefault;
        this.eyeRy = this.eyeRyDefault;
        this.eyeRxNext = this.eyeRx;
        this.eyeRyNext = this.eyeRy;
        
        // Eyelids
        this.eyelidsHeightMax = this.eyeLheightDefault / 2;
        this.eyelidsTiredHeight = 0;
        this.eyelidsTiredHeightNext = 0;
        this.eyelidsAngryHeight = 0;
        this.eyelidsAngryHeightNext = 0;
        this.eyelidsHappyBottomOffsetMax = (this.eyeLheightDefault / 2) + 6;
        this.eyelidsHappyBottomOffset = 0;
        this.eyelidsHappyBottomOffsetNext = 0;
        
        // Animation states
        this.hFlicker = false;
        this.hFlickerAlternate = false;
        this.hFlickerAmplitude = 4;
        this.vFlicker = false;
        this.vFlickerAlternate = false;
        this.vFlickerAmplitude = 20;
        
        // Auto blink
        this.autoblinker = false;
        this.blinkInterval = 1;
        this.blinkIntervalVariation = 4;
        this.blinktimer = 0;
        
        // Idle mode
        this.idle = false;
        this.idleInterval = 1;
        this.idleIntervalVariation = 3;
        this.idleAnimationTimer = 0;
        
        // Confused animation
        this.confused = false;
        this.confusedAnimationTimer = 0;
        this.confusedAnimationDuration = 500;
        this.confusedToggle = true;
        
        // Laugh animation
        this.laugh = false;
        this.laughAnimationTimer = 0;
        this.laughAnimationDuration = 500;
        this.laughToggle = true;
        
        // Sweat animation
        this.sweat = false;
        this.sweatBorderRadius = 6;
        this.tearColor = null; // Custom tear color (null = use MAINCOLOR)
        this.wateryEyes = false; // Watery eyes effect for crying
        
        // Sweat drops
        this.sweat1 = { xInitial: 4, x: 0, y: 4, yMax: 0, height: 4, width: 2 };
        this.sweat2 = { xInitial: 4, x: 0, y: 4, yMax: 0, height: 4, width: 2 };
        this.sweat3 = { xInitial: 4, x: 0, y: 4, yMax: 0, height: 4, width: 2 };
    }
    
    // Initialize the robot eyes
    begin(width, height, frameRate) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.setFramerate(frameRate);
        
        // Recalculate eye positions based on new screen size
        this.eyeLxDefault = ((this.screenWidth) - (this.eyeLwidthDefault + this.spaceBetweenDefault + this.eyeRwidthDefault)) / 2;
        this.eyeLyDefault = ((this.screenHeight - this.eyeLheightDefault) / 2);
        this.eyeLx = this.eyeLxDefault;
        this.eyeLy = this.eyeLyDefault;
        this.eyeLxNext = this.eyeLx;
        this.eyeLyNext = this.eyeLy;
        
        this.eyeRxDefault = this.eyeLx + this.eyeLwidthDefault + this.spaceBetweenDefault;
        this.eyeRyDefault = this.eyeLy;
        this.eyeRx = this.eyeRxDefault;
        this.eyeRy = this.eyeRyDefault;
        this.eyeRxNext = this.eyeRx;
        this.eyeRyNext = this.eyeRy;
        
        // Keep eyes fully open - don't reset to 1
        this.eyeLheightCurrent = this.eyeLheightDefault;
        this.eyeRheightCurrent = this.eyeRheightDefault;
        this.clearDisplay();
    }
    
    // Main update loop
    update() {
        const now = Date.now();
        if (now - this.fpsTimer >= this.frameInterval) {
            this.drawEyes();
            this.fpsTimer = now;
        }
    }
    
    // Set framerate
    setFramerate(fps) {
        this.frameInterval = 1000 / fps;
    }
    
    // Set colors
    setDisplayColors(background, main) {
        this.BGCOLOR = background;
        this.MAINCOLOR = main;
    }
    
    // Set eye dimensions
    setWidth(leftEye, rightEye) {
        this.eyeLwidthNext = leftEye;
        this.eyeRwidthNext = rightEye;
        this.eyeLwidthDefault = leftEye;
        this.eyeRwidthDefault = rightEye;
    }
    
    setHeight(leftEye, rightEye) {
        this.eyeLheightNext = leftEye;
        this.eyeRheightNext = rightEye;
        this.eyeLheightDefault = leftEye;
        this.eyeRheightDefault = rightEye;
    }
    
    setBorderRadius(leftEye, rightEye) {
        this.eyeLborderRadiusNext = leftEye;
        this.eyeRborderRadiusNext = rightEye;
        this.eyeLborderRadiusDefault = leftEye;
        this.eyeRborderRadiusDefault = rightEye;
    }
    
    setSpaceBetween(space) {
        this.spaceBetweenNext = space;
        this.spaceBetweenDefault = space;
    }
    
    // Set mood
    setMood(mood) {
        switch (mood) {
            case this.MOOD.TIRED:
                this.tired = true;
                this.angry = false;
                this.happy = false;
                break;
            case this.MOOD.ANGRY:
                this.tired = false;
                this.angry = true;
                this.happy = false;
                break;
            case this.MOOD.HAPPY:
                this.tired = false;
                this.angry = false;
                this.happy = true;
                break;
            default:
                this.tired = false;
                this.angry = false;
                this.happy = false;
                break;
        }
    }
    
    // Set position
    setPosition(position) {
        switch (position) {
            case this.POSITION.N:
                this.eyeLxNext = this.getScreenConstraint_X() / 2;
                this.eyeLyNext = 0;
                break;
            case this.POSITION.NE:
                this.eyeLxNext = this.getScreenConstraint_X();
                this.eyeLyNext = 0;
                break;
            case this.POSITION.E:
                this.eyeLxNext = this.getScreenConstraint_X();
                this.eyeLyNext = this.getScreenConstraint_Y() / 2;
                break;
            case this.POSITION.SE:
                this.eyeLxNext = this.getScreenConstraint_X();
                this.eyeLyNext = this.getScreenConstraint_Y();
                break;
            case this.POSITION.S:
                this.eyeLxNext = this.getScreenConstraint_X() / 2;
                this.eyeLyNext = this.getScreenConstraint_Y();
                break;
            case this.POSITION.SW:
                this.eyeLxNext = 0;
                this.eyeLyNext = this.getScreenConstraint_Y();
                break;
            case this.POSITION.W:
                this.eyeLxNext = 0;
                this.eyeLyNext = this.getScreenConstraint_Y() / 2;
                break;
            case this.POSITION.NW:
                this.eyeLxNext = 0;
                this.eyeLyNext = 0;
                break;
            default:
                this.eyeLxNext = this.getScreenConstraint_X() / 2;
                this.eyeLyNext = this.getScreenConstraint_Y() / 2;
                break;
        }
    }
    
    // Auto blinker
    setAutoblinker(active, interval = 1, variation = 4) {
        this.autoblinker = active;
        this.blinkInterval = interval;
        this.blinkIntervalVariation = variation;
    }
    
    // Idle mode
    setIdleMode(active, interval = 1, variation = 3) {
        this.idle = active;
        this.idleInterval = interval;
        this.idleIntervalVariation = variation;
    }
    
    // Special modes
    setCuriosity(curious) {
        this.curious = curious;
    }
    
    setCyclops(cyclops) {
        this.cyclops = cyclops;
    }
    
    // Flicker effects
    setHFlicker(flicker, amplitude = 4) {
        this.hFlicker = flicker;
        this.hFlickerAmplitude = amplitude;
    }
    
    setVFlicker(flicker, amplitude = 20) {
        this.vFlicker = flicker;
        this.vFlickerAmplitude = amplitude;
    }
    
    setSweat(sweat) {
        this.sweat = sweat;
    }
    
    // Set custom tear color for crying (if null, uses MAINCOLOR)
    setTearColor(color) {
        this.tearColor = color;
    }
    
    // Set watery eyes effect
    setWateryEyes(watery) {
        this.wateryEyes = watery;
    }
    
    // Eye movement animations for sound reactions
    anim_lookLeft() {
        this.eyeLx = this.eyeLxDefault - 20;
        this.eyeRx = this.eyeRxDefault - 20;
        setTimeout(() => {
            this.eyeLx = this.eyeLxDefault;
            this.eyeRx = this.eyeRxDefault;
        }, 300);
    }
    
    anim_lookRight() {
        this.eyeLx = this.eyeLxDefault + 20;
        this.eyeRx = this.eyeRxDefault + 20;
        setTimeout(() => {
            this.eyeLx = this.eyeLxDefault;
            this.eyeRx = this.eyeRxDefault;
        }, 300);
    }
    
    anim_lookAround() {
        // Random left or right look
        if (Math.random() < 0.5) {
            this.anim_lookLeft();
        } else {
            this.anim_lookRight();
        }
    }
    
    anim_soundProcessing() {
        // Quick left-right-center movement for sound processing
        this.eyeLx = this.eyeLxDefault - 15;
        this.eyeRx = this.eyeRxDefault - 15;
        
        setTimeout(() => {
            this.eyeLx = this.eyeLxDefault + 15;
            this.eyeRx = this.eyeRxDefault + 15;
        }, 150);
        
        setTimeout(() => {
            this.eyeLx = this.eyeLxDefault;
            this.eyeRx = this.eyeRxDefault;
        }, 300);
    }
    
    anim_listeningPulse() {
        // Gentle size pulse while actively listening
        const originalLWidth = this.eyeLwidthCurrent;
        const originalRWidth = this.eyeRwidthCurrent;
        const originalLHeight = this.eyeLheightCurrent;
        const originalRHeight = this.eyeRheightCurrent;
        
        // Slightly enlarge eyes
        this.eyeLwidthCurrent = originalLWidth * 1.1;
        this.eyeRwidthCurrent = originalRWidth * 1.1;
        this.eyeLheightCurrent = originalLHeight * 1.1;
        this.eyeRheightCurrent = originalRHeight * 1.1;
        
        setTimeout(() => {
            // Return to normal size
            this.eyeLwidthCurrent = originalLWidth;
            this.eyeRwidthCurrent = originalRWidth;
            this.eyeLheightCurrent = originalLHeight;
            this.eyeRheightCurrent = originalRHeight;
        }, 200);
    }
    
    anim_quickGlance() {
        // Quick glance in a random direction for sound attention
        const directions = ['left', 'right', 'up', 'down'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        let offsetX = 0, offsetY = 0;
        switch(direction) {
            case 'left':
                offsetX = -25;
                break;
            case 'right':
                offsetX = 25;
                break;
            case 'up':
                offsetY = -15;
                break;
            case 'down':
                offsetY = 15;
                break;
        }
        
        this.eyeLx = this.eyeLxDefault + offsetX;
        this.eyeRx = this.eyeRxDefault + offsetX;
        this.eyeLy = this.eyeLyDefault + offsetY;
        this.eyeRy = this.eyeRyDefault + offsetY;
        
        setTimeout(() => {
            this.eyeLx = this.eyeLxDefault;
            this.eyeRx = this.eyeRxDefault;
            this.eyeLy = this.eyeLyDefault;
            this.eyeRy = this.eyeRyDefault;
        }, 400);
    }
    
    anim_commandListeningIntense() {
        // Intense listening animation - multiple movements
        const movements = [
            {delay: 0, x: -20, y: 0},
            {delay: 200, x: 20, y: 0},
            {delay: 400, x: 0, y: -10},
            {delay: 600, x: 0, y: 0}
        ];
        
        movements.forEach(movement => {
            setTimeout(() => {
                this.eyeLx = this.eyeLxDefault + movement.x;
                this.eyeRx = this.eyeRxDefault + movement.x;
                this.eyeLy = this.eyeLyDefault + movement.y;
                this.eyeRy = this.eyeRyDefault + movement.y;
            }, movement.delay);
        });
    }
    
    anim_scanningEffect() {
        // Scanning effect - smooth sweep from left to right
        let currentOffset = -30;
        const targetOffset = 30;
        const step = 4;
        
        const sweep = () => {
            this.eyeLx = this.eyeLxDefault + currentOffset;
            this.eyeRx = this.eyeRxDefault + currentOffset;
            
            currentOffset += step;
            if (currentOffset <= targetOffset) {
                setTimeout(sweep, 30);
            } else {
                // Return to center
                setTimeout(() => {
                    this.eyeLx = this.eyeLxDefault;
                    this.eyeRx = this.eyeRxDefault;
                }, 100);
            }
        };
        
        sweep();
    }
    
    anim_activeListeningPulse() {
        // More dramatic pulse effect for active listening
        const originalLWidth = this.eyeLwidthCurrent;
        const originalRWidth = this.eyeRwidthCurrent;
        const originalLHeight = this.eyeLheightCurrent;
        const originalRHeight = this.eyeRheightCurrent;
        
        // Pulse sequence: expand -> contract -> expand -> normal
        const pulseSteps = [
            {scale: 1.2, delay: 0},
            {scale: 0.9, delay: 150},
            {scale: 1.15, delay: 300},
            {scale: 1.0, delay: 450}
        ];
        
        pulseSteps.forEach(step => {
            setTimeout(() => {
                this.eyeLwidthCurrent = originalLWidth * step.scale;
                this.eyeRwidthCurrent = originalRWidth * step.scale;
                this.eyeLheightCurrent = originalLHeight * step.scale;
                this.eyeRheightCurrent = originalRHeight * step.scale;
            }, step.delay);
        });
    }
    
    // Screen constraints
    getScreenConstraint_X() {
        return this.screenWidth - this.eyeLwidthCurrent - this.spaceBetweenCurrent - this.eyeRwidthCurrent;
    }
    
    getScreenConstraint_Y() {
        return this.screenHeight - this.eyeLheightDefault;
    }
    
    // Blinking controls
    close() {
        this.eyeLheightNext = 1;
        this.eyeRheightNext = 1;
        this.eyeL_open = false;
        this.eyeR_open = false;
    }
    
    open() {
        this.eyeLheightNext = this.eyeLheightDefault;
        this.eyeRheightNext = this.eyeRheightDefault;
        this.eyeL_open = true;
        this.eyeR_open = true;
    }
    
    blink() {
        this.close();
        this.open();
    }
    
    // Individual eye control
    closeEye(left, right) {
        if (left) {
            this.eyeLheightNext = 1;
            this.eyeL_open = false;
        }
        if (right) {
            this.eyeRheightNext = 1;
            this.eyeR_open = false;
        }
    }
    
    openEye(left, right) {
        if (left) {
            this.eyeLheightNext = this.eyeLheightDefault;
            this.eyeL_open = true;
        }
        if (right) {
            this.eyeRheightNext = this.eyeRheightDefault;
            this.eyeR_open = true;
        }
    }
    
    blinkEye(left, right) {
        this.closeEye(left, right);
        this.openEye(left, right);
    }
    
    // Macro animations
    anim_confused() {
        this.confused = true;
    }
    
    anim_laugh() {
        this.laugh = true;
    }
    
    // Canvas drawing helpers
    clearDisplay() {
        this.ctx.fillStyle = this.BGCOLOR;
        this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    }
    
    fillRoundRect(x, y, width, height, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, radius);
        this.ctx.fill();
    }
    
    fillTriangle(x1, y1, x2, y2, x3, y3, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // Main drawing method
    drawEyes() {
        // Pre-calculations for curious gaze
        if (this.curious) {
            if (this.eyeLxNext <= 20) {
                this.eyeLheightOffset = 16;
            } else if (this.eyeLxNext >= (this.getScreenConstraint_X() - 20) && this.cyclops) {
                this.eyeLheightOffset = 16;
            } else {
                this.eyeLheightOffset = 0;
            }
            
            if (this.eyeRxNext >= this.screenWidth - this.eyeRwidthCurrent - 20) {
                this.eyeRheightOffset = 16;
            } else {
                this.eyeRheightOffset = 0;
            }
        } else {
            this.eyeLheightOffset = 0;
            this.eyeRheightOffset = 0;
        }
        
        // Eye height calculations
        this.eyeLheightCurrent = Math.round((this.eyeLheightCurrent + this.eyeLheightNext + this.eyeLheightOffset) / 2);
        this.eyeLy += Math.round((this.eyeLheightDefault - this.eyeLheightCurrent) / 2);
        this.eyeLy -= Math.round(this.eyeLheightOffset / 2);
        
        this.eyeRheightCurrent = Math.round((this.eyeRheightCurrent + this.eyeRheightNext + this.eyeRheightOffset) / 2);
        this.eyeRy += Math.round((this.eyeRheightDefault - this.eyeRheightCurrent) / 2);
        this.eyeRy -= Math.round(this.eyeRheightOffset / 2);
        
        // Open eyes after closing
        if (this.eyeL_open) {
            if (this.eyeLheightCurrent <= 1 + this.eyeLheightOffset) {
                this.eyeLheightNext = this.eyeLheightDefault;
            }
        }
        if (this.eyeR_open) {
            if (this.eyeRheightCurrent <= 1 + this.eyeRheightOffset) {
                this.eyeRheightNext = this.eyeRheightDefault;
            }
        }
        
        // Width calculations
        this.eyeLwidthCurrent = Math.round((this.eyeLwidthCurrent + this.eyeLwidthNext) / 2);
        this.eyeRwidthCurrent = Math.round((this.eyeRwidthCurrent + this.eyeRwidthNext) / 2);
        
        // Space between eyes
        this.spaceBetweenCurrent = Math.round((this.spaceBetweenCurrent + this.spaceBetweenNext) / 2);
        
        // Position calculations
        this.eyeLx = Math.round((this.eyeLx + this.eyeLxNext) / 2);
        this.eyeLy = Math.round((this.eyeLy + this.eyeLyNext) / 2);
        
        this.eyeRxNext = this.eyeLxNext + this.eyeLwidthCurrent + this.spaceBetweenCurrent;
        this.eyeRyNext = this.eyeLyNext;
        this.eyeRx = Math.round((this.eyeRx + this.eyeRxNext) / 2);
        this.eyeRy = Math.round((this.eyeRy + this.eyeRyNext) / 2);
        
        // Border radius
        this.eyeLborderRadiusCurrent = Math.round((this.eyeLborderRadiusCurrent + this.eyeLborderRadiusNext) / 2);
        this.eyeRborderRadiusCurrent = Math.round((this.eyeRborderRadiusCurrent + this.eyeRborderRadiusNext) / 2);
        
        // Apply macro animations
        this.applyMacroAnimations();
        
        // Apply flicker effects
        this.applyFlickerEffects();
        
        // Handle cyclops mode
        if (this.cyclops) {
            this.eyeRwidthCurrent = 0;
            this.eyeRheightCurrent = 0;
            this.spaceBetweenCurrent = 0;
        }
        
        // Start drawing
        this.clearDisplay();
        
        // Draw basic eye shapes
        this.fillRoundRect(this.eyeLx, this.eyeLy, this.eyeLwidthCurrent, this.eyeLheightCurrent, this.eyeLborderRadiusCurrent, this.MAINCOLOR);
        
        if (!this.cyclops) {
            this.fillRoundRect(this.eyeRx, this.eyeRy, this.eyeRwidthCurrent, this.eyeRheightCurrent, this.eyeRborderRadiusCurrent, this.MAINCOLOR);
        }
        
        // Draw mood eyelids
        this.drawMoodEyelids();
        
        // Draw watery eyes effect
        if (this.wateryEyes) {
            this.drawWateryEyes();
        }
        
        // Draw sweat drops
        if (this.sweat) {
            this.drawSweatDrops();
        }
    }
    
    applyMacroAnimations() {
        const now = Date.now();
        
        // Auto blinker
        if (this.autoblinker && now >= this.blinktimer) {
            this.blink();
            this.blinktimer = now + (this.blinkInterval * 1000) + (Math.random() * this.blinkIntervalVariation * 1000);
        }
        
        // Laugh animation
        if (this.laugh) {
            if (this.laughToggle) {
                this.setVFlicker(true, 10);
                this.laughAnimationTimer = now;
                this.laughToggle = false;
            } else if (now >= this.laughAnimationTimer + this.laughAnimationDuration) {
                this.setVFlicker(false, 0);
                this.laughToggle = true;
                this.laugh = false;
            }
        }
        
        // Confused animation
        if (this.confused) {
            if (this.confusedToggle) {
                this.setHFlicker(true, 40);
                this.confusedAnimationTimer = now;
                this.confusedToggle = false;
            } else if (now >= this.confusedAnimationTimer + this.confusedAnimationDuration) {
                this.setHFlicker(false, 0);
                this.confusedToggle = true;
                this.confused = false;
            }
        }
        
        // Idle mode
        if (this.idle && now >= this.idleAnimationTimer) {
            this.eyeLxNext = Math.random() * this.getScreenConstraint_X();
            this.eyeLyNext = Math.random() * this.getScreenConstraint_Y();
            this.idleAnimationTimer = now + (this.idleInterval * 1000) + (Math.random() * this.idleIntervalVariation * 1000);
        }
    }
    
    applyFlickerEffects() {
        // Horizontal flicker
        if (this.hFlicker) {
            if (this.hFlickerAlternate) {
                this.eyeLx += this.hFlickerAmplitude;
                this.eyeRx += this.hFlickerAmplitude;
            } else {
                this.eyeLx -= this.hFlickerAmplitude;
                this.eyeRx -= this.hFlickerAmplitude;
            }
            this.hFlickerAlternate = !this.hFlickerAlternate;
        }
        
        // Vertical flicker
        if (this.vFlicker) {
            if (this.vFlickerAlternate) {
                this.eyeLy += this.vFlickerAmplitude;
                this.eyeRy += this.vFlickerAmplitude;
            } else {
                this.eyeLy -= this.vFlickerAmplitude;
                this.eyeRy -= this.vFlickerAmplitude;
            }
            this.vFlickerAlternate = !this.vFlickerAlternate;
        }
    }
    
    drawMoodEyelids() {
        // Prepare mood transitions
        if (this.tired) {
            this.eyelidsTiredHeightNext = this.eyeLheightCurrent / 2;
            this.eyelidsAngryHeightNext = 0;
        } else {
            this.eyelidsTiredHeightNext = 0;
        }
        
        if (this.angry) {
            this.eyelidsAngryHeightNext = this.eyeLheightCurrent / 2;
            this.eyelidsTiredHeightNext = 0;
        } else {
            this.eyelidsAngryHeightNext = 0;
        }
        
        if (this.happy) {
            this.eyelidsHappyBottomOffsetNext = this.eyeLheightCurrent / 2;
        } else {
            this.eyelidsHappyBottomOffsetNext = 0;
        }
        
        // Draw tired eyelids
        this.eyelidsTiredHeight = Math.round((this.eyelidsTiredHeight + this.eyelidsTiredHeightNext) / 2);
        if (!this.cyclops) {
            this.fillTriangle(this.eyeLx, this.eyeLy - 1, this.eyeLx + this.eyeLwidthCurrent, this.eyeLy - 1, this.eyeLx, this.eyeLy + this.eyelidsTiredHeight - 1, this.BGCOLOR);
            this.fillTriangle(this.eyeRx, this.eyeRy - 1, this.eyeRx + this.eyeRwidthCurrent, this.eyeRy - 1, this.eyeRx + this.eyeRwidthCurrent, this.eyeRy + this.eyelidsTiredHeight - 1, this.BGCOLOR);
        } else {
            // Cyclops tired eyelids
            this.fillTriangle(this.eyeLx, this.eyeLy - 1, this.eyeLx + (this.eyeLwidthCurrent / 2), this.eyeLy - 1, this.eyeLx, this.eyeLy + this.eyelidsTiredHeight - 1, this.BGCOLOR);
            this.fillTriangle(this.eyeLx + (this.eyeLwidthCurrent / 2), this.eyeLy - 1, this.eyeLx + this.eyeLwidthCurrent, this.eyeLy - 1, this.eyeLx + this.eyeLwidthCurrent, this.eyeLy + this.eyelidsTiredHeight - 1, this.BGCOLOR);
        }
        
        // Draw angry eyelids
        this.eyelidsAngryHeight = Math.round((this.eyelidsAngryHeight + this.eyelidsAngryHeightNext) / 2);
        if (!this.cyclops) {
            this.fillTriangle(this.eyeLx, this.eyeLy - 1, this.eyeLx + this.eyeLwidthCurrent, this.eyeLy - 1, this.eyeLx + this.eyeLwidthCurrent, this.eyeLy + this.eyelidsAngryHeight - 1, this.BGCOLOR);
            this.fillTriangle(this.eyeRx, this.eyeRy - 1, this.eyeRx + this.eyeRwidthCurrent, this.eyeRy - 1, this.eyeRx, this.eyeRy + this.eyelidsAngryHeight - 1, this.BGCOLOR);
        } else {
            // Cyclops angry eyelids
            this.fillTriangle(this.eyeLx, this.eyeLy - 1, this.eyeLx + (this.eyeLwidthCurrent / 2), this.eyeLy - 1, this.eyeLx + (this.eyeLwidthCurrent / 2), this.eyeLy + this.eyelidsAngryHeight - 1, this.BGCOLOR);
            this.fillTriangle(this.eyeLx + (this.eyeLwidthCurrent / 2), this.eyeLy - 1, this.eyeLx + this.eyeLwidthCurrent, this.eyeLy - 1, this.eyeLx + (this.eyeLwidthCurrent / 2), this.eyeLy + this.eyelidsAngryHeight - 1, this.BGCOLOR);
        }
        
        // Draw happy bottom eyelids
        this.eyelidsHappyBottomOffset = Math.round((this.eyelidsHappyBottomOffset + this.eyelidsHappyBottomOffsetNext) / 2);
        this.fillRoundRect(this.eyeLx - 1, (this.eyeLy + this.eyeLheightCurrent) - this.eyelidsHappyBottomOffset + 1, this.eyeLwidthCurrent + 2, this.eyeLheightDefault, this.eyeLborderRadiusCurrent, this.BGCOLOR);
        
        if (!this.cyclops) {
            this.fillRoundRect(this.eyeRx - 1, (this.eyeRy + this.eyeRheightCurrent) - this.eyelidsHappyBottomOffset + 1, this.eyeRwidthCurrent + 2, this.eyeRheightDefault, this.eyeRborderRadiusCurrent, this.BGCOLOR);
        }
    }
    
    drawSweatDrops() {
        // Sweat drop 1
        if (this.sweat1.y <= this.sweat1.yMax) {
            this.sweat1.y += 1;
        } else {
            this.sweat1.xInitial = Math.random() * 60;
            this.sweat1.y = 4;
            this.sweat1.yMax = (Math.random() * 20) + 20;
            this.sweat1.width = 2;
            this.sweat1.height = 4;
        }
        
        if (this.sweat1.y <= this.sweat1.yMax / 2) {
            this.sweat1.width += 1;
            this.sweat1.height += 1;
        } else {
            this.sweat1.width -= 0.2;
            this.sweat1.height -= 1;
        }
        
        this.sweat1.x = this.sweat1.xInitial - (this.sweat1.width / 2);
        const tearColor1 = this.tearColor || this.MAINCOLOR;
        this.fillRoundRect(this.sweat1.x, this.sweat1.y, this.sweat1.width, this.sweat1.height, this.sweatBorderRadius, tearColor1);
        
        // Sweat drop 2
        if (this.sweat2.y <= this.sweat2.yMax) {
            this.sweat2.y += 1;
        } else {
            this.sweat2.xInitial = Math.random() * (this.screenWidth - 120) + 60;
            this.sweat2.y = 4;
            this.sweat2.yMax = (Math.random() * 20) + 20;
            this.sweat2.width = 2;
            this.sweat2.height = 4;
        }
        
        if (this.sweat2.y <= this.sweat2.yMax / 2) {
            this.sweat2.width += 1;
            this.sweat2.height += 1;
        } else {
            this.sweat2.width -= 0.2;
            this.sweat2.height -= 1;
        }
        
        this.sweat2.x = this.sweat2.xInitial - (this.sweat2.width / 2);
        const tearColor2 = this.tearColor || this.MAINCOLOR;
        this.fillRoundRect(this.sweat2.x, this.sweat2.y, this.sweat2.width, this.sweat2.height, this.sweatBorderRadius, tearColor2);
        
        // Sweat drop 3
        if (this.sweat3.y <= this.sweat3.yMax) {
            this.sweat3.y += 1;
        } else {
            this.sweat3.xInitial = (this.screenWidth - 60) + (Math.random() * 60);
            this.sweat3.y = 4;
            this.sweat3.yMax = (Math.random() * 20) + 20;
            this.sweat3.width = 2;
            this.sweat3.height = 4;
        }
        
        if (this.sweat3.y <= this.sweat3.yMax / 2) {
            this.sweat3.width += 1;
            this.sweat3.height += 1;
        } else {
            this.sweat3.width -= 0.2;
            this.sweat3.height -= 1;
        }
        
        this.sweat3.x = this.sweat3.xInitial - (this.sweat3.width / 2);
        const tearColor3 = this.tearColor || this.MAINCOLOR;
        this.fillRoundRect(this.sweat3.x, this.sweat3.y, this.sweat3.width, this.sweat3.height, this.sweatBorderRadius, tearColor3);
    }
    
    drawWateryEyes() {
        // Create watery/glossy effect inside the eyes
        const ctx = this.canvas.getContext('2d');
        ctx.globalAlpha = 0.3; // Semi-transparent for glossy effect
        
        // Left eye watery effect
        if (this.eyeLheightCurrent > 0) {
            // Create gradient for watery effect
            const leftGradient = ctx.createLinearGradient(
                this.eyeLx, this.eyeLy,
                this.eyeLx, this.eyeLy + this.eyeLheightCurrent
            );
            leftGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Bright highlight at top
            leftGradient.addColorStop(0.3, 'rgba(200, 240, 255, 0.6)'); // Light blue tint
            leftGradient.addColorStop(0.7, 'rgba(150, 200, 255, 0.4)'); // More blue
            leftGradient.addColorStop(1, 'rgba(100, 150, 255, 0.2)'); // Darker blue at bottom
            
            ctx.fillStyle = leftGradient;
            this.fillRoundRectWithContext(ctx, this.eyeLx + 2, this.eyeLy + 2, 
                this.eyeLwidthCurrent - 4, this.eyeLheightCurrent - 4, 
                this.eyeLborderRadiusCurrent - 2);
            
            // Add small highlight spots for extra wetness
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const highlight1X = this.eyeLx + this.eyeLwidthCurrent * 0.3;
            const highlight1Y = this.eyeLy + this.eyeLheightCurrent * 0.2;
            ctx.beginPath();
            ctx.arc(highlight1X, highlight1Y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Smaller highlight
            const highlight2X = this.eyeLx + this.eyeLwidthCurrent * 0.7;
            const highlight2Y = this.eyeLy + this.eyeLheightCurrent * 0.4;
            ctx.beginPath();
            ctx.arc(highlight2X, highlight2Y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Right eye watery effect (if not cyclops)
        if (!this.cyclops && this.eyeRheightCurrent > 0) {
            // Create gradient for watery effect
            const rightGradient = ctx.createLinearGradient(
                this.eyeRx, this.eyeRy,
                this.eyeRx, this.eyeRy + this.eyeRheightCurrent
            );
            rightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Bright highlight at top
            rightGradient.addColorStop(0.3, 'rgba(200, 240, 255, 0.6)'); // Light blue tint
            rightGradient.addColorStop(0.7, 'rgba(150, 200, 255, 0.4)'); // More blue
            rightGradient.addColorStop(1, 'rgba(100, 150, 255, 0.2)'); // Darker blue at bottom
            
            ctx.fillStyle = rightGradient;
            this.fillRoundRectWithContext(ctx, this.eyeRx + 2, this.eyeRy + 2, 
                this.eyeRwidthCurrent - 4, this.eyeRheightCurrent - 4, 
                this.eyeRborderRadiusCurrent - 2);
            
            // Add small highlight spots for extra wetness
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const highlight1X = this.eyeRx + this.eyeRwidthCurrent * 0.3;
            const highlight1Y = this.eyeRy + this.eyeRheightCurrent * 0.2;
            ctx.beginPath();
            ctx.arc(highlight1X, highlight1Y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Smaller highlight
            const highlight2X = this.eyeRx + this.eyeRwidthCurrent * 0.7;
            const highlight2Y = this.eyeRy + this.eyeRheightCurrent * 0.4;
            ctx.beginPath();
            ctx.arc(highlight2X, highlight2Y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0; // Reset alpha
    }
    
    fillRoundRectWithContext(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoboEyes;
}