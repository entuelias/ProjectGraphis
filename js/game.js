class Game {
    constructor() {
        // Initialize background music
        this.backgroundMusic = new Audio('assets/sound/background.mp3');
        this.backgroundMusic.loop = true; // Make the music loop
        this.backgroundMusic.volume = 0.5; // Set volume to 50%
        this.setupLandingPage();
        // Start playing when the page loads
        this.backgroundMusic.play();
    }

    setupLandingPage() {
        const weapons = document.querySelectorAll('.weapon');
        let selectedWeapon = 'pistol';

        weapons.forEach(weapon => {
            weapon.addEventListener('click', () => {
                weapons.forEach(w => w.classList.remove('selected'));
                weapon.classList.add('selected');
                selectedWeapon = weapon.dataset.weapon;
            });
        });

        document.getElementById('start-game').addEventListener('click', () => {
            // Fade out the background music
            const fadeOut = setInterval(() => {
                if (this.backgroundMusic.volume > 0.1) {
                    this.backgroundMusic.volume -= 0.1;
                } else {
                    clearInterval(fadeOut);
                    this.backgroundMusic.pause();
                    this.backgroundMusic.currentTime = 0;
                }
            }, 100);

            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            this.startGame(selectedWeapon);
        });
    }

    startGame(weaponType) {
        window.game = this;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.score = 0;
        this.targets = [];
        this.gameTime = 30;
        this.isGameOver = false;
        
        // Set target score based on weapon type
        this.targetScore = {
            'pistol': 300,
            'rifle': 600,
            'shotgun': 800
        }[weaponType];

        // Create UI container with improved styling
        const uiContainer = document.createElement('div');
        uiContainer.id = 'ui-container';
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '20px';
        uiContainer.style.width = '100%';
        uiContainer.style.display = 'flex';
        uiContainer.style.justifyContent = 'center';
        uiContainer.style.alignItems = 'center';
        uiContainer.style.gap = '50px';
        uiContainer.style.color = 'white';
        uiContainer.style.fontSize = '24px';
        uiContainer.style.textShadow = '2px 2px 2px black';
        uiContainer.style.zIndex = '1000';
        document.getElementById('game-container').appendChild(uiContainer);

        

        // Create score display with weapon-specific target
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-container';
        scoreDisplay.innerHTML = `Score: <span id="score-value">0</span>/${this.targetScore}`;
        uiContainer.appendChild(scoreDisplay);

        // Add weapon-specific instructions
        const instructions = document.createElement('div');
        instructions.style.position = 'fixed';
        instructions.style.bottom = '20px';
        instructions.style.left = '50%';
        instructions.style.transform = 'translateX(-50%)';
        instructions.style.color = 'white';
        instructions.style.textAlign = 'center';
        instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        instructions.style.padding = '10px';
        instructions.style.borderRadius = '5px';
        instructions.innerHTML = `
            <div style="margin-bottom: 10px;">Selected Weapon: ${weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}</div>
            <div>Target Score: ${this.targetScore} points</div>
            <div>Time Limit: ${this.gameTime} seconds</div>
            <div style="margin-top: 10px;">Hit targets to score points!</div>
        `;
        document.getElementById('game-container').appendChild(instructions);
        // Create timer display (now part of the ui-container)
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'timer';
        this.timerDisplay.textContent = `Time: ${this.gameTime}s`;
        uiContainer.appendChild(this.timerDisplay);

        // Remove the duplicate timer display code
        // Start timer
        this.startTimer();

        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(0, 2, 0);

        // Setup lighting
        this.setupLighting();

        // Setup controls
        this.controls = new Controls(this.camera, this.renderer.domElement);

        // Setup environment
        this.environment = new Environment(this.scene);
        this.targets = this.environment.targets;

        // Setup weapon system
        this.weapons = new Weapons(this.camera, this.scene);
        this.weapons.setWeapon(weaponType);

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('click', () => {
            if (this.controls.pointerLock.isLocked) {
                this.weapons.shoot(this.targets);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyR') {
                this.weapons.reload();
            }
        });

        // Start game loop
        this.animate();
    }

    startTimer() {
        const timer = setInterval(() => {
            if (this.isGameOver) {
                clearInterval(timer);
                return;
            }

            this.gameTime--;
            this.timerDisplay.textContent = `Time: ${this.gameTime}s`;

            if (this.gameTime <= 0) {
                this.endGame(false);
                clearInterval(timer);
            }
        }, 1000);
    }

    updateScore(points) {
        this.score += points;
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = this.score;
            if (this.score >= this.targetScore) {
                this.endGame(true);
            }
        }
    }

    endGame(isWin) {
        this.isGameOver = true;
        this.controls.pointerLock.unlock();

        // Create game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '50%';
        gameOverScreen.style.left = '50%';
        gameOverScreen.style.transform = 'translate(-50%, -50%)';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 1.5)';
        gameOverScreen.style.padding = '20px';
        gameOverScreen.style.borderRadius = '10px';
        gameOverScreen.style.color = 'white';
        gameOverScreen.style.textAlign = 'center';

        const message = isWin ? 
            `Congratulations! You won!\nFinal Score: ${this.score}` :
            `Game Over!\nFinal Score: ${this.score}`;

        gameOverScreen.innerHTML = `
            <h2>${isWin ? 'Victory!' : 'Game Over!'}</h2>
            <p>${message}</p>
            <p>Time Remaining: ${this.gameTime}s</p>
            <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">Play Again</button>
        `;

        document.getElementById('game-container').appendChild(gameOverScreen);
    }

    animate() {
        if (!this.isGameOver) {
            requestAnimationFrame(() => this.animate());
            this.controls.update();
            this.environment.update();
            // Update particle effects
            if (this.weapons) {
                this.weapons.updateParticles();
            }
            
            this.renderer.render(this.scene, this.camera);
            // Remove this duplicate line
            // requestAnimationFrame(() => this.animate());
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 10, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const game = new Game();
});