// Constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 8;
export const MIN_PATH_LENGTH = 35;
export const MAX_PATH_LENGTH = 45;

// pathGeneration.ts
export const generateRandomPath = (): [number, number][] => {
    const path: [number, number][] = [];
    const visited = new Set<string>();
    const directions = [
        [1, 0],  // right
        [0, -1], // up
        [-1, 0], // left
        [0, 1]   // down
    ];

    // Start at bottom-left (0, 7)
    let x = 0;
    let y = BOARD_HEIGHT - 1;
    path.push([x, y]);
    visited.add(`${x},${y}`);

    let pathLength = 0;
    const targetLength = MIN_PATH_LENGTH + Math.floor(Math.random() * (MAX_PATH_LENGTH - MIN_PATH_LENGTH));

    while (pathLength < targetLength) {
        // Shuffle directions for randomness
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        let moved = false;

        for (const [dx, dy] of shuffledDirections) {
            const newX = x + dx;
            const newY = y + dy;
            const key = `${newX},${newY}`;

            // Check boundaries and if already visited
            if (newX >= 0 && newX < BOARD_WIDTH &&
                newY >= 0 && newY < BOARD_HEIGHT &&
                !visited.has(key)) {

                // Prevent creating small loops
                let valid = true;
                for (const [ndx, ndy] of directions) {
                    const neighborX = newX + ndx;
                    const neighborY = newY + ndy;
                    if (neighborX !== x || neighborY !== y) {
                        const neighborKey = `${neighborX},${neighborY}`;
                        if (visited.has(neighborKey)) {
                            valid = false;
                            break;
                        }
                    }
                }

                if (valid) {
                    path.push([newX, newY]);
                    visited.add(key);
                    x = newX;
                    y = newY;
                    pathLength++;
                    moved = true;
                    break;
                }
            }
        }

        // If stuck, backtrack
        if (!moved && path.length > 1) {
            path.pop();
            x = path[path.length - 1][0];
            y = path[path.length - 1][1];
        } else if (!moved) {
            break; // Can't move anywhere
        }
    }

    // Ensure the path reaches the top half of the board
    if (path[path.length - 1][1] > BOARD_HEIGHT / 2) {
        // Try to extend upwards
        let lastX = path[path.length - 1][0];
        let lastY = path[path.length - 1][1];

        while (lastY > 0 && pathLength < MAX_PATH_LENGTH) {
            lastY--;
            path.push([lastX, lastY]);
            pathLength++;
        }
    }

    // Add castle at the end
    path[path.length - 1] = [path[path.length - 1][0], path[path.length - 1][1]];

    // Add 1-3 branches (shorter paths that reconnect)
    const branchCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < branchCount && path.length < MAX_PATH_LENGTH; i++) {
        addBranch(path, visited);
    }

    console.log('Generated path:', path);
    return path;
};

function addBranch(mainPath: [number, number][], visited: Set<string>) {
    if (mainPath.length < 10) return;

    const branchStartIndex = 5 + Math.floor(Math.random() * (mainPath.length - 10));
    const [startX, startY] = mainPath[branchStartIndex];
    const directions = [
        [1, 0], [0, -1], [-1, 0], [0, 1]
    ];

    let x = startX;
    let y = startY;
    const branch: [number, number][] = [];
    const branchVisited = new Set<string>();
    let branchLength = 0;
    const maxBranchLength = 5 + Math.floor(Math.random() * 10);

    while (branchLength < maxBranchLength) {
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        let moved = false;

        for (const [dx, dy] of shuffledDirections) {
            const newX = x + dx;
            const newY = y + dy;
            const key = `${newX},${newY}`;

            if (newX >= 0 && newX < BOARD_WIDTH &&
                newY >= 0 && newY < BOARD_HEIGHT &&
                !visited.has(key) && !branchVisited.has(key)) {

                branch.push([newX, newY]);
                branchVisited.add(key);
                x = newX;
                y = newY;
                branchLength++;
                moved = true;
                break;
            }
        }

        if (!moved) break;
    }

    // Reconnect to main path if possible
    if (branch.length > 3) {
        for (let i = branchStartIndex + 5; i < mainPath.length; i++) {
            const [mainX, mainY] = mainPath[i];
            const [lastX, lastY] = branch[branch.length - 1];

            if (Math.abs(mainX - lastX) + Math.abs(mainY - lastY) === 1) {
                branch.push([mainX, mainY]);
                break;
            }
        }

        // Insert branch into main path
        mainPath.splice(branchStartIndex + 1, 0, ...branch);
    }
}
