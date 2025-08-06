const fs = require('fs');
const path = require('path');

function getFilesInDirectory(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getFilesInDirectory(filePath, fileList);
        } else {
            // Get relative path from public folder
            const relativePath = path.relative(path.join(__dirname, 'public'), filePath);
            fileList.push(relativePath);
        }
    });

    return fileList;
}

// Usage
const modelsPath = path.join(__dirname, 'public', 'models', 'components');
const allModelFiles = getFilesInDirectory(modelsPath);

console.log('All model files:');
console.log(JSON.stringify(allModelFiles, null, 2));
