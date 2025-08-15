// For the test environment (Node.js), import dependencies.
// In the browser, they are loaded via script tags.
if (typeof require !== 'undefined') {
    var { formatDateBR, calculateCorrectStartDate } = require('./utils.js');
}

/**
 * Generates pair rounds avoiding repeated pairs and rotates who repeats in case of odd lists.
 * @param {Array<string>} participants List of participants
 * @param {number} rounds Number of rounds
 * @returns {Array<Array<Array<string>>>} Array of rounds, each round is an array of pairs
 */
function generatePairRounds(participants, rounds) {
    // Copy the list to avoid mutating the original
    const people = [...participants];
    const n = people.length;
    const allPairs = new Set(); // To avoid repeated pairs
    const coringaQueue = [];
    for (let i = 0; i < n; i++) coringaQueue.push(people[i]);
    const result = [];

    // Helper to generate an ordered pair key (to avoid repeated pairs)
    function pairKey(a, b) {
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    }

    for (let round = 0; round < rounds; round++) {
        // Deterministic shuffling: rotate the list each round
        const rotated = people.slice(round % n).concat(people.slice(0, round % n));
        let roundPairs = [];
        let used = new Set();
        let coringa = null;

        if (n % 2 === 1) {
            // Select the joker for this round (rotating)
            coringa = coringaQueue.shift();
            coringaQueue.push(coringa);
        }

        // Build pairs for this round
        if (n % 2 === 1 && coringa) {
            // Joker makes two pairs
            let coringaPairs = [];
            // Try to create new (unseen) pairs first
            for (let j = 0; j < n && coringaPairs.length < 2; j++) {
                if (rotated[j] === coringa || used.has(rotated[j])) continue;
                const key = pairKey(coringa, rotated[j]);
                if (!allPairs.has(key)) {
                    coringaPairs.push(rotated[j]);
                    used.add(rotated[j]);
                }
            }
            // If not enough new pairs, complete with any available
            for (let j = 0; j < n && coringaPairs.length < 2; j++) {
                if (rotated[j] === coringa || used.has(rotated[j])) continue;
                if (!coringaPairs.includes(rotated[j])) {
                    coringaPairs.push(rotated[j]);
                    used.add(rotated[j]);
                }
            }
            // Ensure the joker always has two pairs
            if (coringaPairs.length < 2) {
                for (let j = 0; j < n && coringaPairs.length < 2; j++) {
                    if (rotated[j] === coringa) continue;
                    if (!coringaPairs.includes(rotated[j])) {
                        coringaPairs.push(rotated[j]);
                        used.add(rotated[j]);
                    }
                }
            }
            // Add joker's pairs to the round
            for (const p of coringaPairs) {
                roundPairs.push([coringa, p]);
                allPairs.add(pairKey(coringa, p));
            }
            used.add(coringa);
        }

        // Build the remaining pairs
        for (let i = 0; i < n; i++) {
            if (used.has(rotated[i])) continue;
            // Look for a new (unseen) pair
            let found = false;
            for (let j = i + 1; j < n; j++) {
                if (used.has(rotated[j])) continue;
                const key = pairKey(rotated[i], rotated[j]);
                if (!allPairs.has(key)) {
                    roundPairs.push([rotated[i], rotated[j]]);
                    allPairs.add(key);
                    used.add(rotated[i]);
                    used.add(rotated[j]);
                    found = true;
                    break;
                }
            }
            // If no new pair found, use any available
            if (!found) {
                for (let j = i + 1; j < n; j++) {
                    if (used.has(rotated[j])) continue;
                    roundPairs.push([rotated[i], rotated[j]]);
                    allPairs.add(pairKey(rotated[i], rotated[j]));
                    used.add(rotated[i]);
                    used.add(rotated[j]);
                    break;
                }
            }
        }

        // If someone is still without a pair (should only happen with odd lists)
        const notUsed = people.filter(p => !used.has(p));
        while (notUsed.length > 0) {
            // Force extra pairs to ensure everyone participates
            const a = notUsed.shift();
            const b = notUsed.shift() || people.find(p => p !== a);
            roundPairs.push([a, b]);
            used.add(a);
            used.add(b);
        }

        result.push(roundPairs);
    }
    return result;
}

/**
 * Main entry point. Collects UI data, generates pairs, and displays them.
 */
function loadPairs() {
    // Ensure the element exists
    const resultDiv = document.getElementById('result-div');
    if (!resultDiv) return;
    resultDiv.innerHTML = '';

    // 1. Collect and validate form data
    const { people, startDate, numWeeks, error } = getFormData();
    if (error) {
        resultDiv.innerHTML = `<p style='color: red;'>${error}</p>`;
        return;
    }

    // 2. Generate the logic for pair rounds
    const rounds = generatePairRounds(people, numWeeks);

    // 3. Generate the data for rendering
    const weeksData = generateWeeksData(rounds, startDate);

    // 4. Render the weeks on the screen
    renderWeeks(weeksData, resultDiv);
}

