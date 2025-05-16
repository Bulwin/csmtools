document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const inputData = document.getElementById('input-data');
    const outputData = document.getElementById('output-data');
    const convertBtn = document.getElementById('convert-to-full-ui');
    const clearInputBtn = document.getElementById('clear-input');
    const copyOutputBtn = document.getElementById('copy-output');
    
    // Метаданные
    const teamIdInput = document.getElementById('team-id');
    const tacticNameInput = document.getElementById('tactic-name');
    const mapSelect = document.getElementById('map');
    const sideSelect = document.getElementById('side');
    
    // Загрузка сохраненных метаданных
    loadSavedMetadata();
    
    // Сохранение метаданных при изменении
    teamIdInput.addEventListener('change', saveMetadata);
    tacticNameInput.addEventListener('change', saveMetadata);
    mapSelect.addEventListener('change', saveMetadata);
    sideSelect.addEventListener('change', saveMetadata);
    
    // Функции для работы с метаданными
    function saveMetadata() {
        const metadata = {
            teamId: teamIdInput.value,
            tacticName: tacticNameInput.value,
            map: mapSelect.value,
            side: sideSelect.value
        };
        
        localStorage.setItem('cplManagerMetadata', JSON.stringify(metadata));
    }
    
    function loadSavedMetadata() {
        const savedMetadata = localStorage.getItem('cplManagerMetadata');
        
        if (savedMetadata) {
            const metadata = JSON.parse(savedMetadata);
            
            if (metadata.teamId) teamIdInput.value = metadata.teamId;
            if (metadata.tacticName) tacticNameInput.value = metadata.tacticName;
            if (metadata.map) mapSelect.value = metadata.map;
            if (metadata.side) sideSelect.value = metadata.side;
        }
    }
    
    function getMetadata() {
        return {
            teamId: teamIdInput.value || '3782',
            tacticName: tacticNameInput.value || 'Новая тактика',
            map: mapSelect.value,
            side: parseInt(sideSelect.value)
        };
    }
    
    // Определение формата данных
    function detectFormat(data) {
        try {
            // Попытка парсинга JSON
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            
            // Проверка на UI формат (массив объектов)
            if (Array.isArray(parsed.waypoints) && typeof parsed.waypoints[0] === 'object' && !Array.isArray(parsed.waypoints[0])) {
                return 'ui';
            }
            
            // Проверка на массивный формат
            if (Array.isArray(parsed.waypoints) && Array.isArray(parsed.waypoints[0])) {
                return 'array';
            }
            
            return 'unknown';
        } catch (error) {
            // Если не удалось распарсить как JSON, проверяем на массивный формат в виде строки
            if (data.includes('waypoints: [[[') || data.includes('waypoints:[[[')) {
                return 'array';
            }
            return 'unknown';
        }
    }

    // Парсинг входных данных
    function parseInput(input) {
        try {
            // Попытка парсинга как JSON
            return JSON.parse(input);
        } catch (error) {
            // Если не удалось распарсить как JSON, пробуем как JavaScript объект
            try {
                // Преобразуем строку в объект JavaScript
                // Заменяем одинарные кавычки на двойные для JSON
                const jsonString = input
                    .replace(/([a-zA-Z0-9_]+):/g, '"$1":')  // Добавляем кавычки к ключам
                    .replace(/'/g, '"')                     // Заменяем одинарные кавычки на двойные
                    .replace(/(\d+):/g, '"$1":');           // Добавляем кавычки к числовым ключам
                
                return JSON.parse(jsonString);
            } catch (e) {
                // Если и это не удалось, пробуем выполнить как код JavaScript
                try {
                    // Создаем временный объект для хранения результата
                    let result = {};
                    
                    // Выполняем код в контексте временного объекта
                    const code = `result = { ${input} }`;
                    eval(code);
                    
                    return result;
                } catch (evalError) {
                    console.error('Не удалось распарсить входные данные:', evalError);
                    return null;
                }
            }
        }
    }

    // Форматирование выходных данных
    function formatOutput(data, format) {
        if (format === 'ui') {
            return JSON.stringify({
                waypoints: data.waypoints,
                postPlantWaypoints: data.postPlantWaypoints
            }, null, 2);
        } else if (format === 'array') {
            return `waypoints: ${JSON.stringify(data.waypoints)},
postPlantWaypoints: ${JSON.stringify(data.postPlantWaypoints)},`;
        } else if (format === 'full-ui') {
            const metadata = getMetadata();
            
            return JSON.stringify({
                team_id: parseInt(metadata.teamId),
                name: metadata.tacticName,
                map: metadata.map,
                side: metadata.side,
                selectedTacticTypes: ["pistol", "standard", "eco"],
                selectedMatchTypes: ["league", "scrim", "ladder", "tournament"],
                loadouts: [],
                bomb_carrier: 1,
                plantTime: 25,
                waypoints: data.waypoints,
                postPlantWaypoints: data.postPlantWaypoints,
                isDraft: true
            }, null, 2);
        } else if (format === 'duplicate') {
            const metadata = getMetadata();
            const currentDate = new Date().toISOString();
            
            return JSON.stringify({
                tacticDuplicate: {
                    id: 177484,
                    name: metadata.tacticName,
                    side: parseInt(metadata.side),
                    teamId: parseInt(metadata.teamId),
                    tacticGroupId: null,
                    waypoints: data.waypoints,
                    postPlantWaypoints: data.postPlantWaypoints,
                    bombCarrier: 1,
                    type: null,
                    creationDate: currentDate,
                    map: metadata.map,
                    isPistol: true,
                    isEco: true,
                    isStandard: true,
                    useLeague: true,
                    useLadder: true,
                    useTournament: true,
                    useScrim: true,
                    status: null,
                    order: null,
                    plantTime: 25,
                    authorId: 181,
                    isGroup: false
                }
            }, null, 2);
        }
        return JSON.stringify(data, null, 2);
    }

    // Конвертация из массивного формата в UI формат
    function convertArrayToUI(data) {
        try {
            const waypoints = convertToUIFormat(data.waypoints);
            const postPlantWaypoints = convertToUIFormat(data.postPlantWaypoints);
            
            return {
                waypoints,
                postPlantWaypoints
            };
        } catch (error) {
            console.error('Ошибка при конвертации в UI формат:', error);
            return null;
        }
    }

    // Конвертация из UI формата в массивный формат
    function convertUIToArray(data) {
        try {
            const waypoints = convertToArrayFormat(data.waypoints);
            const postPlantWaypoints = convertToArrayFormat(data.postPlantWaypoints);
            
            return {
                waypoints,
                postPlantWaypoints
            };
        } catch (error) {
            console.error('Ошибка при конвертации в массивный формат:', error);
            return null;
        }
    }

    // Обработчик кнопки "Копировать"
    copyOutputBtn.addEventListener('click', () => {
        outputData.select();
        document.execCommand('copy');
        
        // Визуальная обратная связь
        const originalText = copyOutputBtn.textContent;
        copyOutputBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyOutputBtn.textContent = originalText;
        }, 1500);
    });

    // Обработчик кнопки "Очистить"
    clearInputBtn.addEventListener('click', () => {
        inputData.value = '';
        outputData.value = '';
    });
    
    // Обработчик кнопки "Конвертировать"
    convertBtn.addEventListener('click', () => {
        const input = inputData.value.trim();
        if (!input) return;
        
        const parsedData = parseInput(input);
        if (!parsedData) {
            alert('Не удалось распознать формат данных. Проверьте ввод.');
            return;
        }
        
        const format = detectFormat(parsedData);
        let dataForFullUI;
        
        if (format === 'array') {
            // Конвертируем в UI формат
            dataForFullUI = convertArrayToUI(parsedData);
        } else if (format === 'ui') {
            // Уже в UI формате
            dataForFullUI = parsedData;
        } else {
            alert('Неизвестный формат данных. Проверьте ввод.');
            return;
        }
        
        if (dataForFullUI) {
            outputData.value = formatOutput(dataForFullUI, 'full-ui');
        }
    });
    
});
