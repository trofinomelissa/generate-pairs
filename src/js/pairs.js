// For the test environment (Node.js), import dependencies.
// In the browser, they are loaded via script tags.
if (typeof require !== 'undefined') {
    var { formatDateBR, calculateCorrectStartDate } = require('./utils.js');
}

/**
 * Main entry point. Collects UI data, generates pairs, and displays them.
 */
function loadPairs() {
    const resultDiv = document.getElementById('result-div');
    resultDiv.innerHTML = ''; // Clear previous results

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
 * Generates pair rounds using a round-robin rotation algorithm.
 * @param {string[]} people - The list of people.
 * @param {number} totalWeeks - The number of weeks to generate.
 * @returns {Array<Array<[string, string]>>} An array of rounds, where each round has a list of pairs.
 */
function generatePairRounds(people, totalWeeks) {
    let list = [...people];
    const rounds = [];
    const maxWeeks = 40;
    const weeksToGenerate = Math.min(totalWeeks, maxWeeks);

    // If odd, add a "joker" for the algorithm to work.
    // The joker will be handled later to repeat someone.
    const isOdd = list.length % 2 !== 0;
    if (isOdd) {
        list.push(null); // Add the joker
    }

    for (let week = 0; week < weeksToGenerate; week++) {
        const pairsOfWeek = [];
        for (let i = 0; i < list.length / 2; i++) {
            const p1 = list[i];
            const p2 = list[list.length - 1 - i];
            if (p1 && p2) { // Ensure the pair does not have the joker
                pairsOfWeek.push([p1, p2]);
            } else if (isOdd) {
                // If odd, one of the two is the joker. The remaining person will be paired with someone.
                const singlePerson = p1 || p2;
                
                // Defines who the single person will be paired with.
                // The rule is to repeat the first person on the list, unless the single person IS the first one.
                let repeatedPartner = list[0];
                if (singlePerson === repeatedPartner) {
                    // If the single person is the first on the list, they cannot be paired with themselves.
                    // In this case, they will be paired with the second person on the list.
                    repeatedPartner = list[1];
                }
                
                pairsOfWeek.push([singlePerson, repeatedPartner]);
            }
        }
        rounds.push(pairsOfWeek);

        // Rotate the list for the next week (keeping the first one fixed)
        const first = list.shift();
        const last = list.pop();
        list.unshift(last);
        list.unshift(first);
    }
    // Returns the rounds and the list (which may have the joker).
    return rounds;
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
    generateWeeksData // Add this line for testing
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
        copyButton.className = 'btn-floating btn-small waves-effect waves-light tooltipped';
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
