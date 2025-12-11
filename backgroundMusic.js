/**
 * Background Music Manager
 * Handles location-based background music with smooth transitions
 */

// Import encoded audio (we'll load it dynamically)
let encodedAudio = null;

// City to music mapping
const cityMusicMap = {
    // Asian cities
    'Singapore': 'Asia',
    'Hong Kong': 'Asia',
    'Shanghai': 'China',
    'Mumbai': 'Asia',
    
    // European cities
    'Monaco': 'Europe',
    'Zurich': 'Europe',
    'Geneva': 'Europe',
    'Luxembourg': 'Europe',
    'Amsterdam': 'Europe',
    'Moscow': 'Europe',
    
    // North American cities
    'Silicon Valley': 'North America',
    'Beverly Hills': 'North America',
    'Manhattan': 'North America',
    
    // Other/Western cities
    'Dubai': 'Western',
    'São Paulo': 'Western',
    'Cairo': 'Western'
};

class BackgroundMusicManager {
    constructor() {
        this.currentAudio = null;
        this.currentMusicKey = null;
        this.changeTimeout = null;
        this.volume = 0.075; // Low volume for background (7.5%)
        this.fadeDuration = 500; // 500ms fade in/out
        this.changeDelay = 1500; // 1.5 second delay before changing music
        this.userInteracted = false; // Track if user has interacted with the page
        this.pendingStart = null; // Store pending city to start music for
        this.enabled = true; // Audio enabled/disabled state
        
        // Load encoded audio
        this.loadEncodedAudio();
        
        // Listen for user interaction to enable audio playback
        this.setupUserInteractionListener();
        
        // Initialize toggle UI
        setTimeout(() => this.updateToggleUI(), 100);
    }
    
