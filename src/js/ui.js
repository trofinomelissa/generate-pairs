document.addEventListener('DOMContentLoaded', function() {
    // Theme: dark/light toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    function setTheme(dark) {
        document.body.classList.toggle('dark-mode', dark);
        themeIcon.textContent = dark ? 'light_mode' : 'dark_mode';
    }
    // Load preference
    let dark = localStorage.getItem('theme') === 'dark' || (localStorage.getItem('theme') === null && prefersDark);
    setTheme(dark);
    themeToggle.addEventListener('click', function() {
        dark = !document.body.classList.contains('dark-mode');
        setTheme(dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
    // Initialize tooltips
    var tooltips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltips);

    // Initialize selects
    var selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);

    // Initialize date pickers
    var datepickers = document.querySelectorAll('.datepicker');
    M.Datepicker.init(datepickers, {
        format: 'yyyy-mm-dd',
        autoClose: true,
        i18n: {
            cancel: 'Cancelar',
            clear: 'Limpar',
            done: 'Ok',
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            weekdays: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
            weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            weekdaysAbbrev: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
        }
    });

    // Fill start date with today
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    var startDateInput = document.getElementById('start-date-input');
    startDateInput.value = `${yyyy}-${mm}-${dd}`;
    
    // Force Materialize label update for pre-filled fields
    M.updateTextFields();
});
