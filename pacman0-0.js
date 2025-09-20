document.addEventListener('DOMContentLoaded', () => {
    // Game Settings
    const CELL_SIZE = 20;
    const BOARD_WIDTH = 28;
    const BOARD_HEIGHT = 31;
    const GAME_SPEED = 150;

    // DOM Elements
    const scoreDisplay = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');
    const canvas = document.getElementById('game-canvas');

    // Scene setup with Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
        -BOARD_WIDTH * CELL_SIZE / 2,
        BOARD_WIDTH * CELL_SIZE / 2,
        BOARD_HEIGHT * CELL_SIZE / 2,
        -BOARD_HEIGHT * CELL_SIZE / 2,
        1,
        1000
    );
    camera.position.z = 500;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    // Game State
    let score = 0;
    let gameInterval = null;
    let pacman, ghosts, dots, walls;
    let nextDirection = 'right';

    // Maze Layout (0 = path, 1 = wall, 2 = dot)
    const mazeLayout = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 1, 1, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1],
        [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
        [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    // Helper to create a mesh and add to scene
    const createMesh = (geometry, material, x, y) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            x * CELL_SIZE + CELL_SIZE / 2 - (BOARD_WIDTH * CELL_SIZE / 2),
            -y * CELL_SIZE - CELL_SIZE / 2 + (BOARD_HEIGHT * CELL_SIZE / 2),
            0
        );
        scene.add(mesh);
        return mesh;
    };

    // Initialize game
    function initGame() {
        if (gameInterval) clearInterval(gameInterval);
        
        // Remove all meshes from the scene
        while(scene.children.length > 0){
            scene.remove(scene.children[0]);
        }
        
        score = 0;
        updateScore();
        nextDirection = 'right';

        walls = [];
        dots = [];

        // Geometries for objects
        const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, 1);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const dotGeometry = new THREE.SphereGeometry(CELL_SIZE / 10, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pacmanGeometry = new THREE.SphereGeometry(CELL_SIZE / 2, 32, 32);
        const pacmanMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const ghostGeometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, 1);

        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (mazeLayout[y][x] === 1) {
                    const wallMesh = createMesh(wallGeometry, wallMaterial, x, y);
                    walls.push({ x, y, mesh: wallMesh });
                } else if (mazeLayout[y][x] === 2) {
                    const dotMesh = createMesh(dotGeometry, dotMaterial, x, y);
                    dots.push({ x, y, mesh: dotMesh });
                }
            }
        }

        pacman = {
            mesh: createMesh(pacmanGeometry, pacmanMaterial, 14, 23),
            x: 14,
            y: 23,
            direction: 'right'
        };

        ghosts = [
            { x: 13, y: 11, direction: 'up', mesh: createMesh(ghostGeometry, new THREE.MeshBasicMaterial({ color: 0xff6666 }), 13, 11) },
            { x: 14, y: 11, direction: 'down', mesh: createMesh(ghostGeometry, new THREE.MeshBasicMaterial({ color: 0xffb3ff }), 14, 11) },
            { x: 13, y: 12, direction: 'left', mesh: createMesh(ghostGeometry, new THREE.MeshBasicMaterial({ color: 0x80ffff }), 13, 12) },
            { x: 14, y: 12, direction: 'right', mesh: createMesh(ghostGeometry, new THREE.MeshBasicMaterial({ color: 0xffb380 }), 14, 12) }
        ];

        // Animate loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();

        document.removeEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', handleKeyPress);
        startBtn.textContent = 'Restart Game';

        // Inicia o loop do jogo automaticamente ao reiniciar
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }

    // Check if an entity can move in a direction
    const canMove = (x, y, dir) => {
        let newX = x, newY = y;
        switch (dir) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        if (newX < 0) newX = BOARD_WIDTH - 1;
        if (newX >= BOARD_WIDTH) newX = 0;

        return !walls.some(wall => wall.x === newX && wall.y === newY);
    };

    // Main game loop
    const gameLoop = () => {
        movePacman();
        moveGhosts();
        checkCollisions();
        checkWinCondition();
    };

    // Move Pacman
    const movePacman = () => {
        if (canMove(pacman.x, pacman.y, nextDirection)) {
            pacman.direction = nextDirection;
        }

        if (canMove(pacman.x, pacman.y, pacman.direction)) {
            switch (pacman.direction) {
                case 'up': pacman.y--; break;
                case 'down': pacman.y++; break;
                case 'left': pacman.x--; break;
                case 'right': pacman.x++; break;
            }

            if (pacman.x < 0) pacman.x = BOARD_WIDTH - 1;
            if (pacman.x >= BOARD_WIDTH) pacman.x = 0;

            // Update mesh position
            pacman.mesh.position.set(
                pacman.x * CELL_SIZE + CELL_SIZE / 2 - (BOARD_WIDTH * CELL_SIZE / 2),
                -pacman.y * CELL_SIZE - CELL_SIZE / 2 + (BOARD_HEIGHT * CELL_SIZE / 2),
                0
            );

            // Check for dot collision
            const dotEatenIndex = dots.findIndex(d => d.x === pacman.x && d.y === pacman.y);
            if (dotEatenIndex !== -1) {
                const eatenDot = dots.splice(dotEatenIndex, 1)[0];
                scene.remove(eatenDot.mesh);
                updateScore(score + 10);
            }
        }
    };

    // Move Ghosts
    const moveGhosts = () => {
        ghosts.forEach(ghost => {
            if (Math.random() < 0.2 || !canMove(ghost.x, ghost.y, ghost.direction)) {
                const directions = ['up', 'down', 'left', 'right'];
                const possibleDirections = directions.filter(dir => canMove(ghost.x, ghost.y, dir));
                if (possibleDirections.length > 0) {
                    ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                }
            }
            if (canMove(ghost.x, ghost.y, ghost.direction)) {
                switch (ghost.direction) {
                    case 'up': ghost.y--; break;
                    case 'down': ghost.y++; break;
                    case 'left': ghost.x--; break;
                    case 'right': ghost.x++; break;
                }
                // Update mesh position
                ghost.mesh.position.set(
                    ghost.x * CELL_SIZE + CELL_SIZE / 2 - (BOARD_WIDTH * CELL_SIZE / 2),
                    -ghost.y * CELL_SIZE - CELL_SIZE / 2 + (BOARD_HEIGHT * CELL_SIZE / 2),
                    0
                );
            }
        });
    };

    // Check for collisions (Pacman and Ghosts)
    const checkCollisions = () => {
        if (ghosts.some(g => g.x === pacman.x && g.y === pacman.y)) {
            endGame('Game Over');
        }
    };

    // Check win condition
    const checkWinCondition = () => {
        if (dots.length === 0) {
            endGame('You Win!');
        }
    };

    // End game (win or lose)
    const endGame = (message) => {
        clearInterval(gameInterval);
        gameInterval = null;
        const endScreen = document.createElement('div');
        endScreen.className = 'game-message';
        endScreen.innerHTML = `<h2>${message}</h2><p>Score: ${score}</p><button id="restart-btn">Restart</button>`;
        document.body.appendChild(endScreen);
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.body.removeChild(endScreen);
            initGame();
        });
    };

    // Update score
    const updateScore = (newScore = score) => {
        score = newScore;
        scoreDisplay.textContent = score;
    };

    // Handle key press and set next direction
    const handleKeyPress = (e) => {
        const keyMap = { 'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right' };
        if (keyMap[e.key]) {
            nextDirection = keyMap[e.key];
        }
    };

    startBtn.addEventListener('click', () => initGame());

    // Initial setup
    initGame();
});