    /**
     * Setup listener for user interaction to enable audio playback
     */
    setupUserInteractionListener() {
        const enableAudio = () => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                console.log('[BackgroundMusic] User interaction detected - audio enabled');
                
                // If there's a pending start, trigger it now
                if (this.pendingStart) {
                    const city = this.pendingStart;
                    this.pendingStart = null;
                    // Use _performMusicChange directly since we know audio is loaded and user has interacted
                    if (encodedAudio) {
                        const musicKey = this.getMusicKeyForCity(city);
                        this._performMusicChange(musicKey);
                    }
                }
            }
        };
        
        // Listen for various user interaction events
        const events = ['click', 'touchstart', 'keydown', 'mousedown'];
        events.forEach(event => {
            document.addEventListener(event, enableAudio, { once: true, passive: true });
        });
    }
    
    /**
     * Load encoded audio from the audio module
     */
    async loadEncodedAudio() {
        // Wait for the encoded audio to be available
        // Check periodically if it's loaded (since modules load asynchronously)
        const maxAttempts = 50; // 5 seconds max wait
        let attempts = 0;
        
        const checkForAudio = () => {
            attempts++;
            
            // Check if it's available globally
            if (typeof window !== 'undefined' && window.encodedAudio) {
                encodedAudio = window.encodedAudio;
                console.log('[BackgroundMusic] Audio files loaded from global variable');
                return true;
            }
            
            // Try to import as ES module
            if (attempts === 1) {
                import('./audio/encoded-audio.js')
                    .then(audioModule => {
                        if (audioModule && audioModule.encodedAudio) {
                            encodedAudio = audioModule.encodedAudio;
                            // Also set globally for consistency
                            if (typeof window !== 'undefined') {
                                window.encodedAudio = audioModule.encodedAudio;
                            }
                            console.log('[BackgroundMusic] Audio files loaded via ES module');
                        }
                    })
                    .catch(error => {
                        console.warn('[BackgroundMusic] ES module import failed, will retry:', error);
                    });
            }
            
            if (attempts < maxAttempts && !encodedAudio) {
                setTimeout(checkForAudio, 100);
                return false;
            }
            
            if (!encodedAudio) {
                console.error('[BackgroundMusic] Failed to load audio files after', attempts, 'attempts');
            }
            return true;
        };
        
        checkForAudio();
    }
    
    /**
     * Get the music key for a given city
     */
    getMusicKeyForCity(city) {
        return cityMusicMap[city] || 'Western'; // Default to Western if city not found
    }
    
    /**
     * Fade out current audio
     */
    fadeOut(audio, callback) {
        if (!audio) {
            if (callback) callback();
            return;
        }
        
        const startVolume = audio.volume;
        const startTime = Date.now();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);
            
            audio.volume = startVolume * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                audio.pause();
                audio.currentTime = 0;
                if (callback) callback();
            }
        };
        
        fade();
    }
    
    /**
     * Fade in new audio
     */
    fadeIn(audio) {
        if (!audio) return;
        
        // Only play if user has interacted and audio is enabled
        if (!this.userInteracted || !this.enabled) {
            if (!this.userInteracted) {
                console.log('[BackgroundMusic] Waiting for user interaction before playing audio');
            }
            return;
        }
        
        audio.volume = 0;
        audio.play().catch(error => {
            // If autoplay is still blocked, mark as not interacted and wait
            if (error.name === 'NotAllowedError') {
                console.log('[BackgroundMusic] Autoplay blocked - waiting for user interaction');
                this.userInteracted = false;
                this.setupUserInteractionListener();
            } else {
                console.error('[BackgroundMusic] Error playing audio:', error);
            }
        });
        
        const startTime = Date.now();
        const targetVolume = this.enabled ? this.volume : 0;
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);
            
            audio.volume = progress * targetVolume;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        fade();
    }
    
    /**
     * Change music for a new location
     */
    changeMusicForLocation(city) {
        // If audio is disabled, don't change music
        if (!this.enabled) {
            return;
        }
        
        // If user hasn't interacted yet, don't change music
        if (!this.userInteracted) {
            this.pendingStart = city;
            return;
        }
        
        // Clear any pending change
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        const newMusicKey = this.getMusicKeyForCity(city);
        
        // If it's the same music, don't change
        if (newMusicKey === this.currentMusicKey && this.currentAudio) {
            return;
        }
        
        // Set timeout to change music after delay
        this.changeTimeout = setTimeout(() => {
            this.changeTimeout = null;
            this._performMusicChange(newMusicKey);
        }, this.changeDelay);
    }
    
    /**
     * Actually perform the music change
     */
    _performMusicChange(newMusicKey) {
        if (!encodedAudio || !encodedAudio[newMusicKey]) {
            console.warn(`[BackgroundMusic] Music key "${newMusicKey}" not found in encoded audio`);
            return;
        }
        
        const oldAudio = this.currentAudio;
        const oldMusicKey = this.currentMusicKey;
        
        // Create new audio element
        const newAudio = new Audio(encodedAudio[newMusicKey]);
        newAudio.volume = 0;
        newAudio.preload = 'auto'; // Preload for smoother playback
        
        // Disable native loop attribute - handle looping manually for seamless playback
        // The native loop can cause gaps, so we'll restart manually
        newAudio.loop = false;
        
        // Set up seamless looping to prevent gaps
        // Restart immediately when audio ends for continuous playback
        const endedHandler = () => {
            if (this.currentAudio === newAudio && this.enabled) {
                // Restart immediately for seamless loop
                newAudio.currentTime = 0;
                newAudio.play().catch(error => {
                    console.error('[BackgroundMusic] Error restarting loop:', error);
                });
            }
        };
        
        newAudio.addEventListener('ended', endedHandler);
        
        // Also use timeupdate to restart slightly before the end for even smoother looping
        // This prevents any gap that might occur at the very end
        const loopHandler = () => {
            if (newAudio.duration && newAudio.currentTime > 0) {
                const timeRemaining = newAudio.duration - newAudio.currentTime;
                // Restart when very close to end (0.02 seconds) for seamless transition
                if (timeRemaining < 0.02 && timeRemaining > 0) {
                    newAudio.currentTime = 0;
                }
            }
        };
        
        newAudio.addEventListener('timeupdate', loopHandler);
        
        // Store handlers for cleanup
        newAudio._loopHandler = loopHandler;
        newAudio._endedHandler = endedHandler;
        
        // Fade out old audio, then fade in new audio
        this.fadeOut(oldAudio, () => {
            // Clean up old audio
            if (oldAudio) {
                // Remove event listeners before cleaning up
                if (oldAudio._loopHandler) {
                    oldAudio.removeEventListener('timeupdate', oldAudio._loopHandler);
                }
                if (oldAudio._endedHandler) {
                    oldAudio.removeEventListener('ended', oldAudio._endedHandler);
                }
                oldAudio.src = '';
                oldAudio.load();
            }
            
            // Set new audio
            this.currentAudio = newAudio;
            this.currentMusicKey = newMusicKey;
            
            // Fade in new audio
            this.fadeIn(newAudio);
            
            console.log(`[BackgroundMusic] Changed music from "${oldMusicKey || 'none'}" to "${newMusicKey}"`);
        });
    }
    
    /**
     * Start playing music for the initial location
     */
    startMusicForLocation(city) {
        // If audio is disabled, don't start
        if (!this.enabled) {
            return;
        }
        
        if (!encodedAudio) {
            // Wait a bit and try again if audio isn't loaded yet (max 5 seconds)
            const maxAttempts = 50;
            let attempts = 0;
            const tryStart = () => {
                attempts++;
                if (encodedAudio) {
                    // Check if user has interacted
                    if (!this.userInteracted) {
                        this.pendingStart = city;
                        console.log('[BackgroundMusic] Music will start after user interaction');
                        return;
                    }
                    const musicKey = this.getMusicKeyForCity(city);
                    this._performMusicChange(musicKey);
                } else if (attempts < maxAttempts) {
                    setTimeout(tryStart, 100);
                } else {
                    console.warn('[BackgroundMusic] Could not start music - audio files not loaded');
                }
            };
            tryStart();
            return;
        }
        
        // Check if user has interacted before starting
        if (!this.userInteracted) {
            this.pendingStart = city;
            console.log('[BackgroundMusic] Music will start after user interaction');
            return;
        }
        
        const musicKey = this.getMusicKeyForCity(city);
        this._performMusicChange(musicKey);
    }
    
    /**
     * Stop all music
     */
    stop() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        if (this.currentAudio) {
            this.fadeOut(this.currentAudio, () => {
                if (this.currentAudio) {
                    this.currentAudio.src = '';
                    this.currentAudio.load();
                }
                this.currentAudio = null;
                this.currentMusicKey = null;
            });
        }
    }
    
    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio && this.enabled) {
            this.currentAudio.volume = this.volume;
        }
    }
    
    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            // Turn on - resume current music if it exists
            if (this.currentAudio) {
                this.currentAudio.volume = this.volume;
                this.currentAudio.play().catch(error => {
                    console.error('[BackgroundMusic] Error resuming audio:', error);
                });
            } else if (this.pendingStart) {
                // Start pending music
                const city = this.pendingStart;
                this.pendingStart = null;
                this.startMusicForLocation(city);
            }
        } else {
            // Turn off - mute current audio
            if (this.currentAudio) {
                this.currentAudio.volume = 0;
                this.currentAudio.pause();
            }
        }
        
        this.updateToggleUI();
        return this.enabled;
    }
    
    /**
     * Update the toggle button UI
     */
    updateToggleUI() {
        const toggle = document.getElementById('audio-toggle');
        if (toggle) {
            const indicator = toggle.querySelector('.audio-indicator');
            const label = toggle.querySelector('.audio-label');
            
            if (this.enabled) {
                indicator.classList.add('on');
                indicator.classList.remove('off');
                if (label) label.textContent = 'ON';
            } else {
                indicator.classList.add('off');
                indicator.classList.remove('on');
                if (label) label.textContent = 'OFF';
            }
        }
    }
}

// Create global instance
const backgroundMusic = new BackgroundMusicManager();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.backgroundMusic = backgroundMusic;
}
