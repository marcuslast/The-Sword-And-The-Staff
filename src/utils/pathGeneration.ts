// Constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 8;
export const MIN_PATH_LENGTH = 35;
export const MAX_PATH_LENGTH = 45;

// Enhanced path generation for clearer pathways
// Update the generateRandomPath function to return tiles with proper ordering
export const generateRandomPath = (): [number, number][] => {
    // For now, let's create a simple predictable path for debugging
    const path: [number, number][] = [];

    // Start at bottom-left and create a simple path
    let x = 0, y = 7; // Start at bottom-left (0, 7)

    // Move right across the bottom
    while (x < 9) {
        path.push([x, y]);
        x++;
    }

    // Move up the right side
    while (y > 0) {
        path.push([x, y]);
        y--;
    }

    // Move left across the top
    while (x > 0) {
        path.push([x, y]);
        x--;
    }

    // Add a few more tiles to make it longer
    path.push([0, 1]);
    path.push([1, 1]);
    path.push([2, 1]);
    path.push([3, 1]); // Final castle position

    console.log('Generated path:', path);
    return path;
};
