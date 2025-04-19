document.addEventListener('DOMContentLoaded', () => {
    // DOM elements - Setup screen
    const setupScreen = document.getElementById('setup-screen');
    const practiceScreen = document.getElementById('practice-screen');
    const pairsTextArea = document.getElementById('pairs-text-area');
    const addSamplesBtn = document.getElementById('add-samples-btn');
    const samplePairsDropdown = document.getElementById('sample-pairs-dropdown'); // Add this line 
    const startPracticeBtn = document.getElementById('start-practice-btn');
    const backToSetupBtn = document.getElementById('back-to-setup-btn');
    const practiceNameInput = document.getElementById('practice-name');
    const practicesList = document.getElementById('practices-list');
    const storedPracticesSection = document.getElementById('stored-practices');
    
    // DOM elements - Practice screen
    const latinText = document.getElementById('latin-text');
    const canvas = document.getElementById('drawing-canvas');
    const clearBtn = document.getElementById('clear-btn');
    const checkBtn = document.getElementById('check-btn');
    const resultDiv = document.getElementById('result');
    const feedbackMessage = document.getElementById('feedback-message');
    const correctSymbol = document.getElementById('correct-symbol');
    const nextBtn = document.getElementById('next-btn');

    // Sample pairs
    const samplePairs = `Om - ཨོཾ
Ma - མ
Ni - ནི
Pad - པད
Me - མེ
Hum - ཧཱུྃ`;

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
        loadStoredPractices();
    }

    function loadStoredPractices() {
        const practices = JSON.parse(localStorage.getItem('tibetanPractices')) || [];
        
        // Show/hide stored practices section based on whether there are any practices
        storedPracticesSection.classList.toggle('hidden', practices.length === 0);
        
        practicesList.innerHTML = '';
        
        practices.forEach((practice, index) => {
            const practiceElement = document.createElement('div');
            practiceElement.className = 'practice-item';
            
            // Create name span
            const nameSpan = document.createElement('span');
            nameSpan.className = 'practice-name';
            nameSpan.textContent = practice.name;
            nameSpan.addEventListener('click', () => loadPractice(practice));
            
            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-practice';
            removeBtn.textContent = '×';
            removeBtn.title = 'Remove practice';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removePractice(index);
            });
            
            practiceElement.appendChild(nameSpan);
            practiceElement.appendChild(removeBtn);
            practicesList.appendChild(practiceElement);
        });
    }

    function removePractice(index) {
        if (confirm('Are you sure you want to remove this practice?')) {
            const practices = JSON.parse(localStorage.getItem('tibetanPractices')) || [];
            practices.splice(index, 1);
            localStorage.setItem('tibetanPractices', JSON.stringify(practices));
            loadStoredPractices();
        }
    }

    function loadPractice(practice) {
        pairsTextArea.value = practice.pairs;
        tibetanSymbols = practice.symbols;
        setupScreen.classList.add('hidden');
        practiceScreen.classList.remove('hidden');
        setNewSymbol();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Setup screen event listeners
        addSamplesBtn.addEventListener('click', addSamplePair);
        startPracticeBtn.addEventListener('click', startPractice);
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

    function addSamplePair() {
        const selectedPair = samplePairsDropdown.value;
        if (!selectedPair) {
            alert('Please select a pair first');
            return;
        }

        const currentText = pairsTextArea.value;
        if (currentText && !currentText.endsWith('\n')) {
            pairsTextArea.value = currentText + '\n' + selectedPair;
        } else {
            pairsTextArea.value = currentText + selectedPair;
        }
    }
    
    function startPractice() {
        tibetanSymbols = [];
        collectPairs(tibetanSymbols);
        
        if (tibetanSymbols.length === 0) {
            alert('Please add at least one symbol pair before starting.');
            return;
        }
        
        // Store the practice
        const practices = JSON.parse(localStorage.getItem('tibetanPractices')) || [];
        const practiceName = practiceNameInput.value.trim() || 
            new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        
        practices.push({
            name: practiceName,
            pairs: pairsTextArea.value,
            symbols: tibetanSymbols,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('tibetanPractices', JSON.stringify(practices));
        loadStoredPractices();
        
        setupScreen.classList.add('hidden');
        practiceScreen.classList.remove('hidden');
        
        setNewSymbol();
    }
    
    // Go back to setup screen
    function goBackToSetup() {
        practiceScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        practiceNameInput.value = ''; // Clear the name input
    }
    
    // Collect pairs from the textarea
    function collectPairs(tibetanSymbols) {
        const pairsText = pairsTextArea.value.trim();
        
        if (!pairsText) return;
        
        const lines = pairsText.split('\n');
        
        lines.forEach(line => {
            // Find first separator (any non-alphanumeric character after the first word)
            const separatorIndex = line.search(/[^a-zA-Z0-9]\s*/);
            
            if (separatorIndex !== -1) {
                
                const latinInput = line.substring(0, separatorIndex).trim();
                const tibetanInput = line.substring(separatorIndex + 2).trim();
                if (latinInput && tibetanInput) {
                    tibetanSymbols.push({
                        latin: latinInput,
                        tibetan: tibetanInput
                    });
                }
            }
        });
    }

    // Set a new random symbol
    let isFlipped = false;

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

    function checkDrawing() {
        if (!currentSymbol) return;
        
        // Change button text to "Flip"
        checkBtn.textContent = "Flip";
        
        // Create the back side with correct symbol if it doesn't exist
        let correctSymbolBack = document.querySelector('.correct-symbol-back');
        if (!correctSymbolBack) {
            correctSymbolBack = document.createElement('div');
            correctSymbolBack.className = 'correct-symbol-back';
            // Wrap canvas in a wrapper if not already wrapped
            if (!canvas.parentElement.classList.contains('canvas-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'canvas-wrapper';
                canvas.parentNode.insertBefore(wrapper, canvas);
                wrapper.appendChild(canvas);
                wrapper.appendChild(correctSymbolBack);
            }
        }
        correctSymbolBack.textContent = currentSymbol.tibetan;
        
        // Change check button to flip functionality
        checkBtn.removeEventListener('click', checkDrawing);
        checkBtn.addEventListener('click', flipCanvas);
        
        // Enable next button
        resultDiv.classList.remove('hidden');
        document.querySelector('.feedback').classList.add('hidden');
        nextBtn.classList.remove('hidden');
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        flipCanvas();
    }

    function flipCanvas() {
        const wrapper = canvas.parentElement;
        isFlipped = !isFlipped;
        wrapper.classList.toggle('flipped');
    }
    
    function setNewSymbol() {
        if (tibetanSymbols.length === 0) return;
        
        // Create a copy of symbols without the current symbol
        let availableSymbols = [...tibetanSymbols];
        if (currentSymbol && availableSymbols.length > 1) {
            availableSymbols = availableSymbols.filter(symbol => symbol.latin !== currentSymbol.latin);
        }
        
        // Get random symbol from available ones 
        const randomIndex = Math.floor(Math.random() * availableSymbols.length);
        currentSymbol = availableSymbols[randomIndex];
        
        latinText.textContent = currentSymbol.latin;
        
        // Reset the check button
        checkBtn.textContent = "Check Answer";
        checkBtn.removeEventListener('click', flipCanvas);
        checkBtn.addEventListener('click', checkDrawing);
        
        // Reset canvas wrapper
        const wrapper = canvas.parentElement;
        if (wrapper.classList.contains('flipped')) {
            wrapper.classList.remove('flipped');
        }
        
        // Hide result div completely
        resultDiv.classList.add('hidden');
        
        clearCanvas();
    }
    

    // Initialize the app
    init();
});