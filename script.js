class TechnicalRobot {
    constructor() {
        this.currentEmotion = 'idle';
        this.autoMode = false;
        this.autoModeInterval = null;
        this.systemInterval = null;
        this.emotions = ['idle', 'happy', 'processing', 'alert', 'error', 'love', 'sleep', 'scan', 'tired', 'angry', 'confused', 'laugh'];
        this.powerLevel = 100;
        this.cpuUsage = 45;
        this.systemStatus = 'ONLINE';
        
        // Initialize FluxGarage RoboEyes
        this.initializeRoboEyes();
        
        this.initializeEventListeners();
        this.setEmotion('idle');
        this.startSystemMonitoring();
        this.startIdleAnimation();
    }
    
    initializeRoboEyes() {
        const canvas = document.getElementById('roboEyesCanvas');
        if (canvas) {
            this.roboEyes = new RoboEyes(canvas);
            this.roboEyes.begin(200, 200, 50); // 200x200 canvas, 50 FPS
            this.roboEyes.setDisplayColors('#1a1a1a', '#00aaff');
            this.roboEyes.setAutoblinker(true, 2, 3); // Auto blink every 2-5 seconds
            this.roboEyes.setCuriosity(true); // Enable curious eye behavior
            
            // Start the eye animation loop
            this.startEyeAnimation();
        }
    }
    
    startEyeAnimation() {
        const animate = () => {
            if (this.roboEyes) {
                this.roboEyes.update();
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    initializeEventListeners() {
        // Eye tracking for robot eyes
        document.addEventListener('mousemove', (e) => {
            if (!this.autoMode && this.roboEyes) {
                this.updateEyeTracking(e.clientX, e.clientY);
            }
        });
        
        // Touch support for mobile
        document.addEventListener('touchmove', (e) => {
            if (!this.autoMode && e.touches.length > 0 && this.roboEyes) {
                const touch = e.touches[0];
                this.updateEyeTracking(touch.clientX, touch.clientY);
            }
        });
    }
    
    updateEyeTracking(mouseX, mouseY) {
        const canvas = document.getElementById('roboEyesCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const canvasX = rect.left + rect.width / 2;
        const canvasY = rect.top + rect.height / 2;
        
        const deltaX = mouseX - canvasX;
        const deltaY = mouseY - canvasY;
        
        // Convert mouse position to eye position (0-8 for FluxGarage positions)
        const maxDistance = 100;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 20) { // Only move if mouse is not too close to center
            let position = this.roboEyes.POSITION.DEFAULT;
            
            const angle = Math.atan2(deltaY, deltaX);
            const degrees = (angle * 180 / Math.PI + 360) % 360;
            
            if (degrees >= 337.5 || degrees < 22.5) position = this.roboEyes.POSITION.E;
            else if (degrees >= 22.5 && degrees < 67.5) position = this.roboEyes.POSITION.SE;
            else if (degrees >= 67.5 && degrees < 112.5) position = this.roboEyes.POSITION.S;
            else if (degrees >= 112.5 && degrees < 157.5) position = this.roboEyes.POSITION.SW;
            else if (degrees >= 157.5 && degrees < 202.5) position = this.roboEyes.POSITION.W;
            else if (degrees >= 202.5 && degrees < 247.5) position = this.roboEyes.POSITION.NW;
            else if (degrees >= 247.5 && degrees < 292.5) position = this.roboEyes.POSITION.N;
            else if (degrees >= 292.5 && degrees < 337.5) position = this.roboEyes.POSITION.NE;
            
            this.roboEyes.setPosition(position);
        }
    }
    
    setEmotion(emotion) {
        const robotFace = document.getElementById('robotFace');
        
        // Remove all emotion classes
        this.emotions.forEach(em => {
            robotFace.classList.remove(`emotion-${em}`);
        });
        
        // Add new emotion class
        robotFace.classList.add(`emotion-${emotion}`);
        this.currentEmotion = emotion;
        
        // Update active button
        this.updateActiveButton(emotion);
        
        // Handle special emotion effects
        this.handleSpecialEmotionEffects(emotion);
        
        // Update system status based on emotion
        this.updateSystemStatus(emotion);
        
        // Apply emotion to FluxGarage RoboEyes
        if (this.roboEyes) {
            this.applyRoboEyesEmotion(emotion);
        }
    }
    
    applyRoboEyesEmotion(emotion) {
        // Reset all states first
        this.roboEyes.setMood(this.roboEyes.MOOD.DEFAULT);
        this.roboEyes.setSweat(false);
        this.roboEyes.setHFlicker(false);
        this.roboEyes.setVFlicker(false);
        
        switch(emotion) {
            case 'happy':
                this.roboEyes.setMood(this.roboEyes.MOOD.HAPPY);
                this.roboEyes.setDisplayColors('#1a1a1a', '#00ff00');
                break;
            case 'tired':
            case 'sleep':
                this.roboEyes.setMood(this.roboEyes.MOOD.TIRED);
                this.roboEyes.setDisplayColors('#1a1a1a', '#8800ff');
                break;
            case 'angry':
            case 'error':
                this.roboEyes.setMood(this.roboEyes.MOOD.ANGRY);
                this.roboEyes.setDisplayColors('#1a1a1a', '#ff0000');
                break;
            case 'alert':
                this.roboEyes.setDisplayColors('#1a1a1a', '#ffaa00');
                this.roboEyes.setHFlicker(true, 8);
                break;
            case 'processing':
                this.roboEyes.setDisplayColors('#1a1a1a', '#0088ff');
                this.roboEyes.setIdleMode(true, 1, 2);
                break;
            case 'love':
                this.roboEyes.setMood(this.roboEyes.MOOD.HAPPY);
                this.roboEyes.setDisplayColors('#1a1a1a', '#ff00aa');
                break;
            case 'confused':
                this.roboEyes.setDisplayColors('#1a1a1a', '#00ffff');
                this.roboEyes.anim_confused();
                break;
            case 'laugh':
                this.roboEyes.setMood(this.roboEyes.MOOD.HAPPY);
                this.roboEyes.setDisplayColors('#1a1a1a', '#00ff00');
                this.roboEyes.anim_laugh();
                break;
            case 'scan':
                this.roboEyes.setDisplayColors('#1a1a1a', '#00ffff');
                this.roboEyes.setIdleMode(true, 0.5, 1);
                break;
            default: // idle
                this.roboEyes.setDisplayColors('#1a1a1a', '#00aaff');
                this.roboEyes.setIdleMode(false);
                break;
        }
    }
    
    updateActiveButton(emotion) {
        const buttons = document.querySelectorAll('.emotion-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[onclick="setEmotion('${emotion}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    handleSpecialEmotionEffects(emotion) {
        const speaker = document.getElementById('speakerMembrane');
        const cpuDisplay = document.getElementById('cpuDisplay');
        
        switch(emotion) {
            case 'processing':
                this.createDataStreamEffect();
                break;
            case 'alert':
                this.createWarningEffect();
                break;
            case 'error':
                this.createErrorEffect();
                break;
            case 'love':
                this.createLoveEffect();
                break;
            case 'scan':
                this.createScanEffect();
                break;
            case 'sleep':
                this.createSleepEffect();
                break;
        }
    }
    
    updateSystemStatus(emotion) {
        const statusElement = document.getElementById('systemStatus');
        const cpuElement = document.getElementById('cpuUsage');
        
        const statusMap = {
            'idle': { status: 'STANDBY', cpu: 25 },
            'happy': { status: 'OPTIMAL', cpu: 35 },
            'processing': { status: 'COMPUTING', cpu: 85 },
            'alert': { status: 'WARNING', cpu: 60 },
            'error': { status: 'ERROR', cpu: 95 },
            'love': { status: 'EMOTIONAL', cpu: 55 },
            'sleep': { status: 'HIBERNATE', cpu: 5 },
            'scan': { status: 'SCANNING', cpu: 75 },
            'tired': { status: 'TIRED', cpu: 15 },
            'angry': { status: 'ANGRY', cpu: 70 },
            'confused': { status: 'CONFUSED', cpu: 50 },
            'laugh': { status: 'LAUGHING', cpu: 40 }
        };
        
        const data = statusMap[emotion] || statusMap['idle'];
        statusElement.textContent = data.status;
        cpuElement.textContent = `${data.cpu}%`;
        
        // Update CPU color based on usage
        if (data.cpu > 80) {
            cpuElement.style.color = '#ff0000';
        } else if (data.cpu > 60) {
            cpuElement.style.color = '#ffaa00';
        } else {
            cpuElement.style.color = '#0088ff';
        }
    }
    
    createDataStreamEffect() {
        const robotContainer = document.querySelector('.robot-container');
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const data = document.createElement('div');
                data.textContent = Math.random() > 0.5 ? '1' : '0';
                data.style.position = 'absolute';
                data.style.color = '#00ff00';
                data.style.fontSize = '12px';
                data.style.fontFamily = 'Courier New';
                data.style.left = Math.random() * 400 + 'px';
                data.style.top = Math.random() * 400 + 'px';
                data.style.pointerEvents = 'none';
                data.style.animation = 'dataFlow 2s ease-out forwards';
                data.style.opacity = '0';
                robotContainer.appendChild(data);
                
                setTimeout(() => {
                    data.remove();
                }, 2000);
            }, i * 100);
        }
    }
    
    createWarningEffect() {
        const head = document.querySelector('.head');
        head.style.border = '3px solid #ffaa00';
        head.style.boxShadow = '0 0 30px rgba(255,170,0,0.5)';
        
        setTimeout(() => {
            head.style.border = '3px solid #404040';
            head.style.boxShadow = '';
        }, 2000);
    }
    
    createErrorEffect() {
        const robotContainer = document.querySelector('.robot-container');
        const head = document.querySelector('.head');
        
        head.classList.add('glitch');
        head.style.border = '3px solid #ff0000';
        head.style.boxShadow = '0 0 40px rgba(255,0,0,0.7)';
        
        // Create error text
        const errorText = document.createElement('div');
        errorText.textContent = 'SYSTEM ERROR';
        errorText.style.position = 'absolute';
        errorText.style.color = '#ff0000';
        errorText.style.fontSize = '16px';
        errorText.style.fontFamily = 'Courier New';
        errorText.style.fontWeight = 'bold';
        errorText.style.left = '50%';
        errorText.style.top = '20px';
        errorText.style.transform = 'translateX(-50%)';
        errorText.style.pointerEvents = 'none';
        errorText.style.animation = 'errorBlink 0.3s infinite';
        robotContainer.appendChild(errorText);
        
        setTimeout(() => {
            head.classList.remove('glitch');
            head.style.border = '3px solid #404040';
            head.style.boxShadow = '';
            errorText.remove();
        }, 3000);
    }
    
    createLoveEffect() {
        const robotContainer = document.querySelector('.robot-container');
        const hearts = ['💖', '💕', '💗', '💝'];
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.position = 'absolute';
                heart.style.fontSize = '20px';
                heart.style.left = Math.random() * 300 + 'px';
                heart.style.top = '400px';
                heart.style.pointerEvents = 'none';
                heart.style.animation = 'floatUp 3s ease-out forwards';
                robotContainer.appendChild(heart);
                
                setTimeout(() => {
                    heart.remove();
                }, 3000);
            }, i * 400);
        }
    }
    
    createScanEffect() {
        const robotContainer = document.querySelector('.robot-container');
        
        // Create scan line
        const scanLine = document.createElement('div');
        scanLine.style.position = 'absolute';
        scanLine.style.width = '100%';
        scanLine.style.height = '2px';
        scanLine.style.background = '#00ffff';
        scanLine.style.boxShadow = '0 0 10px #00ffff';
        scanLine.style.left = '0';
        scanLine.style.top = '0';
        scanLine.style.pointerEvents = 'none';
        scanLine.style.animation = 'scanLine 2s ease-in-out infinite';
        robotContainer.appendChild(scanLine);
        
        setTimeout(() => {
            scanLine.remove();
        }, 4000);
    }
    
    createSleepEffect() {
        const head = document.querySelector('.head');
        const zzz = ['Z', 'z', 'Z'];
        
        zzz.forEach((letter, index) => {
            setTimeout(() => {
                const sleepText = document.createElement('div');
                sleepText.textContent = letter;
                sleepText.style.position = 'absolute';
                sleepText.style.fontSize = `${18 + index * 4}px`;
                sleepText.style.color = '#8800ff';
                sleepText.style.fontWeight = 'bold';
                sleepText.style.left = `${70 + index * 15}%`;
                sleepText.style.top = '10px';
                sleepText.style.pointerEvents = 'none';
                sleepText.style.animation = 'sleepFloat 3s ease-out forwards';
                head.appendChild(sleepText);
                
                setTimeout(() => {
                    sleepText.remove();
                }, 3000);
            }, index * 800);
        });
    }
    
    startSystemMonitoring() {
        this.systemInterval = setInterval(() => {
            // Simulate power consumption
            if (this.currentEmotion === 'processing' || this.currentEmotion === 'scan') {
                this.powerLevel = Math.max(0, this.powerLevel - 0.5);
            } else if (this.currentEmotion === 'sleep') {
                this.powerLevel = Math.min(100, this.powerLevel + 0.2);
            } else {
                this.powerLevel = Math.max(0, this.powerLevel - 0.1);
            }
            
            // Update power display
            const powerFill = document.getElementById('powerFill');
            const powerText = document.getElementById('powerText');
            if (powerFill && powerText) {
                powerFill.style.width = `${this.powerLevel}%`;
                powerText.textContent = `${Math.round(this.powerLevel)}%`;
                
                // Change power bar color based on level
                if (this.powerLevel < 20) {
                    powerFill.style.background = 'linear-gradient(90deg, #ff0000, #ff4400)';
                } else if (this.powerLevel < 50) {
                    powerFill.style.background = 'linear-gradient(90deg, #ffaa00, #ffdd00)';
                } else {
                    powerFill.style.background = 'linear-gradient(90deg, #00ff00, #88ff00)';
                }
            }
        }, 1000);
    }
    
    startIdleAnimation() {
        const head = document.querySelector('.head');
        head.style.animation = 'breathe 6s ease-in-out infinite';
    }
    
    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        
        if (this.autoMode) {
            this.startAutoMode();
        } else {
            this.stopAutoMode();
        }
    }
    
    startAutoMode() {
        this.autoModeInterval = setInterval(() => {
            const availableEmotions = this.emotions.filter(e => e !== this.currentEmotion);
            const randomEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)];
            this.setEmotion(randomEmotion);
        }, 4000);
    }
    
    stopAutoMode() {
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
            this.autoModeInterval = null;
        }
    }
    
    shutdown() {
        if (this.systemInterval) {
            clearInterval(this.systemInterval);
        }
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
        }
    }
}

