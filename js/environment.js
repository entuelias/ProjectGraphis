class Environment {
    constructor(scene) {
        this.scene = scene;
        this.targets = [];
        this.init();
    }

    init() {
        // Create skybox with farm theme
        const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const skyboxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87ceeb, // Light blue sky color
            side: THREE.BackSide,
            
            transparent: false,
            opacity: 1.0,
            fog: false 
        });
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);

        // Create floor with grass texture
        const floorGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const floorTexture = new THREE.TextureLoader().load('assets/grass.jpg');
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(20, 20); // More grass pattern repetition
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            map: floorTexture,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add light fog for farm atmosphere
        this.scene.fog = new THREE.Fog(0xE6E6FA, 50, 150);

        // Create walls and other environment elements
        this.createWalls();
        this.createTargets();
        this.createObstacles();
        this.createDecorations();
    }

    createWalls() {
        const wallGeometry = new THREE.BoxGeometry(100, 20, 2);
        const wallTexture = new THREE.TextureLoader().load('assets/farmwall.jpg');
        wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(5, 2);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            map: wallTexture,
            roughness: 0.7,
            metalness: 0.1
        });

        // Back wall
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, 10, -50);
        this.scene.add(backWall);

        // Front wall
        const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
        frontWall.position.set(0, 10, 50);
        this.scene.add(frontWall);

        // Side walls
        const sideWallGeometry = new THREE.BoxGeometry(2, 20, 100);
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.position.set(-50, 10, 0);
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        rightWall.position.set(50, 10, 0);
        this.scene.add(rightWall);
    }

    createTargets() {
        // Increase target size and add glowing effect
        const targetGeometry = new THREE.BoxGeometry(3, 3, 0.5);
        const targetMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            metalness: 0.7,
            roughness: 0.3
        });
    
        for (let i = 0; i < 10; i++) {
            const target = new THREE.Mesh(targetGeometry, targetMaterial);
            
            // Add outline for better visibility
            const outlineGeometry = new THREE.BoxGeometry(3.2, 3.2, 0.6);
            const outlineMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFD700,
                side: THREE.BackSide
            });
            const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
            target.add(outline);
    
            target.position.set(
                Math.random() * 80 - 40,
                Math.random() * 10 + 2,
                Math.random() * 80 - 40
            );
            target.isTarget = true;
            target.hit = () => {
                target.visible = false;
                setTimeout(() => {
                    target.visible = true;
                    target.position.set(
                        Math.random() * 80 - 40,
                        Math.random() * 10 + 2,
                        Math.random() * 80 - 40
                    );
                }, 2000);
            };
            this.targets.push(target);
            this.scene.add(target);
        }
    }

    createObstacles() {
        const boxGeometry = new THREE.BoxGeometry(4, 4, 4);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

        for (let i = 0; i < 10; i++) {
            const obstacle = new THREE.Mesh(boxGeometry, boxMaterial);
            obstacle.position.set(
                Math.random() * 80 - 40,
                2,
                Math.random() * 80 - 40
            );
            obstacle.castShadow = true;
            obstacle.receiveShadow = true;
            this.scene.add(obstacle);
        }
    }

    createDecorations() {
        // Add some crates and barrels
        const crateGeometry = new THREE.BoxGeometry(2, 2, 2);
        const crateTexture = new THREE.TextureLoader().load('assets/crate.jpg');
        const crateMaterial = new THREE.MeshStandardMaterial({ map: crateTexture });

        for (let i = 0; i < 15; i++) {
            const crate = new THREE.Mesh(crateGeometry, crateMaterial);
            crate.position.set(
                Math.random() * 80 - 40,
                1,
                Math.random() * 80 - 40
            );
            crate.castShadow = true;
            crate.receiveShadow = true;
            this.scene.add(crate);
        }

        // Add some vegetation
        const treeGeometry = new THREE.CylinderGeometry(0, 4, 10, 4);
        const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });

        for (let i = 0; i < 10; i++) {
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            tree.position.set(
                Math.random() * 90 - 45,
                5,
                Math.random() * 90 - 45
            );
            tree.castShadow = true;
            this.scene.add(tree);
        }
    }

    update() {
        // Rotate targets
        this.targets.forEach(target => {
            if (target.visible) {
                target.rotation.y += 0.01;
            }
        });
    }
}