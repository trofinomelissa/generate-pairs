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
    const people = [...participants];
    let n = people.length;
    const result = [];
    const isOdd = n % 2 !== 0;

    if (isOdd) {
        people.push('placeholder');
        n++;
    }

    for (let round = 0; round < rounds; round++) {
        const roundPairs = [];
        let personLeftOut = null;

        for (let i = 0; i < n / 2; i++) {
            const p1 = people[i];
            const p2 = people[n - 1 - i];

            if (p1 === 'placeholder') {
                personLeftOut = p2;
                continue;
            }
            if (p2 === 'placeholder') {
                personLeftOut = p1;
                continue;
            }
            roundPairs.push([p1, p2]);
        }

        if (isOdd && personLeftOut) {
            // In odd lists, the person left out forms a pair with the first person of the first pair
            if (roundPairs.length > 0) {
                roundPairs.push([personLeftOut, roundPairs[0][0]]);
            } else {
                // This case should not happen in a real scenario with participants
            }
        }

        result.push(roundPairs);

        // Rotate for next round, keeping the first element fixed
        const first = people.shift();
        const last = people.pop();
        people.unshift(last);
        people.unshift(first);
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
    // Update the UI field with Brazilian format
    const dd = String(startDate.getDate()).padStart(2, '0');
    const mm = String(startDate.getMonth() + 1).padStart(2, '0');
    const yyyy = startDate.getFullYear();
    startDateInput.value = `${dd}/${mm}/${yyyy}`;

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

    // Create results header with action buttons
    const resultsHeader = createResultsHeader(weeksData);
    container.appendChild(resultsHeader);

    // Create container for the results content
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-content';
    resultsContainer.className = 'results-content';

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
        resultsContainer.appendChild(weekDiv);

        // Initialize the tooltip for the new button
        M.Tooltip.init(copyButton);
    });

    container.appendChild(resultsContainer);
}

/**
 * Creates the results header with action buttons.
 * @param {Array<object>} weeksData - The data for all weeks.
 * @returns {HTMLElement} The header element with action buttons.
 */
function createResultsHeader(weeksData) {
    const header = document.createElement('div');
    header.className = 'results-header';

    const title = document.createElement('h4');
    title.textContent = `Duplas Geradas (${weeksData.length} semanas)`;
    title.style.margin = '0';
    title.style.color = 'var(--primary)';

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'results-actions';

    // Copy all button
    const copyAllButton = document.createElement('button');
    copyAllButton.className = 'btn-flat waves-effect tooltipped';
    copyAllButton.setAttribute('data-position', 'top');
    copyAllButton.setAttribute('data-tooltip', 'Copiar todas as rodadas');
    copyAllButton.innerHTML = '<i class="material-icons left">content_copy</i>Copiar Tudo';
    copyAllButton.onclick = () => copyAllWeeksToClipboard(weeksData);

    // Regenerate button
    const regenerateButton = document.createElement('button');
    regenerateButton.className = 'btn-flat waves-effect tooltipped';
    regenerateButton.setAttribute('data-position', 'top');
    regenerateButton.setAttribute('data-tooltip', 'Gerar novas duplas');
    regenerateButton.innerHTML = '<i class="material-icons left">refresh</i>Gerar Novamente';
    regenerateButton.onclick = () => loadPairs();

    // Export to PDF button
    const exportPdfButton = document.createElement('button');
    exportPdfButton.className = 'btn waves-effect waves-light tooltipped';
    exportPdfButton.setAttribute('data-position', 'top');
    exportPdfButton.setAttribute('data-tooltip', 'Exportar para PDF');
    exportPdfButton.innerHTML = '<i class="material-icons left">picture_as_pdf</i>Exportar PDF';
    exportPdfButton.onclick = () => exportToPdf(weeksData);

    // Clear results button
    const clearButton = document.createElement('button');
    clearButton.className = 'btn-flat waves-effect tooltipped red-text';
    clearButton.setAttribute('data-position', 'top');
    clearButton.setAttribute('data-tooltip', 'Limpar resultados');
    clearButton.innerHTML = '<i class="material-icons left">clear</i>Limpar';
    clearButton.onclick = () => clearResults();

    actionsContainer.appendChild(copyAllButton);
    actionsContainer.appendChild(regenerateButton);
    actionsContainer.appendChild(exportPdfButton);
    actionsContainer.appendChild(clearButton);

    header.appendChild(title);
    header.appendChild(actionsContainer);

    // Initialize tooltips
    setTimeout(() => {
        M.Tooltip.init(header.querySelectorAll('.tooltipped'));
    }, 100);

    return header;
}