// Global functions for HTML buttons
function setEmotion(emotion) {
    technicalRobot.setEmotion(emotion);
}

function toggleAutoMode() {
    technicalRobot.toggleAutoMode();
}

// FluxGarage RoboEyes control functions
function toggleCyclops() {
    if (technicalRobot.roboEyes) {
        const currentState = technicalRobot.roboEyes.cyclops;
        technicalRobot.roboEyes.setCyclops(!currentState);
        
        // Update button appearance
        const btn = event.target;
        if (!currentState) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

function toggleCuriosity() {
    if (technicalRobot.roboEyes) {
        const currentState = technicalRobot.roboEyes.curious;
        technicalRobot.roboEyes.setCuriosity(!currentState);
        
        // Update button appearance
        const btn = event.target;
        if (!currentState) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

function toggleSweat() {
    if (technicalRobot.roboEyes) {
        const currentState = technicalRobot.roboEyes.sweat;
        technicalRobot.roboEyes.setSweat(!currentState);
        
        // Update button appearance
        const btn = event.target;
        if (!currentState) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

function toggleIdle() {
    if (technicalRobot.roboEyes) {
        const currentState = technicalRobot.roboEyes.idle;
        technicalRobot.roboEyes.setIdleMode(!currentState, 2, 3);
        
        // Update button appearance
        const btn = event.target;
        if (!currentState) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

// Make roboEyes globally accessible for direct control
let roboEyes;

// Add additional CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes dataFlow {
        0% { opacity: 0; transform: translateY(0) scale(0); }
        20% { opacity: 1; transform: translateY(-20px) scale(1); }
        100% { opacity: 0; transform: translateY(-100px) scale(0); }
    }
    
    @keyframes floatUp {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
    }
    
    @keyframes sleepFloat {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100px); opacity: 0; }
    }
    
    @keyframes scanLine {
        0% { top: 0; opacity: 1; }
        50% { opacity: 0.7; }
        100% { top: 100%; opacity: 0; }
    }
    
    @keyframes errorBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);

// Initialize the technical robot when page loads
let technicalRobot;
document.addEventListener('DOMContentLoaded', () => {
    technicalRobot = new TechnicalRobot();
    // Make roboEyes globally accessible
    roboEyes = technicalRobot.roboEyes;
});

// Enhanced fullscreen support for mobile
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Request fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().then(() => {
                document.body.classList.add('fullscreen');
                lockOrientationLandscape();
            }).catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
                // Fallback for mobile browsers
                enableMobileFullscreen();
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
            document.body.classList.add('fullscreen');
            lockOrientationLandscape();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
            document.body.classList.add('fullscreen');
            lockOrientationLandscape();
        } else {
            // Fallback for browsers that don't support fullscreen
            enableMobileFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                document.body.classList.remove('fullscreen');
                unlockOrientation();
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            document.body.classList.remove('fullscreen');
            unlockOrientation();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
            document.body.classList.remove('fullscreen');
            unlockOrientation();
        }
    }
}

function enableMobileFullscreen() {
    // Fallback for mobile browsers
    document.body.classList.add('fullscreen');
    // Hide address bar on mobile
    window.scrollTo(0, 1);
    
    // Try to lock orientation
    lockOrientationLandscape();
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function lockOrientationLandscape() {
    // Try to lock orientation to landscape
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
            console.log('Could not lock orientation:', err);
        });
    } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
    } else if (screen.webkitLockOrientation) {
        screen.webkitLockOrientation('landscape');
    } else if (screen.msLockOrientation) {
        screen.msLockOrientation('landscape');
    }
}

