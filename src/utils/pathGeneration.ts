// Constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 8;
export const MIN_PATH_LENGTH = 25;
export const MAX_PATH_LENGTH = 35;

export const generateRandomPath = (): [number, number][] => {
    const path: [number, number][] = [];
    const visited = new Set<string>();
    const directions: [number, number][] = [
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

    const targetLength = MIN_PATH_LENGTH + Math.floor(Math.random() * (MAX_PATH_LENGTH - MIN_PATH_LENGTH));

    while (path.length < targetLength) {
        // Get possible directions with preference for forward progression
        const possibleMoves = getPossibleMoves(x, y, path, visited, directions);

        if (possibleMoves.length === 0) {
            // If stuck, try backtracking
            if (path.length > 3) {
                const backtrackSteps = Math.min(3, path.length - 1);
                for (let i = 0; i < backtrackSteps; i++) {
                    const removed = path.pop();
                    if (removed) {
                        visited.delete(`${removed[0]},${removed[1]}`);
                    }
                }
                if (path.length > 0) {
                    const lastPos = path[path.length - 1];
                    x = lastPos[0];
                    y = lastPos[1];
                }
                continue;
            } else {
                break; // Can't continue
            }
        }

        // Choose the best move based on current progress
        const progress = path.length / targetLength;
        const bestMove = chooseBestMove(possibleMoves, x, y, progress);

        const newX = x + bestMove[0];
        const newY = y + bestMove[1];

        path.push([newX, newY]);
        visited.add(`${newX},${newY}`);
        x = newX;
        y = newY;
    }

    // Ensure path ends in upper area for castle
    ensureProperEnding(path, visited);

    console.log('Generated path with proper spacing:', path.length, 'tiles');
    return path;
};

function getPossibleMoves(
    currentX: number,
    currentY: number,
    path: [number, number][],
    visited: Set<string>,
    directions: [number, number][]
): [number, number][] {
    const possibleMoves: [number, number][] = [];

    for (const [dx, dy] of directions) {
        const newX = currentX + dx;
        const newY = currentY + dy;
        const key = `${newX},${newY}`;

        // Check boundaries
        if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) {
            continue;
        }

        // Check if already visited
        if (visited.has(key)) {
            continue;
        }

        // CRITICAL: Check for adjacency to non-consecutive path segments
        if (hasNonConsecutiveAdjacency(newX, newY, path, visited)) {
            continue;
        }

        possibleMoves.push([dx, dy]);
    }

    return possibleMoves;
}

function hasNonConsecutiveAdjacency(
    x: number,
    y: number,
    path: [number, number][],
    visited: Set<string>
): boolean {
    const directions: [number, number][] = [[1, 0], [0, -1], [-1, 0], [0, 1]];

    for (const [dx, dy] of directions) {
        const checkX = x + dx;
        const checkY = y + dy;
        const checkKey = `${checkX},${checkY}`;

        // If there's a visited tile adjacent to our potential position
        if (visited.has(checkKey)) {
            // Find where this tile is in our path
            const tileIndex = path.findIndex(([px, py]) => px === checkX && py === checkY);

            if (tileIndex >= 0) {
                // If this adjacent tile is not the most recent tile in our path
                // (i.e., it's not the tile we just came from), then this would create
                // non-consecutive adjacency
                if (tileIndex < path.length - 1) {
                    return true; // Would create invalid adjacency
                }
            }
        }
    }

    return false; // Safe to place here
}

function chooseBestMove(
    possibleMoves: [number, number][],
    currentX: number,
    currentY: number,
    progress: number
): [number, number] {
    if (possibleMoves.length === 1) {
        return possibleMoves[0];
    }

    // Direction preferences based on progress
    const preferences: [number, number][] = [];

    if (progress < 0.4) {
        // Early game: prefer right and up
        preferences.push([1, 0], [0, -1]);
    } else if (progress < 0.7) {
        // Mid game: prefer up and horizontal movement
        preferences.push([0, -1], [1, 0], [-1, 0]);
    } else {
        // Late game: head toward center-top for castle
        const targetX = Math.floor(BOARD_WIDTH / 2);
        if (currentX < targetX) {
            preferences.push([1, 0], [0, -1]);
        } else if (currentX > targetX) {
            preferences.push([-1, 0], [0, -1]);
        } else {
            preferences.push([0, -1]);
        }
    }

    // Find the first preferred move that's available
    for (const pref of preferences) {
        if (possibleMoves.some(([dx, dy]) => dx === pref[0] && dy === pref[1])) {
            return pref;
        }
    }

    // If no preferred move available, choose randomly
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
}

function ensureProperEnding(path: [number, number][], visited: Set<string>) {
    if (path.length === 0) return;

    const lastTile = path[path.length - 1];

    // If path doesn't end high enough, try to extend upward
    if (lastTile[1] > BOARD_HEIGHT / 2) {
        let currentX = lastTile[0];
        let currentY = lastTile[1];

        // Try to move toward center and up
        const targetX = Math.floor(BOARD_WIDTH / 2);

        while (currentY > 1 && path.length < MAX_PATH_LENGTH) {
            let moved = false;

            // Try to move up first
            if (currentY > 1) {
                const upKey = `${currentX},${currentY - 1}`;
                if (!visited.has(upKey) && !hasNonConsecutiveAdjacency(currentX, currentY - 1, path, visited)) {
                    currentY--;
                    path.push([currentX, currentY]);
                    visited.add(`${currentX},${currentY}`);
                    moved = true;
                }
            }

            // If can't move up, try to move toward center horizontally
            if (!moved && currentX !== targetX) {
                const deltaX = currentX < targetX ? 1 : -1;
                const sideKey = `${currentX + deltaX},${currentY}`;

                if (currentX + deltaX >= 0 && currentX + deltaX < BOARD_WIDTH &&
                    !visited.has(sideKey) &&
                    !hasNonConsecutiveAdjacency(currentX + deltaX, currentY, path, visited)) {
                    currentX += deltaX;
                    path.push([currentX, currentY]);
                    visited.add(`${currentX},${currentY}`);
                    moved = true;
                }
            }

            if (!moved) break;
        }
    }
}