/**
 * Collects and validates data from the page's form.
 * @returns {object} Contains form data or an error message.
 */
function getFormData() {
    const manualList = document.getElementById('name-list-textarea').value;
    const people = manualList.split(/\r?\n/).map(name => name.trim()).filter(Boolean);

    if (people.length < 2) {
        return { error: "Adicione pelo menos dois nomes para formar duplas." };
    }

    const startDateInput = document.getElementById('start-date-input');
    let startDateStr = startDateInput.value;
    const selectedDayOfWeek = parseInt(document.getElementById('weekday-select').value, 10);

    // Calculate the correct start date based on the chosen day of the week
    const startDate = calculateCorrectStartDate(startDateStr, selectedDayOfWeek);
    startDateInput.value = startDate.toISOString().slice(0, 10); // Update the UI field

    const numWeeksInput = document.getElementById('weeks-input');
    let numWeeks = parseInt(numWeeksInput.value, 10);
    if (isNaN(numWeeks) || numWeeks < 1) {
        numWeeks = 10; // Default value
    }

    return { people, startDate, numWeeks, error: null };
}

/**
 * Generates the data for each week, including dates and pairs.
 * @param {Array<Array<[string, string]>>} rounds - The generated rounds.
 * @param {Date} startDate - The start date of the first week.
 * @returns {Array<object>} An array of week data objects.
 */
function generateWeeksData(rounds, startDate) {
    const weeksData = [];
    let weekDate = new Date(startDate);

    rounds.forEach((pairs, index) => {
        const start = new Date(weekDate);
        const end = new Date(weekDate);
        end.setDate(end.getDate() + 6);
        const weekLabel = `${formatDateBR(start)} - ${formatDateBR(end)}`;

        weeksData.push({
            weekNumber: index + 1,
            label: weekLabel,
            pairs: pairs
        });

        // Advance to the next week
        weekDate.setDate(weekDate.getDate() + 7);
    });

    return weeksData;
}

// Add exports for the test environment (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generatePairRounds,
        generateWeeksData // Add this line for testing
    };
}

// Make loadPairs global for HTML
if (typeof window !== 'undefined') {
    window.loadPairs = loadPairs;
}

/**
 * Renders the weeks and their pairs in the user interface.
 * @param {Array<object>} weeksData - The data for the weeks to be rendered.
 * @param {HTMLElement} container - The element where the result will be rendered.
 */
function renderWeeks(weeksData, container) {
    // Clear previous results completely
    container.innerHTML = '';

    // Do not render anything if there is no data
    if (weeksData.length === 0) {
        return;
    }

    // Render each week
    weeksData.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'round';

        const weekHeader = document.createElement('div');
        weekHeader.className = 'round-header';

        const weekLabel = document.createElement('h3');
        weekLabel.textContent = week.label;

        const copyButton = document.createElement('button');
        copyButton.className = 'btn-floating btn-small waves-effect waves-light tooltipped blue';
        copyButton.setAttribute('data-position', 'top');
        copyButton.setAttribute('data-tooltip', 'Copiar rodada');
        copyButton.innerHTML = '<i class="material-icons">content_copy</i>';
        copyButton.onclick = () => copyWeekToClipboard(week);

        weekHeader.appendChild(weekLabel);
        weekHeader.appendChild(copyButton);

        weekDiv.appendChild(weekHeader);

        const pairsList = document.createElement('ul');
        week.pairs.forEach(([p1, p2]) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${p1} e ${p2}`;
            pairsList.appendChild(listItem);
        });

        weekDiv.appendChild(pairsList);
        container.appendChild(weekDiv);

        // Initialize the tooltip for the new button
        M.Tooltip.init(copyButton);
    });
}

/**
 * Copies a single week's pairs to the clipboard in WhatsApp-friendly Markdown format.
 * @param {object} weekData - The data of the week to be copied.
 */
function copyWeekToClipboard(weekData) {
    // Format the title in bold and add a blank line for better readability
    let textToCopy = `*${weekData.label}*\n\n`;

    // Add each pair with an emoji as a bullet point
    weekData.pairs.forEach(([p1, p2]) => {
        textToCopy += `🔹 ${p1} e ${p2}\n`;
    });

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        M.toast({ html: 'Rodada copiada!' });
    }, () => {
        M.toast({ html: 'Erro ao copiar a rodada.' });
    });
}