function unlockOrientation() {
    // Unlock orientation
    if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
    } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
    } else if (screen.webkitUnlockOrientation) {
        screen.webkitUnlockOrientation();
    } else if (screen.msUnlockOrientation) {
        screen.msUnlockOrientation();
    }
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

// Add double-tap to fullscreen on mobile
let lastTap = 0;
document.addEventListener('touchend', function(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
        toggleFullscreen();
    }
    lastTap = currentTime;
});

// Enhanced touch handling for mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault(); // Prevent multi-touch zoom
    }
});

document.addEventListener('touchmove', function(e) {
    if (document.body.classList.contains('fullscreen')) {
        e.preventDefault(); // Prevent scrolling in fullscreen
    }
});

// Handle fullscreen change events
document.addEventListener('fullscreenchange', function() {
    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen');
        lockOrientationLandscape();
    } else {
        document.body.classList.remove('fullscreen');
        unlockOrientation();
    }
});

document.addEventListener('webkitfullscreenchange', function() {
    if (document.webkitFullscreenElement) {
        document.body.classList.add('fullscreen');
        lockOrientationLandscape();
    } else {
        document.body.classList.remove('fullscreen');
        unlockOrientation();
    }
});

// Orientation change handling
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        // Adjust robot size based on new orientation
        if (window.orientation === 90 || window.orientation === -90) {
            // Landscape mode
            document.body.classList.add('landscape-mode');
        } else {
            // Portrait mode
            document.body.classList.remove('landscape-mode');
        }
        
        // Force a repaint to fix any layout issues
        technicalRobot.startIdleAnimation();
    }, 500);
});

