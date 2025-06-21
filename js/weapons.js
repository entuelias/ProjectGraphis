class Weapons {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.currentWeapon = 'pistol';
        this.ammo = 30;
        this.maxAmmo = 30;
        this.reloading = false;
        
        // Weapon configurations
        this.weapons = {
            pistol: {
                damage: 25,
                fireRate: 400,
                ammo: 30,
                reloadTime: 1000,
                sound: new Audio('assets/sound/pistol.mp3')
            },
            rifle: {
                damage: 40,
                fireRate: 600,
                ammo: 25,
                reloadTime: 2000,
                sound: new Audio('assets/sound/rifle.mp3')
            },
            shotgun: {
                damage: 100,
                fireRate: 800,
                ammo: 8,
                reloadTime: 2500,
                sound: new Audio('assets/sound/shotgun.mp3')
            }
        };

        this.lastShot = 0;
        
        // Preload and setup sounds
        this.loadSounds();
        this.particleSystems = [];
        
        // Add particle texture loader
        this.textureLoader = new THREE.TextureLoader();
        this.sparkTexture = this.textureLoader.load('assets/spark.png');
    }

    setWeapon(type) {
        this.currentWeapon = type;
        this.ammo = this.weapons[type].ammo;
        this.maxAmmo = this.weapons[type].ammo;
        this.updateAmmoDisplay();
    }

    createImpactEffect(position) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color = new THREE.Color();
        color.setHSL(0.1, 1, 0.6); // Orange-yellow color

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            color.toArray(colors, i * 3);
            sizes[i] = Math.random() * 2 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1,
            map: this.sparkTexture,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true,
            vertexColors: true
        });

        const particles = new THREE.Points(geometry, material);
        particles.time = 0;
        particles.velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );
            particles.velocities.push(velocity);
        }

        this.scene.add(particles);
        this.particleSystems.push(particles);

        setTimeout(() => {
            this.scene.remove(particles);
            const index = this.particleSystems.indexOf(particles);
            if (index > -1) {
                this.particleSystems.splice(index, 1);
            }
        }, 1000);
    }

    updateParticles() {
        const delta = 0.016; // Assuming 60fps

        for (let particles of this.particleSystems) {
            const positions = particles.geometry.attributes.position.array;
            const sizes = particles.geometry.attributes.size.array;

            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3] += particles.velocities[i].x * delta;
                positions[i * 3 + 1] += particles.velocities[i].y * delta;
                positions[i * 3 + 2] += particles.velocities[i].z * delta;

                particles.velocities[i].y -= 5 * delta; // Gravity effect
                sizes[i] *= 0.96; // Particle shrinking
            }

            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.size.needsUpdate = true;
        }
    }

    shoot(targets) {
        if (this.reloading || this.ammo <= 0) {
            if (this.ammo <= 0) this.reload();
            return;
        }

        const now = Date.now();
        if (now - this.lastShot < this.weapons[this.currentWeapon].fireRate) return;

        this.weapons[this.currentWeapon].sound.currentTime = 0;
        this.weapons[this.currentWeapon].sound.play();

        this.raycaster.setFromCamera(new THREE.Vector2(), this.camera);
        const intersects = this.raycaster.intersectObjects(targets);

        if (intersects.length > 0) {
            const target = intersects[0].object;
            if (target.isTarget) {
                target.hit();
                // Create impact effect at hit position
                this.createImpactEffect(intersects[0].point);
                const score = this.weapons[this.currentWeapon].damage;
                window.game.updateScore(score);
            }
        }

        this.ammo--;
        this.updateAmmoDisplay();
        this.lastShot = now;
    }

    reload() {
        if (this.reloading || this.ammo === this.maxAmmo) return;

        this.reloading = true;
        setTimeout(() => {
            this.ammo = this.maxAmmo;
            this.reloading = false;
            this.updateAmmoDisplay();
            new Audio('assets/sound/reload.mp3').play();
        }, this.weapons[this.currentWeapon].reloadTime);
    }

    updateAmmoDisplay() {
        document.getElementById('ammo-value').textContent = this.ammo;
    }

    loadSounds() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this
    }
}