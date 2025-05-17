document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const sendInputData = document.getElementById('send-input-data');
    const sendOutputData = document.getElementById('send-output-data');
    const sendConvertBtn = document.getElementById('send-convert-btn');
    const sendClearBtn = document.getElementById('send-clear-btn');
    const sendCopyBtn = document.getElementById('send-copy-btn');
    
    // Метаданные
    const sendTeamIdInput = document.getElementById('send-team-id');
    const sendTacticNameInput = document.getElementById('send-tactic-name');
    const sendMapInput = document.getElementById('send-map');
    const sendSideInput = document.getElementById('send-side');
    const sendMetadataContainer = document.getElementById('send-metadata-container');
    
    // Обработчик кнопки "Конвертировать"
    sendConvertBtn.addEventListener('click', () => {
        const input = sendInputData.value.trim();
        if (!input) return;
        
        try {
            // Извлекаем данные из JSON
            const tacticData = extractTacticFromJSON(input);
            
            if (!tacticData) {
                alert('Не удалось найти блок data.tactic в JSON. Проверьте ввод.');
                return;
            }
            
            // Отображаем метаданные
            displayMetadata(tacticData);
            
            // Конвертируем данные в формат full-ui
            const formattedData = formatToFullUI(tacticData);
            
            // Отображаем результат
            sendOutputData.value = JSON.stringify(formattedData, null, 2);
            
        } catch (error) {
            console.error('Ошибка при конвертации:', error);
            alert('Ошибка при конвертации: ' + error.message);
        }
    });
    
    // Обработчик кнопки "Очистить"
    sendClearBtn.addEventListener('click', () => {
        sendInputData.value = '';
        sendOutputData.value = '';
        sendMetadataContainer.style.display = 'none';
    });
    
    // Обработчик кнопки "Копировать"
    sendCopyBtn.addEventListener('click', () => {
        sendOutputData.select();
        document.execCommand('copy');
        
        // Визуальная обратная связь
        const originalText = sendCopyBtn.textContent;
        sendCopyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            sendCopyBtn.textContent = originalText;
        }, 1500);
    });
    
    // Функция для извлечения данных из блока data.tactic
    function extractTacticFromJSON(jsonText) {
        try {
            // Ищем ID команды в формате a.id = NUMBER
            let teamId = 3782; // Значение по умолчанию
            const teamIdMatch = jsonText.match(/a\.id\s*=\s*(\d+)/);
            if (teamIdMatch && teamIdMatch[1]) {
                teamId = parseInt(teamIdMatch[1]);
                console.log(`Найден ID команды: ${teamId}`);
            }
            
            // Ищем блок data.tactic
            if ((jsonText.includes('"type": "data"') || jsonText.includes("type: 'data'") || jsonText.includes("type: \"data\"")) && 
                (jsonText.includes('"data":') || jsonText.includes('data:')) && 
                (jsonText.includes('"tactic":') || jsonText.includes('tactic:'))) {
                console.log('Найден блок data.tactic');
                
                // Ищем начало блока tactic внутри data
                let dataIndex = jsonText.indexOf('"data":');
                if (dataIndex === -1) dataIndex = jsonText.indexOf('data:');
                
                let tacticStart = jsonText.indexOf('"tactic":', dataIndex);
                if (tacticStart === -1) tacticStart = jsonText.indexOf('tactic:', dataIndex);
                if (tacticStart !== -1) {
                    console.log('Найдено начало блока tactic внутри data');
                    
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
                            console.log('Извлечен блок tactic из data');
                            
                            // Извлекаем данные из блока tactic
                            const idMatch = /id\s*:\s*(\d+)/.exec(tacticBlock);
                            const nameMatch = /name\s*:\s*"([^"]*)"/.exec(tacticBlock);
                            const sideMatch = /side\s*:\s*(\d+)/.exec(tacticBlock);
                            const teamIdMatch = /teamId\s*:\s*(\d+)/.exec(tacticBlock);
                            const mapMatch = /map\s*:\s*"([^"]*)"/.exec(tacticBlock);
                            const isPistolMatch = /isPistol\s*:\s*(true|false)/.exec(tacticBlock);
                            const isEcoMatch = /isEco\s*:\s*(true|false)/.exec(tacticBlock);
                            const isStandardMatch = /isStandard\s*:\s*(true|false)/.exec(tacticBlock);
                            const useLeagueMatch = /useLeague\s*:\s*(true|false)/.exec(tacticBlock);
                            const useLadderMatch = /useLadder\s*:\s*(true|false)/.exec(tacticBlock);
                            const useTournamentMatch = /useTournament\s*:\s*(true|false)/.exec(tacticBlock);
                            const useScrimMatch = /useScrim\s*:\s*(true|false)/.exec(tacticBlock);
                            
                            // Создаем объект с данными тактики
                            const tacticData = {
                                id: idMatch ? parseInt(idMatch[1]) : null,
                                name: nameMatch ? nameMatch[1] : 'Неизвестная тактика',
                                side: sideMatch ? parseInt(sideMatch[1]) : 0,
                                teamId: teamIdMatch ? parseInt(teamIdMatch[1]) : teamId,
                                map: mapMatch ? mapMatch[1] : 'train',
                                waypoints: extractWaypointsFromText(tacticBlock),
                                postPlantWaypoints: extractPostPlantWaypointsFromText(tacticBlock),
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
                    
                    // Пробуем парсить как JSON
                    try {
                        return JSON.parse(waypointsText);
                    } catch (jsonError) {
                        console.error('Ошибка при парсинге waypoints как JSON:', jsonError);
                        
                        // Если не удалось парсить как JSON, пробуем выполнить как код JavaScript
                        try {
                            // Создаем временный объект для хранения результата
                            let result = [];
                            
                            // Выполняем код в контексте временного объекта
                            const code = `result = ${waypointsText}`;
                            eval(code);
                            
                            return result;
                        } catch (evalError) {
                            console.error('Ошибка при выполнении waypoints как код JavaScript:', evalError);
                            return [];
                        }
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
                    
                    // Пробуем парсить как JSON
                    try {
                        return JSON.parse(postPlantWaypointsText);
                    } catch (jsonError) {
                        console.error('Ошибка при парсинге postPlantWaypoints как JSON:', jsonError);
                        
                        // Если не удалось парсить как JSON, пробуем выполнить как код JavaScript
                        try {
                            // Создаем временный объект для хранения результата
                            let result = [];
                            
                            // Выполняем код в контексте временного объекта
                            const code = `result = ${postPlantWaypointsText}`;
                            eval(code);
                            
                            return result;
                        } catch (evalError) {
                            console.error('Ошибка при выполнении postPlantWaypoints как код JavaScript:', evalError);
                            return [];
                        }
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
        sendTeamIdInput.value = tacticData.teamId;
        sendTacticNameInput.value = tacticData.name;
        sendMapInput.value = tacticData.map;
        sendSideInput.value = tacticData.side === 1 ? 'CT (1)' : 'T (0)';
        sendMetadataContainer.style.display = 'grid';
    }
    
    // Функция для форматирования данных в формат full-ui
    function formatToFullUI(tacticData) {
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
            waypoints: tacticData.waypoints,
            postPlantWaypoints: tacticData.postPlantWaypoints,
            isDraft: true
        };
    }
});
