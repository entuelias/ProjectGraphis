class Controls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.mouseSensitivity = 1.0; // Add mouse sensitivity control
        this.moveSpeed = 400.0; // Add movement speed control
        this.init();
    }

    init() {
        this.pointerLock = new THREE.PointerLockControls(this.camera, this.domElement);

        // Setup event listeners
        this.domElement.addEventListener('click', () => {
            if (!this.pointerLock.isLocked) {
                this.pointerLock.lock();
                document.getElementById('instructions').style.display = 'none';
            }
        });

        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));

        this.pointerLock.addEventListener('lock', () => {
            document.getElementById('instructions').style.display = 'none';
        });

        this.pointerLock.addEventListener('unlock', () => {
            document.getElementById('instructions').style.display = 'block';
        });
    }

    update() {
        if (this.pointerLock.isLocked) {
            const delta = 0.016; // Fixed time step
            
            // Apply damping
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            // Calculate movement direction
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            // Apply movement
            if (this.moveForward || this.moveBackward) {
                this.velocity.z -= this.direction.z * this.moveSpeed * delta;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * this.moveSpeed * delta;
            }

            // Apply movement to camera
            this.pointerLock.moveRight(-this.velocity.x * delta);
            this.pointerLock.moveForward(-this.velocity.z * delta);
        }
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }
}