// Auto-enter fullscreen on landscape for mobile
if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if ((window.orientation === 90 || window.orientation === -90) && !document.fullscreenElement) {
                // Auto-suggest fullscreen in landscape
                const hint = document.querySelector('.orientation-hint span');
                if (hint) {
                    hint.textContent = '📲 Tap "Fullscreen Mode" for best robot experience!';
                    hint.style.color = '#00ff00';
                    hint.style.animation = 'pulse-slow 1s infinite';
                }
            }
        }, 1000);
    });
}

// Keyboard shortcuts for emotions
document.addEventListener('keydown', function(e) {
    const keyMap = {
        '1': 'idle',
        '2': 'happy',
        '3': 'processing',
        '4': 'alert',
        '5': 'error',
        '6': 'love',
        '7': 'sleep',
        '8': 'scan',
        '9': 'tired',
        '0': 'angry',
        'q': 'confused',
        'w': 'laugh',
        'b': 'blink',
        'c': 'cyclops',
        's': 'sweat',
        'i': 'idle_eyes',
        ' ': 'toggleAuto' // Spacebar
    };
    
    const action = keyMap[e.key.toLowerCase()];
    if (action) {
        e.preventDefault();
        if (action === 'toggleAuto') {
            document.getElementById('autoMode').click();
        } else if (action === 'blink' && roboEyes) {
            roboEyes.blink();
        } else if (action === 'cyclops' && roboEyes) {
            roboEyes.setCyclops(!roboEyes.cyclops);
        } else if (action === 'sweat' && roboEyes) {
            roboEyes.setSweat(!roboEyes.sweat);
        } else if (action === 'idle_eyes' && roboEyes) {
            roboEyes.setIdleMode(!roboEyes.idle, 2, 3);
        } else {
            technicalRobot.setEmotion(action);
        }
    }
});

