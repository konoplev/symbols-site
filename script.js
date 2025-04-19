document.addEventListener('DOMContentLoaded', () => {
    // DOM elements - Setup screen
    const setupScreen = document.getElementById('setup-screen');
    const practiceScreen = document.getElementById('practice-screen');
    const pairsContainer = document.getElementById('pairs-container');
    const addPairBtn = document.getElementById('add-pair-btn');
    const startPracticeBtn = document.getElementById('start-practice-btn');
    const samplePairBtns = document.querySelectorAll('.sample-pair');
    const backToSetupBtn = document.getElementById('back-to-setup-btn');
    
    // DOM elements - Practice screen
    const latinText = document.getElementById('latin-text');
    const canvas = document.getElementById('drawing-canvas');
    const clearBtn = document.getElementById('clear-btn');
    const checkBtn = document.getElementById('check-btn');
    const resultDiv = document.getElementById('result');
    const feedbackMessage = document.getElementById('feedback-message');
    const correctSymbol = document.getElementById('correct-symbol');
    const nextBtn = document.getElementById('next-btn');

    // Canvas setup
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // User-defined Tibetan symbols
    let tibetanSymbols = [];
    
    // Current symbol
    let currentSymbolIndex = 0;
    let currentSymbol = null;

    // Initialize the app
    function init() {
        // Ensure practice screen is hidden
        setupScreen.classList.remove('hidden');
        practiceScreen.classList.add('hidden');
        
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Setup screen event listeners
        addPairBtn.addEventListener('click', addNewPair);
        startPracticeBtn.addEventListener('click', startPractice);
        pairsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-pair')) {
                removePair(e.target);
            }
        });
        
        samplePairBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                addSamplePair(btn.dataset.latin, btn.dataset.tibetan);
            });
        });
        
        backToSetupBtn.addEventListener('click', goBackToSetup);
        
        // Practice screen event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', stopDrawing);
        
        // Button events
        clearBtn.addEventListener('click', clearCanvas);
        checkBtn.addEventListener('click', checkDrawing);
        nextBtn.addEventListener('click', setNewSymbol);
    }

    // Add new pair input fields
    function addNewPair() {
        const pairDiv = document.createElement('div');
        pairDiv.classList.add('symbol-pair');
        
        pairDiv.innerHTML = `
            <input type="text" class="latin-input" placeholder="Latin (e.g., Om)">
            <input type="text" class="tibetan-input" placeholder="Tibetan (e.g., ཨོཾ)">
            <button class="remove-pair">×</button>
        `;
        
        pairsContainer.appendChild(pairDiv);
    }
    
    // Remove a pair
    function removePair(button) {
        const pairDiv = button.parentElement;
        pairDiv.remove();
    }
    
    // Add a sample pair
    function addSamplePair(latin, tibetan) {
        const pairDiv = document.createElement('div');
        pairDiv.classList.add('symbol-pair');
        
        pairDiv.innerHTML = `
            <input type="text" class="latin-input" value="${latin}" placeholder="Latin (e.g., Om)">
            <input type="text" class="tibetan-input" value="${tibetan}" placeholder="Tibetan (e.g., ཨོཾ)">
            <button class="remove-pair">×</button>
        `;
        
        pairsContainer.appendChild(pairDiv);
    }
    
    // Start practice with collected pairs
    function startPractice() {
        collectPairs();
        
        if (tibetanSymbols.length === 0) {
            alert('Please add at least one symbol pair before starting.');
            return;
        }
        
        setupScreen.classList.add('hidden');
        practiceScreen.classList.remove('hidden');
        
        setNewSymbol();
    }
    
    // Go back to setup screen
    function goBackToSetup() {
        practiceScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
    
    // Collect pairs from the input fields
    function collectPairs() {
        tibetanSymbols = [];
        const pairDivs = pairsContainer.querySelectorAll('.symbol-pair');
        
        pairDivs.forEach(div => {
            const latinInput = div.querySelector('.latin-input').value.trim();
            const tibetanInput = div.querySelector('.tibetan-input').value.trim();
            
            if (latinInput && tibetanInput) {
                tibetanSymbols.push({
                    latin: latinInput,
                    tibetan: tibetanInput
                });
            }
        });
    }

    // Set a new random symbol
    function setNewSymbol() {
        if (tibetanSymbols.length === 0) return;
        
        currentSymbolIndex = Math.floor(Math.random() * tibetanSymbols.length);
        currentSymbol = tibetanSymbols[currentSymbolIndex];
        latinText.textContent = currentSymbol.latin;
        resultDiv.classList.add('hidden');
        clearCanvas();
    }

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const [x, y] = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Touch handlers
    function handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            draw({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    // Get coordinates adjusted for canvas position
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }

    // Clear the canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Check the drawing against the correct symbol
    function checkDrawing() {
        if (!currentSymbol) return;
        
        // In a real implementation, this would use a machine learning model
        // For this demo, we'll just show the correct symbol

        // Show the feedback
        resultDiv.classList.remove('hidden');
        correctSymbol.textContent = currentSymbol.tibetan;
        
        // Simple feedback (in a real app, this would use AI to check)
        const dataURL = canvas.toDataURL();
        if (dataURL === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAACu0lEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeBoR4AAFMBTTwAAAAASUVORK5CYII=') {
            // Canvas is empty
            feedbackMessage.textContent = "Please draw something!";
        } else {
            // Normally we would compare with AI here
            feedbackMessage.textContent = "Let's see how you did!";
        }
    }

    // Initialize the app
    init();
});