/**
 * Copies all weeks' pairs to the clipboard in WhatsApp-friendly Markdown format.
 * @param {Array<object>} weeksData - The data of all weeks to be copied.
 */
function copyAllWeeksToClipboard(weeksData) {
    let textToCopy = '*📅 CRONOGRAMA DE DUPLAS*\n\n';

    weeksData.forEach((week, index) => {
        textToCopy += `*Semana ${index + 1}: ${week.label}*\n`;
        week.pairs.forEach(([p1, p2]) => {
            textToCopy += `🔹 ${p1} e ${p2}\n`;
        });
        textToCopy += '\n';
    });

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        M.toast({ html: 'Todas as rodadas copiadas!' });
    }, () => {
        M.toast({ html: 'Erro ao copiar as rodadas.' });
    });
}

/**
 * Exports the results to PDF by opening the print dialog with only the results visible.
 * @param {Array<object>} weeksData - The data of all weeks to be exported.
 */
function exportToPdf(weeksData) {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content for printing
    const printContent = generatePrintableContent(weeksData);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    
    M.toast({ html: 'Abrindo diálogo de impressão...' });
}

/**
 * Generates printable HTML content for the weeks data.
 * @param {Array<object>} weeksData - The data of all weeks.
 * @returns {string} HTML string ready for printing.
 */
function generatePrintableContent(weeksData) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cronograma de Duplas</title>
        <style>
            @media print {
                @page { margin: 2cm; size: A4; }
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.4;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #1976d2;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #1976d2;
                margin: 0 0 10px 0;
                font-size: 28px;
            }
            .header .subtitle {
                color: #666;
                margin: 0;
                font-size: 14px;
            }
            .week {
                margin-bottom: 25px;
                break-inside: avoid;
            }
            .week-title {
                background: #f5f5f5;
                border-left: 4px solid #1976d2;
                padding: 10px 15px;
                margin-bottom: 10px;
                font-weight: bold;
                font-size: 16px;
            }
            .pairs-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .pairs-list li {
                padding: 8px 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                align-items: center;
            }
            .pairs-list li:before {
                content: "🔹";
                margin-right: 10px;
            }
            .pairs-list li:last-child {
                border-bottom: none;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📅 Cronograma de Duplas</h1>
            <p class="subtitle">Gerado em ${currentDate} | Total: ${weeksData.length} semanas</p>
        </div>
        
        <div class="content">`;

    weeksData.forEach((week, index) => {
        html += `
            <div class="week">
                <div class="week-title">Semana ${index + 1}: ${week.label}</div>
                <ul class="pairs-list">`;
        
        week.pairs.forEach(([p1, p2]) => {
            html += `<li>${p1} e ${p2}</li>`;
        });
        
        html += `
                </ul>
            </div>`;
    });

    html += `
        </div>
        
        <div class="footer">
            <p>Gerado pelo Sistema de Geração de Duplas</p>
        </div>
    </body>
    </html>`;

    return html;
}

/**
 * Clears all results from the results container.
 */
function clearResults() {
    // Add confirmation dialog
    if (confirm('Tem certeza de que deseja limpar todos os resultados?')) {
        const resultDiv = document.getElementById('result-div');
        if (resultDiv) {
            resultDiv.innerHTML = '';
            M.toast({ html: 'Resultados limpos!' });
        }
    }
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