// Voice commands (enhanced for technical robot)
if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = function(event) {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Map voice commands to robot states
        if (command.includes('idle') || command.includes('standby')) {
            technicalRobot.setEmotion('idle');
        } else if (command.includes('happy') || command.includes('smile') || command.includes('good')) {
            technicalRobot.setEmotion('happy');
        } else if (command.includes('process') || command.includes('compute') || command.includes('calculate')) {
            technicalRobot.setEmotion('processing');
        } else if (command.includes('alert') || command.includes('warning') || command.includes('attention')) {
            technicalRobot.setEmotion('alert');
        } else if (command.includes('error') || command.includes('problem') || command.includes('malfunction')) {
            technicalRobot.setEmotion('error');
        } else if (command.includes('love') || command.includes('heart') || command.includes('affection')) {
            technicalRobot.setEmotion('love');
        } else if (command.includes('sleep') || command.includes('hibernate') || command.includes('rest')) {
            technicalRobot.setEmotion('sleep');
        } else if (command.includes('scan') || command.includes('search') || command.includes('analyze')) {
            technicalRobot.setEmotion('scan');
        } else if (command.includes('tired') || command.includes('exhausted')) {
            technicalRobot.setEmotion('tired');
        } else if (command.includes('angry') || command.includes('mad') || command.includes('furious')) {
            technicalRobot.setEmotion('angry');
        } else if (command.includes('confused') || command.includes('puzzled')) {
            technicalRobot.setEmotion('confused');
        } else if (command.includes('laugh') || command.includes('funny') || command.includes('hilarious')) {
            technicalRobot.setEmotion('laugh');
        } else if (command.includes('blink') || command.includes('wink')) {
            if (roboEyes) roboEyes.blink();
        } else if (command.includes('cyclops') || command.includes('one eye')) {
            if (roboEyes) roboEyes.setCyclops(!roboEyes.cyclops);
        } else if (command.includes('sweat') || command.includes('nervous')) {
            if (roboEyes) roboEyes.setSweat(!roboEyes.sweat);
        } else if (command.includes('auto') || command.includes('automatic')) {
            document.getElementById('autoMode').click();
        }
    };
    
    // Auto-start voice recognition (optional)
    // recognition.start();
}

