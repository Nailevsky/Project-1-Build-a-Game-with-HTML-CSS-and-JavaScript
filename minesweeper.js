document.addEventListener('DOMContentLoaded', () => {

    // Create and append the game title
    document.title = 'Minesweeper';

    // Create start button earlier than the grid
    const startButton = document.createElement('button');
    startButton.textContent = '';
    document.body.append(startButton);

    // Create timer and append it to the document body
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timer';
    timerDisplay.textContent = 'Time: 0s';
    document.body.append(timerDisplay);

    // Create a grid for the Minesweeper game and append it to the document body
    const grid = document.createElement('div');
    grid.id = 'minesweeper-grid';
    document.body.append(grid);
    
    // Create a dropdown for level selection
    const levelSelect = document.createElement('select');
    const levels = {
        'Easy': 10,
        'Medium': 20,
        'Hard': 30
    };

    // Populate the dropdown with options and set 'Easy' as the default selected level
    Object.keys(levels).forEach(level => {
        const option = document.createElement('option');
        option.value = levels[level];
        option.textContent = level;
        if (level === 'Easy') {
            option.selected = true;
        }
        levelSelect.append(option);
    });
    document.body.append(levelSelect);

    let gridSize = 10; // 10x10 grid
   
    startButton.addEventListener('click', () => {
        mineCount = parseInt(levelSelect.value);
        grid.innerHTML = ''; // Clear the grid
        minePositions.clear();
        revealedCellsCount = 0
        // Remove Game Over message
        const gameOverMessage = document.getElementById('game-over-message');
        if (gameOverMessage) {
            gameOverMessage.remove();
        }
        // Remove Win message
        const winMessage = document.getElementById('win-message');
        if (winMessage) {
            winMessage.remove();
        }
        resetTimer();
        startTimer();
        createGrid();
        placeMines();
    });

    function startTimer() {
        timer = setInterval(() => {
            timeElapsed++;
            timerDisplay.textContent = `Time: ${timeElapsed}s`;
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
        timeElapsed = 0;
        timerDisplay.textContent = 'Time: 0s';
    }
   
    // Initialize the grid
    function createGrid() {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(10, 30px)';
        grid.style.gridGap = '1px';

        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            styleCell(cell); // Style the cell
            cell.id = `cell-${i}`;
            // Add click and right-click event listeners to each cell
            cell.addEventListener('click', () => handleLeftClick(i));
            cell.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                handleRightClick(i);
            });
            grid.append(cell);
        }
    }

    // Add styles to each cell in the grid
    function styleCell(cell) {
        cell.style.width = '30px';
        cell.style.height = '30px';
        cell.style.backgroundColor = 'lightgrey';
        cell.style.textAlign = 'center';
        cell.style.verticalAlign = 'middle';
        cell.style.lineHeight = '30px';
        cell.style.cursor = 'pointer';
    }

    let mineCount = levels['Easy'];
    let minePositions = new Set();
    let revealedCellsCount = 0;

    // Plant mines randomly
    function placeMines() {
        while (minePositions.size < mineCount) {
            const randomPosition = Math.floor(Math.random() * gridSize * gridSize);
            minePositions.add(randomPosition);
        }
    }

    // Handle left-click events
    function handleLeftClick(cellIndex) {
    // Get the cell by its ID and handle game logic based on cell state
        const cell = document.getElementById(`cell-${cellIndex}`);
        if (cell.classList.contains('flagged') || cell.classList.contains('revealed')) {
            return;
        }
        if (minePositions.has(cellIndex)) {
            revealMines(); // Reveal all mines if a mine is clicked
            displayGameOver(); // Game Over appears
        } else {
            revealCell(cellIndex); // Reveal the clicked cell
        }
    }

    // Handle right-click to flag mines
    function handleRightClick(cellIndex) {
        const cell = document.getElementById(`cell-${cellIndex}`);
        if (!cell.classList.contains('revealed')) {
            if (cell.classList.toggle('flagged')) {
                cell.style.backgroundColor = 'green';
            } else {
                cell.style.backgroundColor = 'lightgrey';
            }
        }
    }

    // Reveal all mines when a mine is clicked
    function revealMines() {
        minePositions.forEach(index => {
            const mineCell = document.getElementById(`cell-${index}`);
            mineCell.classList.add('mine');
            mineCell.style.backgroundColor = 'red';
        });
    }

    // Game Over display function
    function displayGameOver() {
        clearInterval(timer);
        const gameOverMessage = document.createElement('div');
        gameOverMessage.id = 'game-over-message';
        gameOverMessage.textContent = 'Game Over';
        gameOverMessage.style.color = 'red';
        gameOverMessage.style.fontSize = '17px';
        document.body.append(gameOverMessage);
    };

    // Reveal a specific cell
    function revealCell(cellIndex) {
        const cell = document.getElementById(`cell-${cellIndex}`);
        if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) {
            return;
        }
        cell.classList.add('revealed');
        const minesCount = countNearbyMines(cellIndex);
        if (minesCount > 0) {
            cell.textContent = minesCount;
            cell.style.backgroundColor = 'darkgrey';
        } else {
            cell.style.backgroundColor = 'darkgrey';
            revealAdjacentCells(cellIndex);
        }
        revealedCellsCount++;
        checkWinCondition() // Check if the player has won 
    }

    function countNearbyMines(cellIndex) {
        let count = 0;
        const row = Math.floor(cellIndex / gridSize);
        const col = cellIndex % gridSize;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                    const newCellIndex = newRow * gridSize + newCol;
                    if (minePositions.has(newCellIndex)) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function revealAdjacentCells(cellIndex) {
        const row = Math.floor(cellIndex / gridSize);
        const col = cellIndex % gridSize;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                    const newCellIndex = newRow * gridSize + newCol;
                    revealCell(newCellIndex);
                }
            }
        }
    }

    function displayWinMessage() {
        clearInterval(timer);
        const winMessage = document.createElement('div');
        winMessage.id = 'win-message';
        winMessage.textContent = 'Congratulations, you won!';
        winMessage.style.color = 'green';
        winMessage.style.fontSize = '17px';
        document.body.append(winMessage);
    }

    function checkWinCondition() {
        if (revealedCellsCount + mineCount === gridSize * gridSize) {
            displayWinMessage();
        }
    }

    createGrid();
    placeMines();
});