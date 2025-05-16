document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const tacticIdInput = document.getElementById('tactic-id-search');
    const tacticIdContainer = document.getElementById('tactic-id-container');
    const jsonDataTextarea = document.getElementById('json-data');
    const findMapSelect = document.getElementById('find-map');
    const findSideSelect = document.getElementById('find-side');
    const findTacticBtn = document.getElementById('find-tactic');
    const clearJsonBtn = document.getElementById('clear-json');
    const tacticResultContainer = document.getElementById('tactic-result');
    const tacticDataTextarea = document.getElementById('tactic-data');
    const copyTacticBtn = document.getElementById('copy-tactic');
    
    // Обработчики событий
    findTacticBtn.addEventListener('click', findTactic);
    clearJsonBtn.addEventListener('click', clearJsonData);
    copyTacticBtn.addEventListener('click', copyTacticData);
    
    // Функция для автоматического извлечения информации из JSON
    function extractTacticId() {
        const jsonText = jsonDataTextarea.value.trim();
        
        if (!jsonText) {
            tacticIdContainer.style.display = 'none';
            document.getElementById('tactic-map-container').style.display = 'none';
            document.getElementById('tactic-side-container').style.display = 'none';
            return;
        }
        
        // Ищем ID тактики в JSON
        let tacticId = null;
        let tacticMap = null;
        let tacticSide = null;
        
        // Проверяем наличие блока matchData.tactic
        if (jsonText.includes('matchData') && jsonText.includes('tactic:')) {
            console.log('Найден блок matchData.tactic');
            
            // Ищем tacticId в matchData
            const matchDataTacticIdMatch = jsonText.match(/tacticId\s*:\s*(\d+)/);
            if (matchDataTacticIdMatch && matchDataTacticIdMatch[1]) {
                tacticId = parseInt(matchDataTacticIdMatch[1]);
                console.log(`Найден tacticId в matchData: ${tacticId}`);
                
                // Ищем начало блока tactic внутри matchData
                const tacticStart = jsonText.indexOf('tactic:', jsonText.indexOf('matchData'));
                if (tacticStart !== -1) {
                    console.log('Найдено начало блока tactic внутри matchData');
                    
                    // Ищем открывающую фигурную скобку
                    const objectStart = jsonText.indexOf('{', tacticStart);
                    if (objectStart !== -1) {
                        // Извлекаем часть текста для поиска карты и стороны
                        const tacticText = jsonText.substring(objectStart, objectStart + 2000); // Берем первые 2000 символов для поиска
                        console.log('Извлеченный текст tactic:', tacticText.substring(0, 200) + '...');
                        
                        // Ищем карту в блоке tactic
                        const tacticMapMatch = tacticText.match(/map\s*:\s*["|']([^"']*)["|']/);
                        if (tacticMapMatch && tacticMapMatch[1]) {
                            tacticMap = tacticMapMatch[1];
                            console.log(`Найдена карта в блоке tactic: ${tacticMap}`);
                        } else {
                            console.log('Карта не найдена в блоке tactic');
                            // Пробуем другой формат поиска карты
                            const altMapMatch = tacticText.match(/map\s*:\s*([^,}\s]+)/);
                            if (altMapMatch && altMapMatch[1]) {
                                tacticMap = altMapMatch[1].replace(/['"]/g, '');
                                console.log(`Найдена карта в альтернативном формате: ${tacticMap}`);
                            }
                        }
                        
                        // Ищем сторону в блоке tactic
                        const tacticSideMatch = tacticText.match(/side\s*:\s*(\d+)/);
                        if (tacticSideMatch && tacticSideMatch[1]) {
                            tacticSide = parseInt(tacticSideMatch[1]);
                            console.log(`Найдена сторона в блоке tactic: ${tacticSide}`);
                        } else {
                            console.log('Сторона не найдена в блоке tactic');
                        }
                    }
                }
            }
        }
        
        // Если не нашли в matchData.tactic, ищем в других местах
        if (tacticId === null) {
            // Ищем скрытое поле с ID тактики
            const hiddenFieldMatch = jsonText.match(/name="tactic_id"\s+value="(\d+)"/);
            if (hiddenFieldMatch && hiddenFieldMatch[1]) {
                tacticId = parseInt(hiddenFieldMatch[1]);
            } else {
                // Ищем ID тактики в формате tacticId: NUMBER или "tacticId": NUMBER
                const tacticIdMatch = jsonText.match(/["|']?tacticId["|']?\s*:\s*(\d+)/);
                if (tacticIdMatch && tacticIdMatch[1]) {
                    tacticId = parseInt(tacticIdMatch[1]);
                    console.log(`Найден tacticId: ${tacticId}`);
                } else {
                    // Ищем ID тактики в формате id: NUMBER или "id": NUMBER
                    const idMatch = jsonText.match(/["|']?id["|']?\s*:\s*(\d+)/);
                    if (idMatch && idMatch[1]) {
                        tacticId = parseInt(idMatch[1]);
                        console.log(`Найден id: ${tacticId}`);
                    }
                }
            }
        }
        
        // Если не нашли карту в matchData.tactic, ищем в других местах
        if (tacticMap === null) {
            // Ищем карту в JSON
            const mapMatch = jsonText.match(/["|']?map["|']?\s*:\s*["|']([^"']*)["|']/);
            if (mapMatch && mapMatch[1]) {
                tacticMap = mapMatch[1];
            }
        }
        
        // Если не нашли сторону в matchData.tactic, ищем в других местах
        if (tacticSide === null) {
            // Ищем сторону в JSON
            const sideMatch = jsonText.match(/["|']?side["|']?\s*:\s*(\d+)/);
            if (sideMatch && sideMatch[1]) {
                tacticSide = parseInt(sideMatch[1]);
            }
        }
        
        // Отображаем найденную информацию
        if (tacticId) {
            tacticIdInput.value = tacticId;
            tacticIdContainer.style.display = 'flex';
            console.log(`Автоматически найден ID тактики: ${tacticId}`);
            console.log(`Значение поля ID тактики после установки: ${tacticIdInput.value}`);
        } else {
            tacticIdContainer.style.display = 'none';
        }
        
        if (tacticMap) {
            const mapElement = document.getElementById('find-map');
            console.log(`Устанавливаем карту: ${tacticMap}`);
            mapElement.value = tacticMap;
            document.getElementById('tactic-map-container').style.display = 'flex';
            console.log(`Автоматически найдена карта: ${tacticMap}`);
            console.log(`Значение поля карты после установки: ${mapElement.value}`);
        } else {
            document.getElementById('tactic-map-container').style.display = 'none';
        }
        
        if (tacticSide !== null) {
            const sideElement = document.getElementById('find-side');
            const sideText = tacticSide === 1 ? 'CT (1)' : 'T (0)';
            console.log(`Устанавливаем сторону: ${tacticSide} (${sideText})`);
            sideElement.value = sideText;
            document.getElementById('tactic-side-container').style.display = 'flex';
            console.log(`Автоматически найдена сторона: ${tacticSide}`);
            console.log(`Значение поля стороны после установки: ${sideElement.value}`);
        } else {
            document.getElementById('tactic-side-container').style.display = 'none';
        }
    }
    
    // Функция для поиска тактики по ID
    function findTactic() {
        const jsonText = jsonDataTextarea.value.trim();
        
        if (!jsonText) {
            alert('Пожалуйста, вставьте JSON-данные');
            return;
        }
        
        // Извлекаем ID тактики из JSON
        extractTacticId();
        
        // Получаем ID тактики
        let tacticId = parseInt(tacticIdInput.value.trim());
        
        // Если ID тактики не найден, пытаемся найти его в JSON
        if (!tacticId) {
            // Ищем скрытое поле с ID тактики
            const hiddenFieldMatch = jsonText.match(/name="tactic_id"\s+value="(\d+)"/);
            if (hiddenFieldMatch && hiddenFieldMatch[1]) {
                tacticId = parseInt(hiddenFieldMatch[1]);
                tacticIdInput.value = tacticId; // Заполняем поле ввода найденным ID
                tacticIdContainer.style.display = 'flex';
                console.log(`Автоматически найден ID тактики: ${tacticId}`);
            } else {
                // Ищем ID тактики в формате tacticId: NUMBER или "tacticId": NUMBER
                const tacticIdMatch = jsonText.match(/["|']?tacticId["|']?\s*:\s*(\d+)/);
                if (tacticIdMatch && tacticIdMatch[1]) {
                    tacticId = parseInt(tacticIdMatch[1]);
                    tacticIdInput.value = tacticId;
                    tacticIdContainer.style.display = 'flex';
                    console.log(`Автоматически найден tacticId: ${tacticId}`);
                } else {
                    // Ищем ID тактики в формате id: NUMBER или "id": NUMBER
                    const idMatch = jsonText.match(/["|']?id["|']?\s*:\s*(\d+)/);
                    if (idMatch && idMatch[1]) {
                        tacticId = parseInt(idMatch[1]);
                        tacticIdInput.value = tacticId;
                        tacticIdContainer.style.display = 'flex';
                        console.log(`Автоматически найден id: ${tacticId}`);
                    } else {
                        alert('Не удалось найти ID тактики в JSON');
                        return;
                    }
                }
            }
        }
        
        try {
            // Проверяем, содержит ли JSON ID тактики напрямую
            if (jsonText.includes(`id: ${tacticId}`) || jsonText.includes(`"id": ${tacticId}`) || 
                jsonText.includes(`tacticId: ${tacticId}`) || jsonText.includes(`"tacticId": ${tacticId}`)) {
                console.log(`Найден ID тактики ${tacticId} в тексте JSON`);
                
                // Пытаемся найти тактику напрямую в тексте
                // Используем более широкий поиск, чтобы захватить весь блок тактики
                const tacticStartPos = jsonText.indexOf('tactic:');
                if (tacticStartPos !== -1) {
                    console.log('Найден блок tactic напрямую в тексте');
                    
                    // Ищем начало блока тактики
                    const objectStart = jsonText.indexOf('{', tacticStartPos);
                    if (objectStart !== -1) {
                        // Ищем конец блока тактики с учетом вложенности
                        let bracketCount = 1;
                        let objectEnd = objectStart + 1;
                        
                        while (bracketCount > 0 && objectEnd < jsonText.length) {
                            if (jsonText[objectEnd] === '{') {
                                bracketCount++;
                            } else if (jsonText[objectEnd] === '}') {
                                bracketCount--;
                            }
                            objectEnd++;
                        }
                        
                        if (bracketCount === 0) {
                            // Извлекаем весь блок тактики
                            const tacticText = jsonText.substring(objectStart, objectEnd);
                            console.log('Извлечен полный блок тактики');
                            
                            // Проверяем, содержит ли блок нужный ID
                            if (tacticText.includes(`id: ${tacticId}`) || tacticText.includes(`"id": ${tacticId}`) ||
                                tacticText.includes(`tacticId: ${tacticId}`) || tacticText.includes(`"tacticId": ${tacticId}`)) {
                                console.log(`Блок тактики содержит ID ${tacticId}`);
                                
                                // Извлекаем основные поля тактики
                                const nameMatch = /name:\s*"([^"]*)"/.exec(tacticText);
                                const sideMatch = /side:\s*(\d+)/.exec(tacticText);
                                const teamIdMatch = /teamId:\s*(\d+)/.exec(tacticText);
                                const mapMatch = /map:\s*"([^"]*)"/.exec(tacticText);
                                const bombCarrierMatch = /bombCarrier:\s*(\d+)/.exec(tacticText);
                                const plantTimeMatch = /plantTime:\s*(\d+)/.exec(tacticText);
                                
                                // Извлекаем дополнительные поля
                                const isPistolMatch = /isPistol:\s*(true|false)/.exec(tacticText);
                                const isEcoMatch = /isEco:\s*(true|false)/.exec(tacticText);
                                const isStandardMatch = /isStandard:\s*(true|false)/.exec(tacticText);
                                const useLeagueMatch = /useLeague:\s*(true|false)/.exec(tacticText);
                                const useScrimMatch = /useScrim:\s*(true|false)/.exec(tacticText);
                                const useLadderMatch = /useLadder:\s*(true|false)/.exec(tacticText);
                                const useTournamentMatch = /useTournament:\s*(true|false)/.exec(tacticText);
                                
                                // Ищем team_id в формате a.id = 3782;
                                let teamId = 3782; // Значение по умолчанию
                                const aIdMatch = /a\.id\s*=\s*(\d+)/.exec(jsonText);
                                if (aIdMatch && aIdMatch[1]) {
                                    teamId = parseInt(aIdMatch[1]);
                                    console.log(`Найден team_id в формате a.id: ${teamId}`);
                                } else if (teamIdMatch && teamIdMatch[1]) {
                                    teamId = parseInt(teamIdMatch[1]);
                                    console.log(`Найден team_id в формате teamId: ${teamId}`);
                                }
                                
                                // Создаем объект тактики
                                const tactic = {
                                    id: tacticId,
                                    name: nameMatch ? nameMatch[1] : 'Неизвестная тактика',
                                    side: sideMatch ? parseInt(sideMatch[1]) : 0,
                                    teamId: teamId,
                                    map: mapMatch ? mapMatch[1] : 'train',
                                    bombCarrier: bombCarrierMatch ? parseInt(bombCarrierMatch[1]) : 1,
                                    plantTime: plantTimeMatch ? parseInt(plantTimeMatch[1]) : 25,
                                    isPistol: isPistolMatch ? isPistolMatch[1] === 'true' : true,
                                    isEco: isEcoMatch ? isEcoMatch[1] === 'true' : true,
                                    isStandard: isStandardMatch ? isStandardMatch[1] === 'true' : true,
                                    useLeague: useLeagueMatch ? useLeagueMatch[1] === 'true' : true,
                                    useScrim: useScrimMatch ? useScrimMatch[1] === 'true' : true,
                                    useLadder: useLadderMatch ? useLadderMatch[1] === 'true' : true,
                                    useTournament: useTournamentMatch ? useTournamentMatch[1] === 'true' : true
                                };
                                
                                // Ищем waypoints в тексте тактики
                                if (tacticText.includes('waypoints:')) {
                                    console.log('Найдены waypoints в тактике');
                                    
                                    // Ищем начало массива waypoints
                                    const waypointsStart = tacticText.indexOf('[', tacticText.indexOf('waypoints:'));
                                    if (waypointsStart !== -1) {
                                        // Ищем конец массива waypoints с учетом вложенности
                                        let bracketCount = 1;
                                        let waypointsEnd = waypointsStart + 1;
                                        
                                        while (bracketCount > 0 && waypointsEnd < tacticText.length) {
                                            if (tacticText[waypointsEnd] === '[') {
                                                bracketCount++;
                                            } else if (tacticText[waypointsEnd] === ']') {
                                                bracketCount--;
                                            }
                                            waypointsEnd++;
                                        }
                                        
                                        if (bracketCount === 0) {
                                            // Извлекаем массив waypoints
                                            const waypointsText = tacticText.substring(waypointsStart, waypointsEnd);
                                            console.log('Извлечен массив waypoints');
                                            
                                            // Определяем формат waypoints
                                            if (waypointsText.includes('[[') && waypointsText.includes(']]')) {
                                                // Массивный формат
                                                console.log('Waypoints в массивном формате');
                                                tactic.waypoints = eval(waypointsText); // Используем eval для парсинга массивного формата
                                            } else {
                                                // UI формат
                                                console.log('Waypoints в UI формате');
                                                try {
                                                    tactic.waypoints = JSON.parse(waypointsText);
                                                } catch (error) {
                                                    console.error('Ошибка при парсинге waypoints:', error);
                                                }
                                            }
                                        }
                                    }
                                }
                                
                                // Ищем postPlantWaypoints в тексте тактики
                                if (tacticText.includes('postPlantWaypoints:')) {
                                    console.log('Найдены postPlantWaypoints в тактике');
                                    
                                    // Ищем начало массива postPlantWaypoints
                                    const postPlantWaypointsStart = tacticText.indexOf('[', tacticText.indexOf('postPlantWaypoints:'));
                                    if (postPlantWaypointsStart !== -1) {
                                        // Ищем конец массива postPlantWaypoints с учетом вложенности
                                        let bracketCount = 1;
                                        let postPlantWaypointsEnd = postPlantWaypointsStart + 1;
                                        
                                        while (bracketCount > 0 && postPlantWaypointsEnd < tacticText.length) {
                                            if (tacticText[postPlantWaypointsEnd] === '[') {
                                                bracketCount++;
                                            } else if (tacticText[postPlantWaypointsEnd] === ']') {
                                                bracketCount--;
                                            }
                                            postPlantWaypointsEnd++;
                                        }
                                        
                                        if (bracketCount === 0) {
                                            // Извлекаем массив postPlantWaypoints
                                            const postPlantWaypointsText = tacticText.substring(postPlantWaypointsStart, postPlantWaypointsEnd);
                                            console.log('Извлечен массив postPlantWaypoints');
                                            
                                            // Определяем формат postPlantWaypoints
                                            if (postPlantWaypointsText.includes('[[') && postPlantWaypointsText.includes(']]')) {
                                                // Массивный формат
                                                console.log('PostPlantWaypoints в массивном формате');
                                                tactic.postPlantWaypoints = eval(postPlantWaypointsText); // Используем eval для парсинга массивного формата
                                            } else {
                                                // UI формат
                                                console.log('PostPlantWaypoints в UI формате');
                                                try {
                                                    tactic.postPlantWaypoints = JSON.parse(postPlantWaypointsText);
                                                } catch (error) {
                                                    console.error('Ошибка при парсинге postPlantWaypoints:', error);
                                                }
                                            }
                                        }
                                    }
                                }
                                
                                // Отображаем найденную тактику
                                displayTactic(tactic);
                                return;
                            }
                        }
                    }
                }
            }
            
            // Если не удалось найти тактику напрямую, используем стандартный метод
            console.log('Используем стандартный метод поиска тактики');
            const tactics = extractTacticsFromJSON(jsonText);
            
            if (tactics.length === 0) {
                throw new Error('Не удалось найти блок tactics в JSON');
            }
            
            // Ищем тактику по ID или tacticId
            const tactic = tactics.find(t => t.id === tacticId || t.tacticId === tacticId);
            
            if (!tactic) {
                throw new Error(`Тактика с ID ${tacticId} не найдена`);
            }
            
            // Обновляем отображение карты и стороны
            if (tactic.map) {
                console.log(`Устанавливаем карту: ${tactic.map}`);
                const mapElement = document.getElementById('find-map');
                mapElement.value = tactic.map;
                console.log(`Значение поля карты после установки: ${mapElement.value}`);
                document.getElementById('tactic-map-container').style.display = 'flex';
            } else {
                console.log('Карта не найдена в тактике');
            }
            
            if (tactic.side !== undefined) {
                console.log(`Устанавливаем сторону: ${tactic.side}`);
                const sideElement = document.getElementById('find-side');
                const sideText = tactic.side === 1 ? 'CT (1)' : 'T (0)';
                sideElement.value = sideText;
                console.log(`Значение поля стороны после установки: ${sideElement.value}`);
                document.getElementById('tactic-side-container').style.display = 'flex';
            } else {
                console.log('Сторона не найдена в тактике');
            }
            
            // Отображаем найденную тактику
            displayTactic(tactic);
            
        } catch (error) {
            alert('Ошибка при поиске тактики: ' + error.message);
            console.error('Ошибка при поиске тактики:', error);
        }
    }
    
    // Функция для извлечения тактик из JSON
    function extractTacticsFromJSON(jsonText) {
        try {
            // Выводим в консоль для отладки
            console.log('Начинаем извлечение тактик из JSON');
            
            // Проверяем наличие блока "data": { tactics: [{ ... }] }
            // Этот блок должен быть первым, так как он наиболее специфичен
            if (jsonText.includes('"data"') || jsonText.includes('data:')) {
                console.log('Найден блок data');
                
                // Ищем начало блока data
                let dataStart = jsonText.indexOf('"data"');
                if (dataStart === -1) {
                    dataStart = jsonText.indexOf('data:');
                }
                
                if (dataStart !== -1) {
                    console.log('Найдено начало блока data');
                    
                    // Ищем начало блока tactics внутри data
                    const tacticsStart = jsonText.indexOf('tactics:', dataStart);
                    if (tacticsStart !== -1) {
                        console.log('Найден блок tactics внутри data');
                        
                        // Ищем открывающую скобку массива
                        const arrayStart = jsonText.indexOf('[', tacticsStart);
                        if (arrayStart !== -1) {
                            console.log('Найдена открывающая скобка массива');
                            
                            // Ищем закрывающую скобку массива с учетом вложенности
                            let bracketCount = 1;
                            let arrayEnd = arrayStart + 1;
                            
                            while (bracketCount > 0 && arrayEnd < jsonText.length) {
                                if (jsonText[arrayEnd] === '[') {
                                    bracketCount++;
                                } else if (jsonText[arrayEnd] === ']') {
                                    bracketCount--;
                                }
                                arrayEnd++;
                            }
                            
                            if (bracketCount === 0) {
                                console.log('Найдена закрывающая скобка массива');
                                
                                // Извлекаем блок tactics
                                const tacticsBlock = jsonText.substring(arrayStart, arrayEnd);
                                console.log('Извлечен блок tactics:', tacticsBlock.substring(0, 100) + '...');
                                
                                // Пытаемся парсить как JSON
                                try {
                                    const tacticsJSON = JSON.parse(tacticsBlock);
                                    console.log('Успешно распарсен блок tactics');
                                    return tacticsJSON;
                                } catch (jsonError) {
                                    console.error('Ошибка при парсинге блока tactics:', jsonError);
                                    
                                    // Если не удалось парсить как JSON, пробуем обернуть в квадратные скобки
                                    try {
                                        const wrappedJSON = JSON.parse(`[${tacticsBlock}]`);
                                        console.log('Успешно распарсен обернутый блок tactics');
                                        return wrappedJSON;
                                    } catch (wrapError) {
                                        console.error('Ошибка при парсинге обернутого блока tactics:', wrapError);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Сначала пробуем парсить весь JSON
            try {
                console.log('Пробуем парсить весь JSON');
                const jsonData = JSON.parse(jsonText);
                console.log('JSON успешно распарсен');
                
                // Если это объект с полем tactic
                if (jsonData.tactic) {
                    console.log('Найдено поле tactic в корне JSON');
                    return [jsonData.tactic]; // Возвращаем массив с одной тактикой
                }
                
                // Если это объект с полем tactics
                if (jsonData.tactics && Array.isArray(jsonData.tactics)) {
                    console.log('Найдено поле tactics в корне JSON');
                    return jsonData.tactics;
                }
                
                // Если это объект с полем data.tactics
                if (jsonData.data && jsonData.data.tactics && Array.isArray(jsonData.data.tactics)) {
                    console.log('Найдено поле data.tactics');
                    return jsonData.data.tactics;
                }
                
                // Если это массив, предполагаем, что это и есть tactics
                if (Array.isArray(jsonData)) {
                    console.log('JSON является массивом');
                    return jsonData;
                }
                
                // Ищем тактики в любом вложенном объекте
                console.log('Ищем тактики в любом вложенном объекте');
                for (const key in jsonData) {
                    if (typeof jsonData[key] === 'object' && jsonData[key] !== null) {
                        console.log(`Проверяем объект ${key}`);
                        
                        // Проверяем, есть ли тактики в data
                        if (key === 'data' && jsonData[key].tactics) {
                            console.log('Найдены тактики в объекте data');
                            return jsonData[key].tactics;
                        }
                        
                        if (Array.isArray(jsonData[key]) && jsonData[key].length > 0 && 
                            typeof jsonData[key][0] === 'object' && jsonData[key][0].id && 
                            (jsonData[key][0].waypoints || jsonData[key][0].postPlantWaypoints)) {
                            console.log(`Найден массив объектов с id и waypoints в поле ${key}`);
                            return jsonData[key];
                        }
                        
                        // Рекурсивно ищем в дочерних объектах
                        if (jsonData[key].tactics && Array.isArray(jsonData[key].tactics)) {
                            console.log(`Найдено поле tactics в объекте ${key}`);
                            return jsonData[key].tactics;
                        }
                        
                        // Рекурсивно ищем в дочерних объектах
                        if (typeof jsonData[key] === 'object' && jsonData[key] !== null) {
                            console.log(`Рекурсивно ищем в объекте ${key}`);
                            for (const subKey in jsonData[key]) {
                                if (typeof jsonData[key][subKey] === 'object' && jsonData[key][subKey] !== null) {
                                    console.log(`Проверяем объект ${key}.${subKey}`);
                                    
                                    // Проверяем, есть ли тактики
                                    if (subKey === 'tactics' && Array.isArray(jsonData[key][subKey])) {
                                        console.log(`Найдено поле tactics в объекте ${key}.${subKey}`);
                                        return jsonData[key][subKey];
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (jsonError) {
                console.error('Ошибка при парсинге JSON:', jsonError);
            }
            
            // Если не удалось парсить весь JSON, пробуем найти блок tactic
            console.log('Ищем блок tactic в тексте JSON');
            if (jsonText.includes('tactic:')) {
                console.log('Найден текст "tactic:"');
                
                // Ищем начало блока tactic
                const tacticStart = jsonText.indexOf('tactic:');
                if (tacticStart !== -1) {
                    console.log('Найдено начало блока tactic');
                    
                    // Ищем открывающую фигурную скобку
                    const objectStart = jsonText.indexOf('{', tacticStart);
                    if (objectStart !== -1) {
                        console.log('Найдена открывающая фигурная скобка');
                        
                        // Ищем закрывающую фигурную скобку с учетом вложенности
                        let bracketCount = 1;
                        let objectEnd = objectStart + 1;
                        
                        while (bracketCount > 0 && objectEnd < jsonText.length) {
                            if (jsonText[objectEnd] === '{') {
                                bracketCount++;
                            } else if (jsonText[objectEnd] === '}') {
                                bracketCount--;
                            }
                            objectEnd++;
                        }
                        
                        if (bracketCount === 0) {
                            console.log('Найдена закрывающая фигурная скобка');
                            
                            // Извлекаем блок tactic
                            const tacticBlock = jsonText.substring(objectStart, objectEnd);
                            console.log('Извлечен блок tactic:', tacticBlock.substring(0, 100) + '...');
                            
                            // Пытаемся парсить как JSON
                            try {
                                const tacticJSON = JSON.parse(tacticBlock);
                                console.log('Успешно распарсен блок tactic');
                                return [tacticJSON]; // Возвращаем массив с одной тактикой
                            } catch (jsonError) {
                                console.error('Ошибка при парсинге блока tactic:', jsonError);
                            }
                        }
                    }
                }
            }
            
            // Если не удалось найти блок tactic, пробуем найти блок tactics
            console.log('Ищем блок tactics в тексте JSON');
            if (jsonText.includes('tactics:')) {
                console.log('Найден текст "tactics:"');
                
                // Ищем начало блока tactics
                const tacticsStart = jsonText.indexOf('tactics:');
                if (tacticsStart !== -1) {
                    console.log('Найдено начало блока tactics');
                    
                    // Ищем открывающую скобку массива
                    const arrayStart = jsonText.indexOf('[', tacticsStart);
                    if (arrayStart !== -1) {
                        console.log('Найдена открывающая скобка массива');
                        
                        // Ищем закрывающую скобку массива с учетом вложенности
                        let bracketCount = 1;
                        let arrayEnd = arrayStart + 1;
                        
                        while (bracketCount > 0 && arrayEnd < jsonText.length) {
                            if (jsonText[arrayEnd] === '[') {
                                bracketCount++;
                            } else if (jsonText[arrayEnd] === ']') {
                                bracketCount--;
                            }
                            arrayEnd++;
                        }
                        
                        if (bracketCount === 0) {
                            console.log('Найдена закрывающая скобка массива');
                            
                            // Извлекаем блок tactics
                            const tacticsBlock = jsonText.substring(arrayStart, arrayEnd);
                            console.log('Извлечен блок tactics:', tacticsBlock.substring(0, 100) + '...');
                            
                            // Пытаемся парсить как JSON
                            try {
                                const tacticsJSON = JSON.parse(tacticsBlock);
                                console.log('Успешно распарсен блок tactics');
                                return tacticsJSON;
                            } catch (jsonError) {
                                console.error('Ошибка при парсинге блока tactics:', jsonError);
                                
                                // Если не удалось парсить как JSON, пробуем обернуть в квадратные скобки
                                try {
                                    const wrappedJSON = JSON.parse(`[${tacticsBlock}]`);
                                    console.log('Успешно распарсен обернутый блок tactics');
                                    return wrappedJSON;
                                } catch (wrapError) {
                                    console.error('Ошибка при парсинге обернутого блока tactics:', wrapError);
                                }
                            }
                        }
                    }
                }
            }
            
            // Ищем тактику в структуре matchData.tactic
            console.log('Ищем тактику в структуре matchData.tactic');
            if (jsonText.includes('matchData') && jsonText.includes('tactic:')) {
                console.log('Найдены блоки matchData и tactic');
                
                // Ищем начало блока tactic внутри matchData
                const tacticStart = jsonText.indexOf('tactic:', jsonText.indexOf('matchData'));
                if (tacticStart !== -1) {
                    console.log('Найдено начало блока tactic внутри matchData');
                    
                    // Ищем открывающую фигурную скобку
                    const objectStart = jsonText.indexOf('{', tacticStart);
                    if (objectStart !== -1) {
                        console.log('Найдена открывающая фигурная скобка');
                        
                        // Ищем закрывающую фигурную скобку с учетом вложенности
                        let bracketCount = 1;
                        let objectEnd = objectStart + 1;
                        
                        while (bracketCount > 0 && objectEnd < jsonText.length) {
                            if (jsonText[objectEnd] === '{') {
                                bracketCount++;
                            } else if (jsonText[objectEnd] === '}') {
                                bracketCount--;
                            }
                            objectEnd++;
                        }
                        
                        if (bracketCount === 0) {
                            console.log('Найдена закрывающая фигурная скобка');
                            
                            // Извлекаем блок tactic
                            const tacticBlock = jsonText.substring(objectStart, objectEnd);
                            console.log('Извлечен блок tactic из matchData:', tacticBlock.substring(0, 100) + '...');
                            
                            try {
                                // Пытаемся парсить как JSON
                                const tacticJSON = JSON.parse(tacticBlock);
                                console.log('Успешно распарсен блок tactic из matchData');
                                return [tacticJSON]; // Возвращаем массив с одной тактикой
                            } catch (jsonError) {
                                console.error('Ошибка при парсинге блока tactic из matchData:', jsonError);
                                
                                // Если не удалось парсить напрямую, пробуем извлечь данные вручную
                                try {
                                    // Ищем ID тактики
                                    const idMatch = /id:\s*(\d+)/.exec(tacticBlock);
                                    if (idMatch && idMatch[1]) {
                                        const tacticId = parseInt(idMatch[1]);
                                        console.log(`Найден ID тактики: ${tacticId}`);
                                        
                                        // Ищем другие поля
                                        const nameMatch = /name:\s*"([^"]*)"/.exec(tacticBlock);
                                        const sideMatch = /side:\s*(\d+)/.exec(tacticBlock);
                                        const teamIdMatch = /teamId:\s*(\d+)/.exec(tacticBlock);
                                        const mapMatch = /map:\s*"([^"]*)"/.exec(tacticBlock);
                                        
                                        // Функция для извлечения waypoints из текста
                                        function extractWaypointsFromText(text) {
                                            try {
                                                // Ищем начало массива waypoints
                                                const waypointsStart = text.indexOf('[', text.indexOf('waypoints:'));
                                                if (waypointsStart !== -1) {
                                                    // Ищем конец массива waypoints с учетом вложенности
                                                    let bracketCount = 1;
                                                    let waypointsEnd = waypointsStart + 1;
                                                    
                                                    while (bracketCount > 0 && waypointsEnd < text.length) {
                                                        if (text[waypointsEnd] === '[') {
                                                            bracketCount++;
                                                        } else if (text[waypointsEnd] === ']') {
                                                            bracketCount--;
                                                        }
                                                        waypointsEnd++;
                                                    }
                                                    
                                                    if (bracketCount === 0) {
                                                        // Извлекаем массив waypoints
                                                        const waypointsText = text.substring(waypointsStart, waypointsEnd);
                                                        console.log('Извлечен массив waypoints');
                                                        
                                                        // Определяем формат waypoints
                                                        if (waypointsText.includes('[[') && waypointsText.includes(']]')) {
                                                            // Массивный формат
                                                            console.log('Waypoints в массивном формате');
                                                            return eval(waypointsText); // Используем eval для парсинга массивного формата
                                                        }
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Ошибка при извлечении waypoints из текста:', error);
                                            }
                                            
                                            return []; // Возвращаем пустой массив, если не удалось извлечь waypoints
                                        }
                                        
                                        // Функция для извлечения postPlantWaypoints из текста
                                        function extractPostPlantWaypointsFromText(text) {
                                            try {
                                                // Ищем начало массива postPlantWaypoints
                                                const postPlantWaypointsStart = text.indexOf('[', text.indexOf('postPlantWaypoints:'));
                                                if (postPlantWaypointsStart !== -1) {
                                                    // Ищем конец массива postPlantWaypoints с учетом вложенности
                                                    let bracketCount = 1;
                                                    let postPlantWaypointsEnd = postPlantWaypointsStart + 1;
                                                    
                                                    while (bracketCount > 0 && postPlantWaypointsEnd < text.length) {
                                                        if (text[postPlantWaypointsEnd] === '[') {
                                                            bracketCount++;
                                                        } else if (text[postPlantWaypointsEnd] === ']') {
                                                            bracketCount--;
                                                        }
                                                        postPlantWaypointsEnd++;
                                                    }
                                                    
                                                    if (bracketCount === 0) {
                                                        // Извлекаем массив postPlantWaypoints
                                                        const postPlantWaypointsText = text.substring(postPlantWaypointsStart, postPlantWaypointsEnd);
                                                        console.log('Извлечен массив postPlantWaypoints');
                                                        
                                                        // Определяем формат postPlantWaypoints
                                                        if (postPlantWaypointsText.includes('[[') && postPlantWaypointsText.includes(']]')) {
                                                            // Массивный формат
                                                            console.log('PostPlantWaypoints в массивном формате');
                                                            return eval(postPlantWaypointsText); // Используем eval для парсинга массивного формата
                                                        }
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Ошибка при извлечении postPlantWaypoints из текста:', error);
                                            }
                                            
                                            return []; // Возвращаем пустой массив, если не удалось извлечь postPlantWaypoints
                                        }
                                        
                                        // Ищем tacticId в matchData
                                        const tacticIdMatch = jsonText.match(/tacticId\s*:\s*(\d+)/);
                                        let matchDataTacticId = null;
                                        if (tacticIdMatch && tacticIdMatch[1]) {
                                            matchDataTacticId = parseInt(tacticIdMatch[1]);
                                            console.log(`Найден tacticId в matchData: ${matchDataTacticId}`);
                                        }
                                        
                                        // Создаем объект тактики
                                        const tactic = {
                                            id: tacticId,
                                            tacticId: matchDataTacticId, // Добавляем tacticId из matchData
                                            name: nameMatch ? nameMatch[1] : 'Неизвестная тактика',
                                            side: sideMatch ? parseInt(sideMatch[1]) : 0,
                                            teamId: teamIdMatch ? parseInt(teamIdMatch[1]) : 3782,
                                            map: mapMatch ? mapMatch[1] : 'train',
                                            waypoints: extractWaypointsFromText(tacticBlock),
                                            postPlantWaypoints: extractPostPlantWaypointsFromText(tacticBlock)
                                        };
                                        
                                        return [tactic];
                                    }
                                } catch (extractError) {
                                    console.error('Ошибка при извлечении данных тактики:', extractError);
                                }
                            }
                        }
                    }
                }
            }
            
            // Пробуем найти блок tactics в формате "tactics: [{"
            console.log('Ищем блок tactics в формате "tactics: [{"');
            const tacticsRegex = /tactics\s*:\s*\[\s*\{\s*id\s*:/;
            if (tacticsRegex.test(jsonText)) {
                console.log('Найден блок tactics в формате "tactics: [{"');
                
                // Находим все объекты тактик
                const tacticObjects = [];
                let startPos = 0;
                
                // Ищем все вхождения "id: NUMBER" после "tactics:"
                const idRegex = /id\s*:\s*(\d+)/g;
                let idMatch;
                let tacticsStartPos = jsonText.indexOf('tactics:');
                
                while ((idMatch = idRegex.exec(jsonText)) !== null) {
                    // Проверяем, что это id после "tactics:"
                    if (idMatch.index > tacticsStartPos) {
                        const tacticId = parseInt(idMatch[1]);
                        console.log(`Найден id: ${tacticId}`);
                        
                        // Ищем начало объекта тактики (открывающую фигурную скобку)
                        let objectStart = jsonText.lastIndexOf('{', idMatch.index);
                        if (objectStart !== -1) {
                            console.log(`Найдено начало объекта тактики с id: ${tacticId}`);
                            
                            // Ищем конец объекта тактики (закрывающую фигурную скобку)
                            let bracketCount = 1;
                            let objectEnd = idMatch.index;
                            
                            while (bracketCount > 0 && objectEnd < jsonText.length) {
                                objectEnd++;
                                if (jsonText[objectEnd] === '{') {
                                    bracketCount++;
                                } else if (jsonText[objectEnd] === '}') {
                                    bracketCount--;
                                }
                            }
                            
                            if (bracketCount === 0) {
                                console.log(`Найден конец объекта тактики с id: ${tacticId}`);
                                
                                // Извлекаем объект тактики
                                const tacticText = jsonText.substring(objectStart, objectEnd + 1);
                                console.log(`Извлечен объект тактики с id: ${tacticId}`, tacticText.substring(0, 100) + '...');
                                
                                try {
                                    // Пытаемся парсить как JSON
                                    const tacticObject = JSON.parse(tacticText);
                                    console.log(`Успешно распарсен объект тактики с id: ${tacticId}`);
                                    
                                    // Проверяем, что это объект тактики
                                    if (tacticObject.id === tacticId && 
                                        (tacticObject.waypoints || tacticObject.postPlantWaypoints)) {
                                        console.log(`Объект с id: ${tacticId} является тактикой`);
                                        tacticObjects.push(tacticObject);
                                    }
                                } catch (error) {
                                    console.error(`Ошибка при парсинге объекта тактики с id: ${tacticId}:`, error);
                                }
                            }
                        }
                    }
                }
                
                if (tacticObjects.length > 0) {
                    console.log(`Найдено ${tacticObjects.length} тактик`);
                    return tacticObjects;
                }
            }
            
            // Пробуем найти массив объектов с id и waypoints
            console.log('Ищем массив объектов с id и waypoints');
            const idRegex = /"id"\s*:\s*(\d+)/g;
            const waypointsRegex = /"waypoints"\s*:/g;
            
            if (idRegex.test(jsonText) && waypointsRegex.test(jsonText)) {
                console.log('Найдены объекты с id и waypoints');
                
                // Пробуем найти все объекты с id и waypoints
                const objRegex = /\{[^{}]*"id"\s*:\s*\d+[^{}]*"waypoints"\s*:[^{}]*\}/g;
                const matches = jsonText.match(objRegex);
                
                if (matches && matches.length > 0) {
                    console.log(`Найдено ${matches.length} объектов с id и waypoints`);
                    
                    // Пытаемся парсить каждый объект
                    const tactics = [];
                    
                    for (const match of matches) {
                        try {
                            const tactic = JSON.parse(match);
                            if (tactic.id && (tactic.waypoints || tactic.postPlantWaypoints)) {
                                console.log(`Объект с id: ${tactic.id} является тактикой`);
                                tactics.push(tactic);
                            }
                        } catch (objError) {
                            console.error('Ошибка при парсинге объекта тактики:', objError);
                        }
                    }
                    
                    if (tactics.length > 0) {
                        console.log(`Найдено ${tactics.length} тактик`);
                        return tactics;
                    }
                }
            }
            
            // Последняя попытка - просто ищем все объекты с id в JSON
            console.log('Последняя попытка - ищем все объекты с id в JSON');
            const allIdMatches = [];
            let idMatch;
            const allIdRegex = /id\s*:\s*(\d+)/g;
            
            while ((idMatch = allIdRegex.exec(jsonText)) !== null) {
                const tacticId = parseInt(idMatch[1]);
                console.log(`Найден id: ${tacticId}`);
                
                // Ищем начало объекта (открывающую фигурную скобку)
                let objectStart = jsonText.lastIndexOf('{', idMatch.index);
                if (objectStart !== -1) {
                    console.log(`Найдено начало объекта с id: ${tacticId}`);
                    
                    // Ищем конец объекта (закрывающую фигурную скобку)
                    let bracketCount = 1;
                    let objectEnd = idMatch.index;
                    
                    while (bracketCount > 0 && objectEnd < jsonText.length) {
                        objectEnd++;
                        if (jsonText[objectEnd] === '{') {
                            bracketCount++;
                        } else if (jsonText[objectEnd] === '}') {
                            bracketCount--;
                        }
                    }
                    
                    if (bracketCount === 0) {
                        console.log(`Найден конец объекта с id: ${tacticId}`);
                        
                        // Извлекаем объект
                        const objectText = jsonText.substring(objectStart, objectEnd + 1);
                        
                        try {
                            // Пытаемся парсить как JSON
                            const object = JSON.parse(objectText);
                            console.log(`Успешно распарсен объект с id: ${tacticId}`);
                            
                            // Проверяем, что это объект тактики
                            if (object.id === tacticId && 
                                (object.waypoints || object.postPlantWaypoints || 
                                 object.map || object.side || object.teamId)) {
                                console.log(`Объект с id: ${tacticId} похож на тактику`);
                                allIdMatches.push(object);
                            }
                        } catch (error) {
                            console.error(`Ошибка при парсинге объекта с id: ${tacticId}:`, error);
                        }
                    }
                }
            }
            
            if (allIdMatches.length > 0) {
                console.log(`Найдено ${allIdMatches.length} объектов с id`);
                return allIdMatches;
            }
            
            console.log('Не удалось найти тактики в JSON');
            return [];
        } catch (error) {
            console.error('Ошибка при извлечении тактик из JSON:', error);
            return [];
        }
    }
    
    // Функция для отображения найденной тактики
    function displayTactic(tactic) {
        // Преобразуем тактику в требуемый формат
        const formattedTactic = formatTacticToFullUI(tactic);
        
        // Форматируем тактику в JSON
        const formattedJSON = JSON.stringify(formattedTactic, null, 2);
        
        // Отображаем тактику
        tacticDataTextarea.value = formattedJSON;
        
        // Обновляем поля ввода в верхней части формы
        if (formattedTactic.map) {
            console.log(`Обновляем поле карты: ${formattedTactic.map}`);
            const mapElement = document.getElementById('find-map');
            mapElement.value = formattedTactic.map;
            document.getElementById('tactic-map-container').style.display = 'flex';
            console.log(`Значение поля карты после обновления: ${mapElement.value}`);
        }
        
        if (formattedTactic.side !== undefined) {
            console.log(`Обновляем поле стороны: ${formattedTactic.side}`);
            const sideElement = document.getElementById('find-side');
            const sideText = formattedTactic.side === 1 ? 'CT (1)' : 'T (0)';
            sideElement.value = sideText;
            document.getElementById('tactic-side-container').style.display = 'flex';
            console.log(`Значение поля стороны после обновления: ${sideElement.value}`);
        }
        
        // Показываем результат
        tacticResultContainer.style.display = 'block';
    }
    
    // Функция для преобразования тактики в формат full-ui
    function formatTacticToFullUI(tactic) {
        console.log('Преобразуем тактику в формат full-ui');
        
        // Создаем объект в требуемом формате
        const formattedTactic = {
            team_id: tactic.teamId || 3782, // Используем teamId из тактики или значение по умолчанию
            name: tactic.name || 'Неизвестная тактика',
            map: tactic.map || 'train',
            side: tactic.side !== undefined ? tactic.side : 0,
            selectedTacticTypes: ["pistol", "standard", "eco"],
            selectedMatchTypes: ["league", "scrim", "ladder", "tournament"],
            loadouts: [],
            bomb_carrier: tactic.bombCarrier || 1,
            plantTime: tactic.plantTime || 25,
            waypoints: [],
            postPlantWaypoints: [],
            isDraft: true // Устанавливаем isDraft в true для рабочего формата
        };
        
        // Копируем waypoints и postPlantWaypoints, если они есть
        if (tactic.waypoints) {
            console.log('Обрабатываем waypoints');
            
            // Проверяем формат waypoints
            if (Array.isArray(tactic.waypoints) && tactic.waypoints.length > 0) {
                // Преобразуем в UI формат и нормализуем номера
                console.log('Преобразуем waypoints в UI формат');
                const uiWaypoints = convertToUIWaypoints(tactic.waypoints);
                
                // Нормализуем номера waypoints для каждого игрока
                formattedTactic.waypoints = normalizeWaypointNumbers(uiWaypoints);
            }
        }
        
        if (tactic.postPlantWaypoints) {
            console.log('Обрабатываем postPlantWaypoints');
            
            // Проверяем формат postPlantWaypoints
            if (Array.isArray(tactic.postPlantWaypoints) && tactic.postPlantWaypoints.length > 0) {
                // Преобразуем в UI формат
                console.log('Преобразуем postPlantWaypoints в UI формат');
                formattedTactic.postPlantWaypoints = convertToUIWaypoints(tactic.postPlantWaypoints);
            }
        }
        
        // Устанавливаем значения из дополнительных полей, если они есть
        if (tactic.isPistol !== undefined) formattedTactic.selectedTacticTypes[0] = "pistol";
        if (tactic.isStandard !== undefined) formattedTactic.selectedTacticTypes[1] = "standard";
        if (tactic.isEco !== undefined) formattedTactic.selectedTacticTypes[2] = "eco";
        
        if (tactic.useLeague !== undefined) formattedTactic.selectedMatchTypes[0] = "league";
        if (tactic.useScrim !== undefined) formattedTactic.selectedMatchTypes[1] = "scrim";
        if (tactic.useLadder !== undefined) formattedTactic.selectedMatchTypes[2] = "ladder";
        if (tactic.useTournament !== undefined) formattedTactic.selectedMatchTypes[3] = "tournament";
        
        return formattedTactic;
    }
    
    // Функция для нормализации номеров waypoints
    function normalizeWaypointNumbers(waypoints) {
        console.log('Нормализуем номера waypoints');
        
        // Группируем waypoints по игрокам
        const playerWaypoints = {};
        
        // Распределяем waypoints по игрокам
        for (const waypoint of waypoints) {
            const player = waypoint.player;
            if (!playerWaypoints[player]) {
                playerWaypoints[player] = [];
            }
            playerWaypoints[player].push(waypoint);
        }
        
        // Нормализуем номера для каждого игрока
        const normalizedWaypoints = [];
        
        for (const player in playerWaypoints) {
            // Сортируем waypoints по номеру (если есть) или по порядку
            const sortedWaypoints = playerWaypoints[player].sort((a, b) => {
                // Если номера - числа, сортируем по числам
                if (!isNaN(a.number) && !isNaN(b.number)) {
                    return parseInt(a.number) - parseInt(b.number);
                }
                // Иначе сохраняем порядок
                return 0;
            });
            
            // Присваиваем последовательные номера
            for (let i = 0; i < sortedWaypoints.length; i++) {
                const waypoint = sortedWaypoints[i];
                
                // Создаем новый объект waypoint с нормализованными полями
                const normalizedWaypoint = {
                    x: waypoint.x,
                    y: waypoint.y,
                    viewAngle: waypoint.viewAngle,
                    type: waypoint.type,
                    syncTime: typeof waypoint.syncTime === 'string' ? waypoint.syncTime : "2", // Преобразуем syncTime в строку
                    player: parseInt(player),
                    number: i + 1 // Присваиваем последовательный номер
                };
                
                // Добавляем nade, если есть
                if (waypoint.nade) {
                    normalizedWaypoint.nade = {
                        x: waypoint.nade.x,
                        y: waypoint.nade.y,
                        type: waypoint.nade.type || 1 // По умолчанию тип 1, если не указан
                    };
                } else if (waypoint.type === 0 && i > 0) {
                    // Для точек типа 0 (кроме первой) добавляем nade с координатами следующей точки
                    const nextWaypoint = sortedWaypoints[i + 1];
                    if (nextWaypoint) {
                        normalizedWaypoint.nade = {
                            x: nextWaypoint.x,
                            y: nextWaypoint.y,
                            type: 1 // По умолчанию тип 1
                        };
                    }
                }
                
                // Для точек типа 0 устанавливаем syncTime в "0"
                if (waypoint.type === 0) {
                    normalizedWaypoint.syncTime = "0";
                }
                
                normalizedWaypoints.push(normalizedWaypoint);
            }
        }
        
        return normalizedWaypoints;
    }
    
    // Функция для преобразования waypoints в UI формат
    function convertToUIWaypoints(waypoints) {
        console.log('Преобразуем waypoints в UI формат');
        
        // Проверяем, есть ли waypoints
        if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
            console.log('Waypoints отсутствуют или пустые');
            return [];
        }
        
        // Проверяем, в каком формате waypoints
        if (Array.isArray(waypoints[0])) {
            // Массивный формат
            if (waypoints[0].length > 0 && Array.isArray(waypoints[0][0])) {
                // Формат [[[x, y, ...], ...], ...]
                console.log('Waypoints в массивном формате [[[x, y, ...], ...], ...]');
                
                // Фильтруем undefined значения
                const filteredWaypoints = waypoints.map(playerWaypoints => {
                    if (!Array.isArray(playerWaypoints)) return [];
                    return playerWaypoints.filter(wp => Array.isArray(wp));
                });
                
                return convertArrayWaypointsToUI(filteredWaypoints);
            } else {
                // Формат [[x, y, ...], ...]
                console.log('Waypoints в массивном формате [[x, y, ...], ...]');
                
                // Фильтруем undefined значения
                const filteredWaypoints = waypoints.filter(wp => Array.isArray(wp) && wp.length >= 6);
                
                // Создаем массив waypoints для каждого игрока
                const playerWaypoints = [];
                for (let i = 0; i < 5; i++) {
                    playerWaypoints.push([]);
                }
                
                // Распределяем waypoints по игрокам
                for (const waypoint of filteredWaypoints) {
                    const playerIndex = 0; // По умолчанию первый игрок
                    playerWaypoints[playerIndex].push(waypoint);
                }
                
                return convertArrayWaypointsToUI(playerWaypoints);
            }
        } else if (typeof waypoints[0] === 'object' && waypoints[0] !== null) {
            // UI формат
            console.log('Waypoints в UI формате');
            return normalizeWaypoints(waypoints);
        } else {
            console.log('Неизвестный формат waypoints');
            return [];
        }
    }
    
    // Функция для нормализации waypoints
    function normalizeWaypoints(waypoints) {
        console.log('Нормализуем waypoints');
        
        return waypoints.map(waypoint => {
            // Создаем новый объект waypoint с нормализованными полями
            const normalizedWaypoint = {
                x: waypoint.x,
                y: waypoint.y,
                viewAngle: waypoint.viewAngle,
                type: waypoint.type,
                syncTime: typeof waypoint.syncTime === 'number' ? 
                    (Number.isInteger(waypoint.syncTime) ? waypoint.syncTime : Math.round(waypoint.syncTime)) : 
                    waypoint.syncTime,
                player: waypoint.player,
                number: waypoint.number
            };
            
            // Добавляем nade, если есть
            if (waypoint.nade) {
                normalizedWaypoint.nade = {
                    x: waypoint.nade.x,
                    y: waypoint.nade.y,
                    type: waypoint.nade.type
                };
            }
            
            return normalizedWaypoint;
        });
    }
    
    // Функция для преобразования массивного формата waypoints в UI формат
    function convertArrayWaypointsToUI(arrayWaypoints) {
        console.log('Преобразуем массивный формат waypoints в UI формат');
        const uiWaypoints = [];
        
        // Проходим по каждому игроку
        for (let playerIndex = 0; playerIndex < arrayWaypoints.length; playerIndex++) {
            const playerWaypoints = arrayWaypoints[playerIndex];
            
            // Проверяем, что playerWaypoints - это массив
            if (Array.isArray(playerWaypoints)) {
                // Проходим по каждой точке игрока
                for (let waypointIndex = 0; waypointIndex < playerWaypoints.length; waypointIndex++) {
                    const waypoint = playerWaypoints[waypointIndex];
                    
                    // Проверяем, что waypoint - это массив
                    if (Array.isArray(waypoint)) {
                        // Создаем точку в UI формате
                        const uiWaypoint = {
                            x: waypoint[0] || 0,
                            y: waypoint[1] || 0,
                            viewAngle: waypoint[2] || 0,
                            type: waypoint[3] || 0,
                            number: waypoint[4] || 0,
                            player: playerIndex + 1,
                            syncTime: waypoint[5] || 0
                        };
                        
                        // Добавляем nade, если есть
                        if (waypoint[6] && waypoint[7] && waypoint[8] !== undefined) {
                            uiWaypoint.nade = {
                                x: waypoint[6],
                                y: waypoint[7],
                                type: waypoint[8]
                            };
                        }
                        
                        uiWaypoints.push(uiWaypoint);
                    }
                }
            }
        }
        
        return uiWaypoints;
    }
    
    // Функция для копирования тактики
    function copyTacticData() {
        tacticDataTextarea.select();
        document.execCommand('copy');
        
        // Показываем сообщение об успешном копировании
        const originalText = copyTacticBtn.textContent;
        copyTacticBtn.textContent = 'Скопировано!';
        copyTacticBtn.style.backgroundColor = '#27ae60';
        
        // Возвращаем оригинальный текст через 1.5 секунды
        setTimeout(() => {
            copyTacticBtn.textContent = originalText;
            copyTacticBtn.style.backgroundColor = '#27ae60';
        }, 1500);
    }
    
    // Функция для очистки данных
    function clearJsonData() {
        jsonDataTextarea.value = '';
        tacticIdInput.value = '';
        tacticIdContainer.style.display = 'none'; // Скрываем поле ID тактики
        document.getElementById('tactic-map-container').style.display = 'none'; // Скрываем поле карты
        document.getElementById('tactic-side-container').style.display = 'none'; // Скрываем поле стороны
        tacticResultContainer.style.display = 'none';
    }
});
