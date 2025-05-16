document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const matchDataTextarea = document.getElementById('match-data');
    const processMatchBtn = document.getElementById('process-match');
    const clearMatchBtn = document.getElementById('clear-match');
    const matchResultsContainer = document.getElementById('match-results');
    const homeTeamScore = document.getElementById('home-team-score');
    const awayTeamScore = document.getElementById('away-team-score');
    const roundsContainer = document.getElementById('rounds-container');
    
    // Обработчики событий
    processMatchBtn.addEventListener('click', processMatchData);
    clearMatchBtn.addEventListener('click', clearMatchData);
    
    // Функция для обработки данных матча
    function processMatchData() {
        const matchDataText = matchDataTextarea.value.trim();
        
        if (!matchDataText) {
            alert('Пожалуйста, вставьте JSON-данные матча');
            return;
        }
        
        try {
            // Создаем массив для хранения данных о тактиках
            const tactics = [];
            
            // Используем простой подход - ищем все строки, содержащие данные о раундах
            const lines = matchDataText.split('\n');
            
            // Переменные для хранения данных текущей тактики
            let currentTactic = {};
            let inTactic = false;
            
            // Проходим по всем строкам
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Если строка содержит начало объекта тактики
                if (line.includes('id:') && line.includes('round:')) {
                    inTactic = true;
                    currentTactic = {};
                    
                    // Извлекаем ID тактики
                    const idMatch = line.match(/id:\s*(\d+)/);
                    if (idMatch) {
                        currentTactic.id = parseInt(idMatch[1]);
                    }
                    
                    // Извлекаем номер раунда
                    const roundMatch = line.match(/round:\s*(\d+)/);
                    if (roundMatch) {
                        currentTactic.round = parseInt(roundMatch[1]);
                    }
                }
                
                // Если мы внутри объекта тактики, извлекаем данные
                if (inTactic) {
                    // Извлекаем название домашней тактики
                    if (line.includes('homeTacticName:')) {
                        const nameMatch = line.match(/homeTacticName:\s*"([^"]*)"|homeTacticName:\s*'([^']*)'/);
                        if (nameMatch) {
                            currentTactic.homeTacticName = nameMatch[1] || nameMatch[2];
                        }
                    }
                    
                    // Извлекаем название гостевой тактики
                    if (line.includes('awayTacticName:')) {
                        const nameMatch = line.match(/awayTacticName:\s*"([^"]*)"|awayTacticName:\s*'([^']*)'/);
                        if (nameMatch) {
                            currentTactic.awayTacticName = nameMatch[1] || nameMatch[2];
                        }
                    }
                    
                    // Извлекаем победителя раунда
                    if (line.includes('won:')) {
                        const wonMatch = line.match(/won:\s*(\d+)/);
                        if (wonMatch) {
                            currentTactic.won = parseInt(wonMatch[1]);
                        }
                    }
                    
                    // Извлекаем сторону
                    if (line.includes('side:')) {
                        const sideMatch = line.match(/side:\s*(\d+)/);
                        if (sideMatch) {
                            currentTactic.side = parseInt(sideMatch[1]);
                        }
                    }
                    
                    // Извлекаем сторону домашней команды
                    if (line.includes('homeSide:')) {
                        const homeSideMatch = line.match(/homeSide:\s*(\d+)/);
                        if (homeSideMatch) {
                            currentTactic.homeSide = parseInt(homeSideMatch[1]);
                        }
                    }
                    
                    // Извлекаем ID гостевой тактики
                    if (line.includes('awayTacticId:')) {
                        const awayTacticIdMatch = line.match(/awayTacticId:\s*(\d+)/);
                        if (awayTacticIdMatch) {
                            currentTactic.awayTacticId = parseInt(awayTacticIdMatch[1]);
                        }
                    }
                    
                    // Извлекаем ID домашней тактики
                    if (line.includes('homeTacticId:')) {
                        const homeTacticIdMatch = line.match(/homeTacticId:\s*(\d+)/);
                        if (homeTacticIdMatch) {
                            currentTactic.homeTacticId = parseInt(homeTacticIdMatch[1]);
                        }
                    }
                    
                    // Если строка содержит конец объекта тактики и у нас есть все необходимые данные
                    if ((line.includes('},') || line.includes('}')) && 
                        currentTactic.round && 
                        currentTactic.homeTacticName && 
                        currentTactic.awayTacticName && 
                        currentTactic.won !== undefined && 
                        currentTactic.homeSide !== undefined && 
                        currentTactic.awayTacticId && 
                        currentTactic.homeTacticId) {
                        
                        // Добавляем тактику в массив
                        tactics.push(currentTactic);
                        inTactic = false;
                    }
                }
            }
            
            // Если не нашли ни одной тактики, пробуем другой подход - ищем данные в примере пользователя
            if (tactics.length === 0) {
                // Пробуем найти данные в формате примера пользователя
                const exampleRegex = /id:\s*(\d+)[^}]*homeTacticName:\s*"([^"]*)"[^}]*awayTacticName:\s*"([^"]*)"[^}]*round:\s*(\d+)[^}]*won:\s*(\d+)[^}]*side:\s*(\d+)[^}]*homeSide:\s*(\d+)[^}]*awayTacticId:\s*(\d+)[^}]*homeTacticId:\s*(\d+)/g;
                
                let match;
                while ((match = exampleRegex.exec(matchDataText)) !== null) {
                    tactics.push({
                        id: parseInt(match[1]),
                        homeTacticName: match[2],
                        awayTacticName: match[3],
                        round: parseInt(match[4]),
                        won: parseInt(match[5]),
                        side: parseInt(match[6]),
                        homeSide: parseInt(match[7]),
                        awayTacticId: parseInt(match[8]),
                        homeTacticId: parseInt(match[9])
                    });
                }
            }
            
            // Если все еще не нашли ни одной тактики, пробуем еще один подход
            if (tactics.length === 0) {
                // Пробуем найти данные в любом формате
                const anyFormatRegex = /round:\s*(\d+)[^}]*won:\s*(\d+)[^}]*side:\s*(\d+)[^}]*homeSide:\s*(\d+)[^}]*homeTacticName:\s*"([^"]*)"|homeTacticName:\s*'([^']*)'[^}]*awayTacticName:\s*"([^"]*)"|awayTacticName:\s*'([^']*)'[^}]*homeTacticId:\s*(\d+)[^}]*awayTacticId:\s*(\d+)/g;
                
                let match;
                while ((match = anyFormatRegex.exec(matchDataText)) !== null) {
                    tactics.push({
                        round: parseInt(match[1]),
                        won: parseInt(match[2]),
                        side: parseInt(match[3]),
                        homeSide: parseInt(match[4]),
                        homeTacticName: match[5] || match[6],
                        awayTacticName: match[7] || match[8],
                        homeTacticId: parseInt(match[9]),
                        awayTacticId: parseInt(match[10])
                    });
                }
            }
            
            // Если не нашли ни одной тактики, сообщаем об ошибке
            if (tactics.length === 0) {
                throw new Error('Не удалось извлечь данные о тактиках. Пожалуйста, проверьте формат данных.');
            }
            
            // Сортируем тактики по номеру раунда
            tactics.sort((a, b) => a.round - b.round);
            
            // Парсим JSON и извлекаем тактики
            allTactics = parseTacticsFromJSON(matchDataText);
            
            // Если не удалось извлечь тактики, показываем сообщение
            if (allTactics.length === 0) {
                console.warn('Не удалось извлечь тактики из JSON. Копирование тактик может не работать.');
            }
            
            // Отображаем результаты
            displayMatchResults(tactics);
            
        } catch (error) {
            alert('Ошибка при обработке данных: ' + error.message);
            console.error('Ошибка при обработке данных:', error);
        }
    }
    
    // Функция для отображения результатов матча
    function displayMatchResults(tactics) {
        // Очищаем контейнер раундов
        roundsContainer.innerHTML = '';
        
        // Подсчитываем счет
        let homeScore = 0;
        let awayScore = 0;
        
        // Создаем элементы для каждого раунда
        tactics.forEach(tactic => {
            // Определяем, поменялись ли стороны (после 15 раунда)
            const sidesSwapped = tactic.round > 15;
            
            // Определяем победителя раунда с учетом смены сторон
            const isHomeSideT = sidesSwapped ? 
                (tactic.homeSide === 1) : // После смены сторон: если homeSide=1 (CT), то теперь они T
                (tactic.homeSide === 0);  // До смены сторон: если homeSide=0, то они T
            const isTWin = tactic.won === 0;
            
            // Обновляем счет с учетом смены сторон
            if ((isHomeSideT && isTWin) || (!isHomeSideT && !isTWin)) {
                homeScore++;
            } else {
                awayScore++;
            }
            
            // Создаем элемент раунда
            const roundElement = document.createElement('div');
            roundElement.className = 'round';
            roundElement.style.marginBottom = '15px';
            roundElement.style.padding = '10px';
            roundElement.style.backgroundColor = '#f8f9fa';
            roundElement.style.borderRadius = '4px';
            roundElement.style.borderLeft = isTWin ? '4px solid #e74c3c' : '4px solid #3498db';
            roundElement.style.position = 'relative'; // Для позиционирования счета
            
            // Заголовок раунда
            const roundHeader = document.createElement('div');
            roundHeader.style.display = 'flex';
            roundHeader.style.justifyContent = 'space-between';
            roundHeader.style.marginBottom = '10px';
            roundHeader.style.fontWeight = 'bold';
            
            // Номер раунда
            const roundNumber = document.createElement('div');
            roundNumber.textContent = `Раунд ${tactic.round}`;
            
            // Добавляем текущий счет большими цифрами по центру
            const scoreDisplay = document.createElement('div');
            scoreDisplay.style.position = 'absolute';
            scoreDisplay.style.top = '50%';
            scoreDisplay.style.left = '50%';
            scoreDisplay.style.transform = 'translate(-50%, -50%)';
            scoreDisplay.style.fontSize = '36px';
            scoreDisplay.style.fontWeight = 'bold';
            scoreDisplay.style.zIndex = '1';
            scoreDisplay.style.pointerEvents = 'none'; // Чтобы не мешало кликам
            
            // Определяем, какая команда выиграла раунд
            const homeWonRound = (isHomeSideT && isTWin) || (!isHomeSideT && !isTWin);
            
            // Создаем элементы для домашнего и гостевого счета
            const homeScoreSpan = document.createElement('span');
            homeScoreSpan.textContent = homeScore;
            homeScoreSpan.style.color = homeWonRound ? 
                (isHomeSideT ? 'rgba(231, 76, 60, 0.6)' : 'rgba(52, 152, 219, 0.6)') : 
                'rgba(0, 0, 0, 0.1)';
            
            const separator = document.createElement('span');
            separator.textContent = ':';
            separator.style.color = 'rgba(0, 0, 0, 0.1)';
            
            const awayScoreSpan = document.createElement('span');
            awayScoreSpan.textContent = awayScore;
            awayScoreSpan.style.color = !homeWonRound ? 
                (!isHomeSideT ? 'rgba(231, 76, 60, 0.6)' : 'rgba(52, 152, 219, 0.6)') : 
                'rgba(0, 0, 0, 0.1)';
            
            // Добавляем элементы счета
            scoreDisplay.appendChild(homeScoreSpan);
            scoreDisplay.appendChild(separator);
            scoreDisplay.appendChild(awayScoreSpan);
            
            // Результат раунда - по центру над счетом
            const roundResult = document.createElement('div');
            roundResult.textContent = isTWin ? 'T выиграли' : 'CT выиграли';
            roundResult.style.color = isTWin ? '#e74c3c' : '#3498db';
            roundResult.style.position = 'absolute';
            roundResult.style.top = '30%';
            roundResult.style.left = '50%';
            roundResult.style.transform = 'translateX(-50%)';
            roundResult.style.fontWeight = 'bold';
            roundResult.style.zIndex = '1';
            
            roundHeader.appendChild(roundNumber);
            
            // Информация о тактиках
            const tacticsInfo = document.createElement('div');
            tacticsInfo.style.display = 'flex';
            tacticsInfo.style.justifyContent = 'space-between';
            tacticsInfo.style.position = 'relative'; // Для z-index
            tacticsInfo.style.zIndex = '2'; // Выше, чем у счета
            
            // Домашняя команда
            const homeTeam = document.createElement('div');
            homeTeam.style.flex = '1';
            homeTeam.style.marginRight = '10px';
            
            const homeTeamSide = document.createElement('div');
            homeTeamSide.textContent = sidesSwapped ? 
                (tactic.homeSide === 0 ? 'T' : 'CT') : 
                (tactic.homeSide === 0 ? 'T' : 'CT');
            homeTeamSide.style.fontWeight = 'bold';
            homeTeamSide.style.color = tactic.homeSide === 0 ? '#e74c3c' : '#3498db';
            
            const homeTacticName = document.createElement('div');
            homeTacticName.textContent = `Тактика: ${tactic.homeTacticName}`;
            
            const homeTacticId = document.createElement('div');
            homeTacticId.style.display = 'flex';
            homeTacticId.style.alignItems = 'center';
            homeTacticId.style.marginTop = '5px';
            
            const homeIdText = document.createElement('span');
            homeIdText.textContent = `ID: ${tactic.homeTacticId}`;
            homeIdText.style.marginRight = '10px';
            
            const homeCopyButton = document.createElement('button');
            homeCopyButton.textContent = 'Копировать';
            homeCopyButton.style.padding = '3px 8px';
            homeCopyButton.style.fontSize = '12px';
            homeCopyButton.style.backgroundColor = '#95a5a6';
            homeCopyButton.style.color = 'white';
            homeCopyButton.style.border = 'none';
            homeCopyButton.style.borderRadius = '3px';
            homeCopyButton.style.cursor = 'pointer';
            homeCopyButton.style.transition = 'all 0.3s ease';
            
            homeCopyButton.onclick = function() {
                copyTacticLink(tactic.homeTacticId, this);
            };
            
            homeTacticId.appendChild(homeIdText);
            homeTacticId.appendChild(homeCopyButton);
            
            homeTeam.appendChild(homeTeamSide);
            homeTeam.appendChild(homeTacticName);
            homeTeam.appendChild(homeTacticId);
            
            // Гостевая команда
            const awayTeam = document.createElement('div');
            awayTeam.style.flex = '1';
            awayTeam.style.marginLeft = '10px';
            awayTeam.style.textAlign = 'right';
            
            const awayTeamSide = document.createElement('div');
            awayTeamSide.textContent = sidesSwapped ? 
                (tactic.homeSide === 0 ? 'CT' : 'T') : 
                (tactic.homeSide === 0 ? 'CT' : 'T');
            awayTeamSide.style.fontWeight = 'bold';
            awayTeamSide.style.color = tactic.homeSide === 0 ? '#3498db' : '#e74c3c';
            
            const awayTacticName = document.createElement('div');
            awayTacticName.textContent = `Тактика: ${tactic.awayTacticName}`;
            
            const awayTacticId = document.createElement('div');
            awayTacticId.style.display = 'flex';
            awayTacticId.style.alignItems = 'center';
            awayTacticId.style.justifyContent = 'flex-end';
            awayTacticId.style.marginTop = '5px';
            
            const awayCopyButton = document.createElement('button');
            awayCopyButton.textContent = 'Копировать';
            awayCopyButton.style.padding = '3px 8px';
            awayCopyButton.style.fontSize = '12px';
            awayCopyButton.style.backgroundColor = '#95a5a6';
            awayCopyButton.style.color = 'white';
            awayCopyButton.style.border = 'none';
            awayCopyButton.style.borderRadius = '3px';
            awayCopyButton.style.cursor = 'pointer';
            awayCopyButton.style.marginRight = '10px';
            awayCopyButton.style.transition = 'all 0.3s ease';
            
            awayCopyButton.onclick = function() {
                copyTacticLink(tactic.awayTacticId, this);
            };
            
            const awayIdText = document.createElement('span');
            awayIdText.textContent = `ID: ${tactic.awayTacticId}`;
            
            awayTacticId.appendChild(awayCopyButton);
            awayTacticId.appendChild(awayIdText);
            
            awayTeam.appendChild(awayTeamSide);
            awayTeam.appendChild(awayTacticName);
            awayTeam.appendChild(awayTacticId);
            
            tacticsInfo.appendChild(homeTeam);
            tacticsInfo.appendChild(awayTeam);
            
            // Добавляем элементы в раунд
            roundElement.appendChild(roundHeader);
            roundElement.appendChild(scoreDisplay); // Добавляем счет
            roundElement.appendChild(tacticsInfo);
            
            // Добавляем раунд в контейнер
            roundsContainer.appendChild(roundElement);
        });
        
        // Обновляем счет с названиями команд
        homeTeamScore.textContent = `${homeTeamName}: ${homeScore}`;
        awayTeamScore.textContent = `${awayTeamName}: ${awayScore}`;
        
        // Показываем результаты
        matchResultsContainer.style.display = 'block';
    }
    
    // Глобальная переменная для хранения тактик из JSON
    let allTactics = [];

    // Глобальные переменные для хранения названий команд
    let homeTeamName = "Домашняя команда";
    let awayTeamName = "Гостевая команда";

    // Функция для парсинга JSON и извлечения тактик
    function parseTacticsFromJSON(jsonText) {
        try {
            // Ищем названия команд с помощью регулярных выражений
            const homeTeamRegex = /homeTeam\s*:\s*\{\s*id\s*:\s*\d+\s*,\s*name\s*:\s*"([^"]*)"/;
            const awayTeamRegex = /awayTeam\s*:\s*\{\s*id\s*:\s*\d+\s*,\s*name\s*:\s*"([^"]*)"/;
            
            const homeTeamMatch = homeTeamRegex.exec(jsonText);
            if (homeTeamMatch && homeTeamMatch[1]) {
                homeTeamName = homeTeamMatch[1];
            }
            
            const awayTeamMatch = awayTeamRegex.exec(jsonText);
            if (awayTeamMatch && awayTeamMatch[1]) {
                awayTeamName = awayTeamMatch[1];
            }
            
            // Сначала пробуем парсить весь JSON
            try {
                const jsonData = JSON.parse(jsonText);
                
                // Извлекаем названия команд, если они есть (дополнительная проверка)
                if (jsonData.homeTeam && jsonData.homeTeam.name) {
                    homeTeamName = jsonData.homeTeam.name;
                }
                
                if (jsonData.awayTeam && jsonData.awayTeam.name) {
                    awayTeamName = jsonData.awayTeam.name;
                }
                
                // Если это объект с полем tactics
                if (jsonData.tactics && Array.isArray(jsonData.tactics)) {
                    return jsonData.tactics;
                }
                
                // Если это массив, предполагаем, что это и есть tactics
                if (Array.isArray(jsonData)) {
                    return jsonData;
                }
                
                // Ищем тактики в любом вложенном объекте
                for (const key in jsonData) {
                    if (typeof jsonData[key] === 'object' && jsonData[key] !== null) {
                        // Проверяем, есть ли названия команд
                        if (key === 'homeTeam' && jsonData[key].name) {
                            homeTeamName = jsonData[key].name;
                        }
                        
                        if (key === 'awayTeam' && jsonData[key].name) {
                            awayTeamName = jsonData[key].name;
                        }
                        
                        if (Array.isArray(jsonData[key]) && jsonData[key].length > 0 && 
                            typeof jsonData[key][0] === 'object' && jsonData[key][0].id && 
                            (jsonData[key][0].waypoints || jsonData[key][0].postPlantWaypoints)) {
                            return jsonData[key];
                        }
                        
                        // Рекурсивно ищем в дочерних объектах
                        if (jsonData[key].tactics && Array.isArray(jsonData[key].tactics)) {
                            return jsonData[key].tactics;
                        }
                    }
                }
            } catch (jsonError) {
                console.error('Ошибка при парсинге JSON:', jsonError);
            }
            
            // Если не удалось парсить весь JSON, пробуем найти блок tactics
            if (jsonText.includes('tactics:')) {
                // Ищем начало блока tactics
                const tacticsStart = jsonText.indexOf('tactics:');
                if (tacticsStart !== -1) {
                    // Ищем открывающую скобку массива
                    const arrayStart = jsonText.indexOf('[', tacticsStart);
                    if (arrayStart !== -1) {
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
                            // Извлекаем блок tactics
                            const tacticsBlock = jsonText.substring(arrayStart, arrayEnd);
                            
                            // Пытаемся парсить как JSON
                            try {
                                const tacticsJSON = JSON.parse(tacticsBlock);
                                return tacticsJSON;
                            } catch (jsonError) {
                                // Если не удалось парсить как JSON, пробуем обернуть в квадратные скобки
                                try {
                                    const wrappedJSON = JSON.parse(`[${tacticsBlock}]`);
                                    return wrappedJSON;
                                } catch (wrapError) {
                                    console.error('Ошибка при парсинге обернутого JSON:', wrapError);
                                }
                            }
                        }
                    }
                }
            }
            
            // Пробуем найти массив объектов с id и waypoints
            const idRegex = /"id"\s*:\s*(\d+)/g;
            const waypointsRegex = /"waypoints"\s*:/g;
            
            if (idRegex.test(jsonText) && waypointsRegex.test(jsonText)) {
                // Пробуем найти все объекты с id и waypoints
                const objRegex = /\{[^{}]*"id"\s*:\s*\d+[^{}]*"waypoints"\s*:[^{}]*\}/g;
                const matches = jsonText.match(objRegex);
                
                if (matches && matches.length > 0) {
                    // Пытаемся парсить каждый объект
                    const tactics = [];
                    
                    for (const match of matches) {
                        try {
                            const tactic = JSON.parse(match);
                            if (tactic.id && (tactic.waypoints || tactic.postPlantWaypoints)) {
                                tactics.push(tactic);
                            }
                        } catch (objError) {
                            console.error('Ошибка при парсинге объекта тактики:', objError);
                        }
                    }
                    
                    if (tactics.length > 0) {
                        return tactics;
                    }
                }
            }
            
            // Если все методы не сработали, ищем объекты с id и name
            const nameRegex = /"name"\s*:\s*"([^"]*)"/g;
            
            if (idRegex.test(jsonText) && nameRegex.test(jsonText)) {
                // Пробуем найти все объекты с id и name
                const objRegex = /\{[^{}]*"id"\s*:\s*\d+[^{}]*"name"\s*:\s*"[^"]*"[^{}]*\}/g;
                const matches = jsonText.match(objRegex);
                
                if (matches && matches.length > 0) {
                    // Пытаемся парсить каждый объект
                    const tactics = [];
                    
                    for (const match of matches) {
                        try {
                            const tactic = JSON.parse(match);
                            if (tactic.id && tactic.name) {
                                tactics.push(tactic);
                            }
                        } catch (objError) {
                            console.error('Ошибка при парсинге объекта тактики:', objError);
                        }
                    }
                    
                    if (tactics.length > 0) {
                        return tactics;
                    }
                }
            }
            
            return [];
        } catch (error) {
            console.error('Ошибка при парсинге тактик из JSON:', error);
            return [];
        }
    }

    // Функция для определения формата данных
    function detectFormat(data) {
        try {
            // Проверка на UI формат (массив объектов)
            if (Array.isArray(data.waypoints) && typeof data.waypoints[0] === 'object' && !Array.isArray(data.waypoints[0])) {
                return 'ui';
            }
            
            // Проверка на массивный формат
            if (Array.isArray(data.waypoints) && Array.isArray(data.waypoints[0])) {
                return 'array';
            }
            
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // Функция для форматирования выходных данных
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
            return JSON.stringify({
                team_id: data.teamId,
                name: data.name,
                map: data.map,
                side: data.side,
                selectedTacticTypes: ["pistol", "standard", "eco"],
                selectedMatchTypes: ["league", "scrim", "ladder", "tournament"],
                loadouts: [],
                bomb_carrier: data.bombCarrier || 1,
                plantTime: data.plantTime || 25,
                waypoints: data.waypoints,
                postPlantWaypoints: data.postPlantWaypoints,
                isDraft: true
            }, null, 2);
        }
        return JSON.stringify(data, null, 2);
    }

    // Функция для копирования ссылки на тактику
    function copyTacticLink(tacticId, buttonElement) {
        // Формируем ссылку на тактику
        const tacticLink = `https://www.cplmanager.com/cpl/team/tactics/simulation?tactic_id=${tacticId}`;
        
        // Копируем ссылку в буфер обмена
        navigator.clipboard.writeText(tacticLink)
            .then(() => {
                // Сохраняем оригинальный текст и цвет кнопки
                const originalText = buttonElement.textContent;
                const originalColor = buttonElement.style.backgroundColor;
                
                // Меняем текст и цвет кнопки для индикации успешного копирования
                buttonElement.textContent = 'Скопировано!';
                buttonElement.style.backgroundColor = '#27ae60';
                
                // Добавляем небольшую анимацию масштабирования
                buttonElement.style.transform = 'scale(1.05)';
                
                // Возвращаем оригинальный текст и цвет через 1.5 секунды
                setTimeout(() => {
                    buttonElement.textContent = originalText;
                    buttonElement.style.backgroundColor = originalColor;
                    buttonElement.style.transform = 'scale(1)';
                }, 1500);
            })
            .catch(err => {
                console.error('Не удалось скопировать ссылку на тактику: ', err);
                
                // Показываем сообщение об ошибке
                buttonElement.textContent = 'Ошибка!';
                buttonElement.style.backgroundColor = '#e74c3c';
                
                // Возвращаем оригинальный текст через 1.5 секунды
                setTimeout(() => {
                    buttonElement.textContent = 'Копировать';
                    buttonElement.style.backgroundColor = '#95a5a6';
                }, 1500);
            });
    }
    
    // Функция для очистки данных матча
    function clearMatchData() {
        matchDataTextarea.value = '';
        matchResultsContainer.style.display = 'none';
    }
});
