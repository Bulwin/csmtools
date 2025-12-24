document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const newInputData = document.getElementById('new-input-data');
    const newOutputData = document.getElementById('new-output-data');
    const newConvertBtn = document.getElementById('new-convert-btn');
    const newClearBtn = document.getElementById('new-clear-btn');
    const newCopyBtn = document.getElementById('new-copy-btn');
    
    // Метаданные
    const newTeamIdInput = document.getElementById('new-team-id');
    const newTacticNameInput = document.getElementById('new-tactic-name');
    const newMapInput = document.getElementById('new-map');
    const newSideInput = document.getElementById('new-side');
    const newMetadataContainer = document.getElementById('new-metadata-container');
    
    // ============================================
    // DEVALUE PARSER - для сжатого JSON формата
    // ============================================
    
    /**
     * Парсит devalue (Turbo JSON) формат - сжатый JSON с индексами
     * Формат: массив где объекты/массивы ссылаются на другие элементы по индексу
     */
    function parseDevalue(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }
        
        const hydrated = new Array(data.length);
        const deferred = [];
        
        // Первый проход - создаём объекты/массивы
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            
            if (value === null || typeof value !== 'object') {
                // Примитивы
                hydrated[i] = value;
            } else if (Array.isArray(value)) {
                // Это массив с данными - нужно разрешить ссылки
                if (value.length === 2 && value[0] === 'Date') {
                    // Специальный тип Date
                    hydrated[i] = new Date(value[1]);
                } else {
                    // Обычный массив - индексы на другие значения
                    hydrated[i] = [];
                    deferred.push({ target: hydrated[i], indices: value, type: 'array' });
                }
            } else {
                // Объект - ключи со значениями-индексами
                hydrated[i] = {};
                deferred.push({ target: hydrated[i], source: value, type: 'object' });
            }
        }
        
        // Второй проход - разрешаем ссылки
        for (const item of deferred) {
            if (item.type === 'array') {
                for (const index of item.indices) {
                    item.target.push(hydrated[index]);
                }
            } else if (item.type === 'object') {
                for (const [key, index] of Object.entries(item.source)) {
                    item.target[key] = hydrated[index];
                }
            }
        }
        
        // Возвращаем первый элемент как корень
        return hydrated[0];
    }
    
    /**
     * Определяет, является ли строка devalue форматом
     */
    function isDevalueFormat(input) {
        try {
            // Проверяем наличие "data": "[{" паттерна
            if (input.includes('"data"') && input.includes('"simulationData"')) {
                return true;
            }
            
            // Пробуем распарсить как JSON
            const parsed = JSON.parse(input);
            
            // Проверяем наличие поля data со строкой
            if (parsed && typeof parsed.data === 'string') {
                const innerData = JSON.parse(parsed.data);
                // Devalue формат - массив где первый элемент объект с числовыми значениями
                if (Array.isArray(innerData) && innerData.length > 0 && 
                    typeof innerData[0] === 'object' && innerData[0] !== null) {
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Извлекает тактику из devalue формата
     */
    function extractTacticFromDevalue(input) {
        try {
            let innerData;
            
            // Пробуем разные форматы входных данных
            try {
                const parsed = JSON.parse(input);
                
                if (parsed.data) {
                    // Формат: {"data": "[...]"}
                    innerData = JSON.parse(parsed.data);
                } else if (Array.isArray(parsed)) {
                    // Уже массив
                    innerData = parsed;
                } else {
                    throw new Error('Неизвестный формат данных');
                }
            } catch (e) {
                // Может быть просто строка с массивом
                if (input.trim().startsWith('[')) {
                    innerData = JSON.parse(input);
                } else {
                    throw e;
                }
            }
            
            // Разворачиваем devalue формат
            const hydrated = parseDevalue(innerData);
            
            if (!hydrated) {
                throw new Error('Не удалось распарсить devalue формат');
            }
            
            console.log('Распарсенные данные devalue:', hydrated);
            
            // Ищем тактику в структуре (различные пути)
            let tactic = null;
            let teamId = 0;
            
            // Путь 1: hydrated.simulationData.tactic (новый формат симуляции)
            if (hydrated.simulationData && hydrated.simulationData.tactic) {
                tactic = hydrated.simulationData.tactic;
                teamId = hydrated.simulationData.teamId || tactic.teamId || 0;
                console.log('Тактика найдена в simulationData.tactic');
            }
            // Путь 2: hydrated.tactic (прямой путь)
            else if (hydrated.tactic) {
                tactic = hydrated.tactic;
                teamId = tactic.teamId || hydrated.teamId || 0;
                console.log('Тактика найдена в tactic');
            }
            // Путь 3: hydrated.matchData.tactic (старый формат)
            else if (hydrated.matchData && hydrated.matchData.tactic) {
                tactic = hydrated.matchData.tactic;
                teamId = tactic.teamId || hydrated.matchData.teamId || 0;
                console.log('Тактика найдена в matchData.tactic');
            }
            // Путь 4: hydrated сам является тактикой
            else if (hydrated.waypoints) {
                tactic = hydrated;
                teamId = tactic.teamId || 0;
                console.log('Hydrated сам является тактикой');
            }
            
            if (!tactic) {
                console.error('Структура данных:', JSON.stringify(hydrated, null, 2).substring(0, 500));
                throw new Error('Тактика не найдена в распарсенных данных');
            }
            
            console.log('Найдена тактика:', tactic.name, 'waypoints:', Array.isArray(tactic.waypoints) ? tactic.waypoints.length : 'нет');
            
            // Проверяем наличие waypoints
            if (!tactic.waypoints || !Array.isArray(tactic.waypoints)) {
                console.warn('Waypoints отсутствуют или не являются массивом');
            }
            
            // Извлекаем данные тактики
            return {
                id: tactic.id || null,
                name: tactic.name || 'Неизвестная тактика',
                side: tactic.side !== undefined ? tactic.side : 0,
                teamId: teamId || tactic.teamId || 0,
                map: tactic.map || 'train',
                waypoints: Array.isArray(tactic.waypoints) ? tactic.waypoints : [],
                postPlantWaypoints: Array.isArray(tactic.postPlantWaypoints) ? tactic.postPlantWaypoints : [],
                isPistol: tactic.isPistol !== undefined ? tactic.isPistol : true,
                isEco: tactic.isEco !== undefined ? tactic.isEco : true,
                isStandard: tactic.isStandard !== undefined ? tactic.isStandard : true,
                useLeague: tactic.useLeague !== undefined ? tactic.useLeague : true,
                useLadder: tactic.useLadder !== undefined ? tactic.useLadder : true,
                useTournament: tactic.useTournament !== undefined ? tactic.useTournament : true,
                useScrim: tactic.useScrim !== undefined ? tactic.useScrim : true
            };
            
        } catch (error) {
            console.error('Ошибка при извлечении тактики из devalue:', error);
            throw error;
        }
    }
    
    // Обработчик кнопки "Конвертировать"
    newConvertBtn.addEventListener('click', () => {
        const input = newInputData.value.trim();
        if (!input) return;
        
        try {
            let tacticData = null;
            
            // Определяем формат данных
            if (isDevalueFormat(input)) {
                console.log('Обнаружен devalue формат');
                tacticData = extractTacticFromDevalue(input);
            } else {
                // Старый формат - matchData.tactic
                console.log('Используем стандартный парсер');
                tacticData = extractTacticFromJSON(input);
            }
            
            if (!tacticData) {
                alert('Не удалось найти тактику в JSON. Проверьте ввод.');
                return;
            }
            
            // Отображаем метаданные
            displayMetadata(tacticData);
            
            // Конвертируем данные в формат full-ui
            const formattedData = formatToFullUI(tacticData);
            
            // Отображаем результат
            newOutputData.value = JSON.stringify(formattedData, null, 2);
            
        } catch (error) {
            console.error('Ошибка при конвертации:', error);
            alert('Ошибка при конвертации: ' + error.message);
        }
    });
    
    // Обработчик кнопки "Очистить"
    newClearBtn.addEventListener('click', () => {
        newInputData.value = '';
        newOutputData.value = '';
        newMetadataContainer.style.display = 'none';
    });
    
    // Обработчик кнопки "Копировать"
    newCopyBtn.addEventListener('click', () => {
        newOutputData.select();
        document.execCommand('copy');
        
        // Визуальная обратная связь
        const originalText = newCopyBtn.textContent;
        newCopyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            newCopyBtn.textContent = originalText;
        }, 1500);
    });
    
    // Функция для извлечения данных из блока matchData.tactic
    function extractTacticFromJSON(jsonText) {
        try {
            // Ищем ID команды в формате a.id = NUMBER
            let teamId = 3782; // Значение по умолчанию
            const teamIdMatch = jsonText.match(/a\.id\s*=\s*(\d+)/);
            if (teamIdMatch && teamIdMatch[1]) {
                teamId = parseInt(teamIdMatch[1]);
                console.log(`Найден ID команды: ${teamId}`);
            }
            
            // Ищем блок matchData.tactic
            if (jsonText.includes('matchData') && jsonText.includes('tactic:')) {
                console.log('Найден блок matchData.tactic');
                
                // Ищем tacticId в matchData
                const tacticIdMatch = jsonText.match(/tacticId\s*:\s*(\d+)/);
                let tacticId = null;
                if (tacticIdMatch && tacticIdMatch[1]) {
                    tacticId = parseInt(tacticIdMatch[1]);
                    console.log(`Найден tacticId: ${tacticId}`);
                }
                
                // Ищем начало блока tactic внутри matchData
                const tacticStart = jsonText.indexOf('tactic:', jsonText.indexOf('matchData'));
                if (tacticStart !== -1) {
                    console.log('Найдено начало блока tactic внутри matchData');
                    
                    // Ищем открывающую фигурную скобку
                    const objectStart = jsonText.indexOf('{', tacticStart);
                    if (objectStart !== -1) {
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
                            // Извлекаем блок tactic
                            const tacticBlock = jsonText.substring(objectStart, objectEnd);
                            console.log('Извлечен блок tactic из matchData');
                            
                            // Извлекаем данные из блока tactic
                            const nameMatch = /name\s*:\s*"([^"]*)"/.exec(tacticBlock);
                            const sideMatch = /side\s*:\s*(\d+)/.exec(tacticBlock);
                            const mapMatch = /map\s*:\s*"([^"]*)"/.exec(tacticBlock);
                            const isPistolMatch = /isPistol\s*:\s*(true|false)/.exec(tacticBlock);
                            const isEcoMatch = /isEco\s*:\s*(true|false)/.exec(tacticBlock);
                            const isStandardMatch = /isStandard\s*:\s*(true|false)/.exec(tacticBlock);
                            const useLeagueMatch = /useLeague\s*:\s*(true|false)/.exec(tacticBlock);
                            const useLadderMatch = /useLadder\s*:\s*(true|false)/.exec(tacticBlock);
                            const useTournamentMatch = /useTournament\s*:\s*(true|false)/.exec(tacticBlock);
                            const useScrimMatch = /useScrim\s*:\s*(true|false)/.exec(tacticBlock);
                            
                            // Извлекаем waypoints и postPlantWaypoints
                            const waypoints = extractWaypointsFromText(tacticBlock);
                            const postPlantWaypoints = extractPostPlantWaypointsFromText(tacticBlock);
                            
                            // Создаем объект с данными тактики
                            const tacticData = {
                                id: tacticId,
                                name: nameMatch ? nameMatch[1] : 'Неизвестная тактика',
                                side: sideMatch ? parseInt(sideMatch[1]) : 0,
                                teamId: teamId,
                                map: mapMatch ? mapMatch[1] : 'train',
                                waypoints: waypoints,
                                postPlantWaypoints: postPlantWaypoints,
                                isPistol: isPistolMatch ? isPistolMatch[1] === 'true' : true,
                                isEco: isEcoMatch ? isEcoMatch[1] === 'true' : true,
                                isStandard: isStandardMatch ? isStandardMatch[1] === 'true' : true,
                                useLeague: useLeagueMatch ? useLeagueMatch[1] === 'true' : true,
                                useLadder: useLadderMatch ? useLadderMatch[1] === 'true' : true,
                                useTournament: useTournamentMatch ? useTournamentMatch[1] === 'true' : true,
                                useScrim: useScrimMatch ? useScrimMatch[1] === 'true' : true
                            };
                            
                            return tacticData;
                        }
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка при извлечении данных из JSON:', error);
            throw new Error('Не удалось извлечь данные из JSON: ' + error.message);
        }
    }
    
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
            
            return []; // Возвращаем пустой массив, если не удалось извлечь waypoints
        } catch (error) {
            console.error('Ошибка при извлечении waypoints из текста:', error);
            return [];
        }
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
            
            return []; // Возвращаем пустой массив, если не удалось извлечь postPlantWaypoints
        } catch (error) {
            console.error('Ошибка при извлечении postPlantWaypoints из текста:', error);
            return [];
        }
    }
    
    // Функция для отображения метаданных
    function displayMetadata(tacticData) {
        newTeamIdInput.value = tacticData.teamId;
        newTacticNameInput.value = tacticData.name;
        newMapInput.value = tacticData.map;
        newSideInput.value = tacticData.side === 1 ? 'CT (1)' : 'T (0)';
        newMetadataContainer.style.display = 'grid';
    }
    
    // Функция для форматирования данных в формат full-ui
    function formatToFullUI(tacticData) {
        // Конвертируем waypoints в UI формат
        const uiWaypoints = convertToUIFormat(tacticData.waypoints);
        const uiPostPlantWaypoints = convertToUIFormat(tacticData.postPlantWaypoints);
        
        // Создаем массив типов тактик
        const tacticTypes = [];
        if (tacticData.isPistol) tacticTypes.push("pistol");
        if (tacticData.isStandard) tacticTypes.push("standard");
        if (tacticData.isEco) tacticTypes.push("eco");
        
        // Создаем массив типов матчей
        const matchTypes = [];
        if (tacticData.useLeague) matchTypes.push("league");
        if (tacticData.useScrim) matchTypes.push("scrim");
        if (tacticData.useLadder) matchTypes.push("ladder");
        if (tacticData.useTournament) matchTypes.push("tournament");
        
        // Создаем объект в формате full-ui
        return {
            team_id: tacticData.teamId,
            name: tacticData.name,
            map: tacticData.map,
            side: tacticData.side,
            selectedTacticTypes: tacticTypes.length > 0 ? tacticTypes : ["pistol", "standard", "eco"],
            selectedMatchTypes: matchTypes.length > 0 ? matchTypes : ["league", "scrim", "ladder", "tournament"],
            loadouts: [],
            bomb_carrier: 1,
            plantTime: 25,
            waypoints: uiWaypoints,
            postPlantWaypoints: uiPostPlantWaypoints,
            isDraft: true
        };
    }
    
    // Функция для конвертации из массивного формата в UI формат
    function convertToUIFormat(rawWaypoints) {
        const result = [];
        
        if (!Array.isArray(rawWaypoints)) {
            console.error('Ошибка: rawWaypoints не является массивом');
            return result;
        }
        
        rawWaypoints.forEach((playerWaypoints, playerIndex) => {
            if (!Array.isArray(playerWaypoints)) {
                console.error(`Ошибка: waypoints для игрока ${playerIndex + 1} не является массивом`);
                return;
            }
            
            playerWaypoints.forEach((point, i) => {
                if (!Array.isArray(point) || point.length < 5) {
                    console.error(`Ошибка: неверный формат точки для игрока ${playerIndex + 1}, точка ${i + 1}`);
                    return;
                }
                
                const [x, y, viewAngle, type, syncTime, nadeX = 0, nadeY = 0, nadeType = 0] = point;
                
                const obj = {
                    x,
                    y,
                    viewAngle,
                    type,
                    syncTime: String(syncTime), // Всегда сохраняем как строку
                    player: playerIndex + 1,
                    number: i + 1
                };
                
                // Добавляем nade только если хотя бы одно значение не нулевое
                if (nadeX || nadeY || nadeType) {
                    obj.nade = {
                        x: nadeX,
                        y: nadeY,
                        type: nadeType
                    };
                }
                
                result.push(obj);
            });
        });
        
        return result;
    }
});