// Device orientation support for mobile robots
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
        // Could be used to tilt the robot head based on device orientation
        // const head = document.querySelector('.head');
        // head.style.transform = `rotate(${e.gamma * 0.1}deg)`;
    });
}

// Battery API integration (if available)
if ('getBattery' in navigator) {
    navigator.getBattery().then(function(battery) {
        function updateBatteryInfo() {
            const powerLevel = Math.round(battery.level * 100);
            const powerFill = document.getElementById('powerFill');
            const powerText = document.getElementById('powerText');
            
            if (powerFill && powerText) {
                technicalRobot.powerLevel = powerLevel;
                powerFill.style.width = `${powerLevel}%`;
                powerText.textContent = `${powerLevel}%`;
            }
        }
        
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        updateBatteryInfo();
    });
}

// Page visibility API - pause robot when tab is hidden
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations when tab is hidden
        if (technicalRobot && technicalRobot.autoMode) {
            technicalRobot.stopAutoMode();
            technicalRobot.pausedAutoMode = true;
        }
    } else {
        // Resume animations when tab is visible
        if (technicalRobot && technicalRobot.pausedAutoMode) {
            technicalRobot.startAutoMode();
            technicalRobot.pausedAutoMode = false;
        }
    }
});

console.log('🤖 FluxGarage Technical Robot Interface Loaded');
console.log('Keyboard shortcuts: 1-0,Q,W for emotions | B=blink | C=cyclops | S=sweat | I=idle eyes | Space=auto mode');
console.log('Double-tap for fullscreen on mobile');
console.log('Voice commands available (if supported)');
console.log('FluxGarage RoboEyes integration active!');
