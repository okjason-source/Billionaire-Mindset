// 16-bit style mascot sprites generator
// This creates animated pixel art mascots

(function() {
    'use strict';
    
    // Create canvas helper
    function createSpriteCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas, ctx };
    }
    
    // Draw pixel helper
    function drawPixel(ctx, x, y, color, size = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);
    }
    
    // Money Mascot - Green dollar bill with arms, legs, walking animation
    function createMoneyMascotFrame(frameNum) {
        const { canvas, ctx } = createSpriteCanvas(32, 48); // Taller canvas
        const green = '#00FF00';
        const darkGreen = '#00AA00';
        const moneyGreen = '#228B22'; // Dollar bill green
        const black = '#000000';
        const white = '#FFFFFF';
        
        // Body - tall rectangle like a dollar bill
        ctx.fillStyle = moneyGreen;
        ctx.fillRect(6, 2, 20, 36);
        
        // Border/edge of bill
        ctx.fillStyle = darkGreen;
        ctx.fillRect(6, 2, 20, 2); // Top border
        ctx.fillRect(6, 36, 20, 2); // Bottom border
        ctx.fillRect(6, 2, 2, 36); // Left border
        ctx.fillRect(24, 2, 2, 36); // Right border
        
        // Large dollar sign in center
        ctx.fillStyle = white;
        // Vertical line of $
        ctx.fillRect(14, 8, 4, 20);
        // Top curve of $
        ctx.fillRect(12, 10, 2, 2);
        ctx.fillRect(18, 10, 2, 2);
        ctx.fillRect(11, 11, 1, 1);
        ctx.fillRect(19, 11, 1, 1);
        // Middle horizontal line
        ctx.fillRect(12, 17, 8, 2);
        // Bottom curve of $
        ctx.fillRect(12, 24, 2, 2);
        ctx.fillRect(18, 24, 2, 2);
        ctx.fillRect(11, 25, 1, 1);
        ctx.fillRect(19, 25, 1, 1);
        
        // "100" text at top (like a dollar bill)
        ctx.fillStyle = white;
        ctx.fillRect(9, 4, 2, 3); // 1
        ctx.fillRect(12, 4, 2, 3); // 0
        ctx.fillRect(15, 4, 2, 3); // 0
        
        // Big smiley face!
        ctx.fillStyle = white;
        // Big eyes (circular)
        ctx.beginPath();
        ctx.arc(11, 14, 3, 0, 2 * Math.PI); // Left eye
        ctx.fill();
        ctx.beginPath();
        ctx.arc(21, 14, 3, 0, 2 * Math.PI); // Right eye
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = black;
        ctx.beginPath();
        ctx.arc(11, 14, 1.5, 0, 2 * Math.PI); // Left pupil
        ctx.fill();
        ctx.beginPath();
        ctx.arc(21, 14, 1.5, 0, 2 * Math.PI); // Right pupil
        ctx.fill();
        
        // Big smile (curved)
        ctx.strokeStyle = white;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 20, 6, 0.2, Math.PI - 0.2, false); // Smile arc
        ctx.stroke();
        // Fill in the smile a bit
        ctx.fillStyle = white;
        ctx.fillRect(12, 24, 8, 2);
        ctx.fillRect(11, 25, 10, 1);
        
        // Decorative lines (like dollar bill patterns) - below the face
        ctx.fillStyle = darkGreen;
        for (let i = 0; i < 2; i++) {
            ctx.fillRect(8, 28 + (i * 6), 16, 1);
        }
        
        // Arms (animate based on frame)
        const armOffset = frameNum % 2 === 0 ? 0 : 2;
        ctx.fillStyle = moneyGreen;
        // Left arm
        ctx.fillRect(2 + armOffset, 10, 4, 10);
        // Right arm (fist bump position)
        ctx.fillRect(26 - armOffset, 10, 4, 10);
        // Fist (right arm) - animated
        if (frameNum % 4 < 2) {
            ctx.fillRect(30 - armOffset, 12, 4, 4);
        }
        
        // Legs (walking animation)
        const legOffset = frameNum % 2 === 0 ? 0 : 2;
        ctx.fillStyle = moneyGreen;
        // Left leg
        ctx.fillRect(10 - legOffset, 38, 4, 10);
        // Right leg
        ctx.fillRect(18 + legOffset, 38, 4, 10);
        
        // Feet
        ctx.fillRect(8 - legOffset, 46, 2, 2);
        ctx.fillRect(22 + legOffset, 46, 2, 2);
        
        return canvas.toDataURL('image/png');
    }
    
    // Ostrich - Black body, off-white neck/head/legs, gold chain
    function createOstrichFrame(frameNum) {
        const { canvas, ctx } = createSpriteCanvas(48, 64);
        const black = '#000000';
        const offWhite = '#F5F5DC';
        const gold = '#FFD700';
        const eyeWhite = '#FFFFFF';
        const beak = '#FFA500';
        
        // Body (black, oval) - positioned higher
        ctx.fillStyle = black;
        ctx.beginPath();
        ctx.ellipse(24, 32, 10, 16, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Neck (off-white, animated with slight bend)
        const neckBend = Math.sin(frameNum * 0.3) * 2;
        ctx.fillStyle = offWhite;
        // Draw neck as a thicker rectangle
        ctx.fillRect(22 + neckBend - 1, 12, 3, 20);
        
        // Head (off-white, round)
        const headX = 24 + neckBend;
        ctx.beginPath();
        ctx.arc(headX, 6, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes (larger and more visible)
        ctx.fillStyle = eyeWhite;
        ctx.fillRect(headX - 3, 4, 2, 2);
        ctx.fillRect(headX + 1, 4, 2, 2);
        ctx.fillStyle = black;
        ctx.fillRect(headX - 2, 4, 1, 1);
        ctx.fillRect(headX + 2, 4, 1, 1);
        
        // Beak (more prominent)
        ctx.fillStyle = beak;
        ctx.fillRect(headX - 1, 8, 2, 3);
        ctx.fillRect(headX - 2, 9, 4, 2);
        
        // Gold chain around neck (more visible and prominent)
        ctx.fillStyle = gold;
        const chainY = 20; // Position on neck
        const chainX = 24 + neckBend;
        
        // Draw chain links as connected circles/rectangles
        // Left side of chain
        for (let i = 0; i < 3; i++) {
            const y = chainY + (i * 4);
            ctx.fillRect(chainX - 5, y, 3, 2);
            ctx.fillRect(chainX - 6, y + 1, 5, 1);
        }
        // Right side of chain
        for (let i = 0; i < 3; i++) {
            const y = chainY + (i * 4);
            ctx.fillRect(chainX + 2, y, 3, 2);
            ctx.fillRect(chainX + 1, y + 1, 5, 1);
        }
        // Center chain link connecting both sides
        ctx.fillRect(chainX - 1, chainY + 4, 2, 2);
        ctx.fillRect(chainX - 2, chainY + 5, 4, 1);
        
        // Legs (off-white, walking animation)
        const legOffset = frameNum % 2 === 0 ? 0 : 2;
        ctx.fillStyle = offWhite;
        // Left leg (thicker)
        ctx.fillRect(18 - legOffset, 32, 3, 30);
        // Right leg
        ctx.fillRect(27 + legOffset, 32, 3, 30);
        
        // Feet (larger and more visible)
        ctx.fillStyle = beak;
        // Left foot
        ctx.fillRect(16 - legOffset, 60, 5, 3);
        ctx.fillRect(15 - legOffset, 61, 7, 2);
        // Right foot
        ctx.fillRect(27 + legOffset, 60, 5, 3);
        ctx.fillRect(26 + legOffset, 61, 7, 2);
        
        return canvas.toDataURL('image/png');
    }
    
    // Generate all frames asynchronously to not block other scripts
    console.log('[Mascots] Generating sprite frames...');
    const moneyMascotFrames = [];
    const ostrichFrames = [];
    
    // Defer frame generation to not block page load
    function generateFrames() {
        try {
            for (let i = 0; i < 4; i++) {
                moneyMascotFrames.push(createMoneyMascotFrame(i));
                ostrichFrames.push(createOstrichFrame(i));
            }
            console.log('[Mascots] Frames generated successfully', {
                money: moneyMascotFrames.length,
                ostrich: ostrichFrames.length
            });
            
            // Export to window
            window.moneyMascotFrames = moneyMascotFrames;
            window.ostrichFrames = ostrichFrames;
            
            // Initialize mascots after frames are ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(initMascots, 100);
                });
            } else {
                setTimeout(initMascots, 100);
            }
        } catch (error) {
            console.error('[Mascots] Error generating frames:', error);
        }
    }
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
        requestIdleCallback(generateFrames, { timeout: 1000 });
    } else {
        setTimeout(generateFrames, 0);
    }
    
    // Initialize mascot animations when DOM is ready (non-blocking)
    function initMascots() {
        // Use requestAnimationFrame to ensure non-blocking
        requestAnimationFrame(function() {
            const inventoryDiv = document.getElementById('inventory');
            if (!inventoryDiv) {
                console.log('[Mascots] Waiting for inventory div...');
                setTimeout(initMascots, 100);
                return;
            }
            
            // Check if mascots already exist
            if (document.getElementById('money-mascot') || document.getElementById('ostrich-mascot')) {
                console.log('[Mascots] Already initialized');
                return; // Already initialized
            }
            
            console.log('[Mascots] Initializing...', {
                moneyFrames: moneyMascotFrames.length,
                ostrichFrames: ostrichFrames.length
            });
            
            initMascotsInternal();
        });
    }
    
    function initMascotsInternal() {
        const inventoryDiv = document.getElementById('inventory');
        if (!inventoryDiv) return;
        
        // Create mascot containers
        const leftMascot = document.createElement('div');
        leftMascot.className = 'mascot-container mascot-left';
        leftMascot.id = 'money-mascot';
        
        const rightMascot = document.createElement('div');
        rightMascot.className = 'mascot-container mascot-right';
        rightMascot.id = 'ostrich-mascot';
        
        // Create sprite images
        const moneyImg = document.createElement('img');
        moneyImg.className = 'mascot-sprite';
        moneyImg.src = moneyMascotFrames[0];
        moneyImg.alt = 'Money Mascot';
        moneyImg.onerror = function() {
            console.error('[Mascots] Error loading money mascot sprite');
        };
        moneyImg.onload = function() {
            console.log('[Mascots] Money mascot sprite loaded');
        };
        
        const ostrichImg = document.createElement('img');
        ostrichImg.className = 'mascot-sprite';
        ostrichImg.src = ostrichFrames[0];
        ostrichImg.alt = 'Ostrich';
        ostrichImg.onerror = function() {
            console.error('[Mascots] Error loading ostrich sprite');
        };
        ostrichImg.onload = function() {
            console.log('[Mascots] Ostrich sprite loaded');
        };
        
        leftMascot.appendChild(moneyImg);
        rightMascot.appendChild(ostrichImg);
        
        // Insert mascots into #inventory container (on top of the grey box)
        inventoryDiv.appendChild(leftMascot);
        inventoryDiv.appendChild(rightMascot);
        
        console.log('[Mascots] Mascots added to DOM', {
            inventoryDiv: inventoryDiv,
            leftMascot: leftMascot,
            rightMascot: rightMascot
        });
        
        // Animate sprites (use requestAnimationFrame for smoother, non-blocking animation)
        let currentFrame = 0;
        let lastFrameTime = 0;
        const frameInterval = 200; // 200ms per frame
        
        function animateMascots(currentTime) {
            if (currentTime - lastFrameTime >= frameInterval) {
                currentFrame = (currentFrame + 1) % 4;
                if (moneyImg && moneyImg.parentNode) {
                    moneyImg.src = moneyMascotFrames[currentFrame];
                }
                if (ostrichImg && ostrichImg.parentNode) {
                    ostrichImg.src = ostrichFrames[currentFrame];
                }
                lastFrameTime = currentTime;
            }
            requestAnimationFrame(animateMascots);
        }
        
        requestAnimationFrame(animateMascots);
    }
    
    // Mascots will be initialized after frames are generated (see generateFrames function)
    
    // Re-initialize mascots if they get removed (e.g., by inventory updates)
    // Use a debounced observer to avoid blocking
    let observerTimeout;
    const observer = new MutationObserver(function(mutations) {
        clearTimeout(observerTimeout);
        observerTimeout = setTimeout(function() {
            const inventoryDiv = document.getElementById('inventory');
            if (inventoryDiv && !document.getElementById('money-mascot')) {
                console.log('[Mascots] Detected mascots removed, re-initializing...');
                requestAnimationFrame(initMascots);
            }
        }, 100);
    });
    
    // Start observing after DOM is ready (non-blocking)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            requestAnimationFrame(function() {
                const inventoryDiv = document.getElementById('inventory');
                if (inventoryDiv) {
                    observer.observe(inventoryDiv, { childList: true, subtree: true });
                }
            });
        });
    } else {
        requestAnimationFrame(function() {
            const inventoryDiv = document.getElementById('inventory');
            if (inventoryDiv) {
                observer.observe(inventoryDiv, { childList: true, subtree: true });
            }
        });
    }
})();
