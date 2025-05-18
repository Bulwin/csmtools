document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const playersTeamIdInput = document.getElementById('players-team-id');
    const loadPlayersBtn = document.getElementById('load-players');
    const playersContainer = document.getElementById('players-container');
    const playersList = document.getElementById('players-list');
    
    // Проверяем, что все элементы найдены
    if (!playersTeamIdInput || !loadPlayersBtn || !playersContainer || !playersList) {
        console.error('Не удалось найти один или несколько элементов DOM для вкладки "Просмотр игроков"');
        return;
    }
    
    // Функционал загрузки файла с данными удален
    
    // Обработчик кнопки "Загрузить игроков"
    loadPlayersBtn.addEventListener('click', () => {
        const teamId = playersTeamIdInput.value.trim();
        if (!teamId) {
            alert('Пожалуйста, введите ID команды');
            return;
        }
        
        // Очищаем список игроков
        playersList.innerHTML = '';
        
            // Сохраняем отладочную информацию
            const debugDiv = playersList.querySelector('.debug-info');
            
            // Показываем индикатор загрузки, сохраняя отладочную информацию
            playersList.innerHTML = '<div style="text-align: center; padding: 20px;">Загрузка данных...</div>';
            
            // Если была отладочная информация, восстанавливаем ее
            if (debugDiv) {
                playersList.appendChild(debugDiv);
            }
                
                // Добавляем обработчик ошибок для отображения отладочной информации
                window.onerror = function(message, source, lineno, colno, error) {
                    console.error('Глобальная ошибка:', message, error);
                    
                    // Отображаем информацию об ошибке на странице
                    playersList.innerHTML += `
                        <div style="text-align: center; padding: 20px; color: #e74c3c; margin-top: 20px;">
                            <h3>Произошла ошибка:</h3>
                            <pre style="text-align: left; max-width: 600px; margin: 0 auto; overflow: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">${message}</pre>
                        </div>
                    `;
                    
                    return true; // Предотвращаем стандартную обработку ошибок
                };
        
                // Скрываем отладочную информацию
                // playersList.innerHTML += `
                //     <div style="text-align: center; padding: 20px; margin-top: 20px; background: #f8f9fa; border-radius: 5px;">
                //         <h3>Отладочная информация</h3>
                //         <p>ID команды: ${teamId}</p>
                //         <p>Время запроса: ${new Date().toLocaleTimeString()}</p>
                //         <p>User Agent: ${navigator.userAgent}</p>
                //     </div>
                // `;
                
                // Загружаем данные о игроках
                loadPlayersData(teamId);
    });
    
    // Функция для загрузки данных о игроках
    async function loadPlayersData(teamId) {
        try {
            // Прямой запрос к API (будет работать только при запуске через локальный сервер)
            // Используем правильный URL для получения данных о игроках
            const targetUrl = `https://www.cplmanager.com/cpl/teams/${teamId}/players`;
            
            // Показываем только индикатор загрузки
            playersList.innerHTML = '<div style="text-align: center; padding: 20px;">Загрузка данных...</div>';
            
            try {
                // Пробуем прямой запрос (работает только при запуске через локальный сервер)
                const response = await fetch(targetUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Проверяем, есть ли блок data.players
                if (data && data.type === 'data' && data.data && data.data.players && Array.isArray(data.data.players)) {
                    // Отображаем игроков
                    displayPlayers(data.data.players);
                    
                    // Показываем контейнер с игроками
                    playersContainer.style.display = 'block';
                    return;
                }
            } catch (directError) {
                console.log('Прямой запрос не удался, пробуем через прокси:', directError);
            }
            
                // Выводим отладочную информацию только в консоль
                console.log('Прямой запрос не удался, пробуем через прокси');
                
                // Если прямой запрос не удался, пробуем через CORS-прокси
                try {
                // Используем публичный CORS-прокси для обхода ограничений CORS
                // Предыдущий прокси-сервер вернул ошибку "Rate limit reached"
                // Пробуем другой прокси-сервер без ограничений
                const corsProxyUrl = 'https://api.allorigins.win/raw?url=';
                
                // Скрываем информацию о запросе через прокси
                
                const response = await fetch(corsProxyUrl + targetUrl);
                
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                
                // Получаем текст ответа
                const responseText = await response.text();
                
                // Выводим полный ответ в консоль
                console.log('Полный ответ от сервера:', responseText);
                
                // Сохраняем предыдущее содержимое
                const previousContent = playersList.innerHTML;
                
                // Проверяем, загружена ли функция parsePlayersData
                if (typeof window.parsePlayersData === 'function') {
                    try {
                        // Скрываем информацию о попытке парсинга
                        
                        // Парсим данные игроков с помощью parsePlayersData
                        const result = window.parsePlayersData(responseText);
                        
                        if (result && result.players && Array.isArray(result.players) && result.players.length > 0) {
                            // Отображаем информацию о команде, если она есть
                            if (result.teamInfo) {
                                console.log('Информация о команде:', result.teamInfo);
                                displayTeamInfo(result.teamInfo);
                            } else {
                                console.error('Информация о команде не найдена');
                            }
                            // Скрываем информацию об успешном парсинге
                            
                            // Отображаем игроков
                            displayPlayers(result.players);
                            playersContainer.style.display = 'block';
                            return;
                        } else {
                            // Скрываем информацию о неудачном парсинге
                            console.error('Не удалось извлечь данные о игроках: функция parsePlayersData не вернула массив игроков');
                        }
                    } catch (parseError) {
                        console.error('Ошибка при использовании parsePlayersData:', parseError);
                        
                        // Скрываем информацию об ошибке парсинга
                        console.error('Ошибка при парсинге данных игроков:', parseError.message);
                    }
                } else {
                    // Скрываем информацию об отсутствии функции parsePlayersData
                    console.error('Функция parsePlayersData не найдена. Убедитесь, что файл players-data.js загружен');
                }
                
                // Если не удалось использовать parsePlayersData, пробуем стандартные методы парсинга
                
                // Создаем элемент для отладочной информации
                const debugElement = document.createElement('div');
                debugElement.style.textAlign = 'center';
                debugElement.style.padding = '20px';
                debugElement.style.marginTop = '20px';
                debugElement.style.background = '#f8f9fa';
                debugElement.style.borderRadius = '5px';
                
                // Добавляем заголовок
                const heading = document.createElement('h3');
                heading.textContent = 'Ответ от сервера получен';
                debugElement.appendChild(heading);
                
                // Добавляем информацию о длине ответа
                const lengthInfo = document.createElement('p');
                lengthInfo.textContent = `Длина ответа: ${responseText.length} символов`;
                debugElement.appendChild(lengthInfo);
                
                // Добавляем информацию о времени получения
                const timeInfo = document.createElement('p');
                timeInfo.textContent = `Время получения: ${new Date().toLocaleTimeString()}`;
                debugElement.appendChild(timeInfo);
                
                // Добавляем информацию о содержимом ответа
                const playersInfo = document.createElement('p');
                playersInfo.textContent = `Содержит "players": ${responseText.includes('"players"')}`;
                debugElement.appendChild(playersInfo);
                
                const chunKwanInfo = document.createElement('p');
                chunKwanInfo.textContent = `Содержит "Chun Kwan": ${responseText.includes('Chun Kwan')}`;
                debugElement.appendChild(chunKwanInfo);
                
                const idInfo = document.createElement('p');
                idInfo.textContent = `Содержит "id": 23899: ${responseText.includes('23899')}`;
                debugElement.appendChild(idInfo);
                
                // Добавляем первые 200 символов ответа
                const firstCharsLabel = document.createElement('p');
                firstCharsLabel.textContent = 'Первые 200 символов:';
                debugElement.appendChild(firstCharsLabel);
                
                const firstChars = document.createElement('pre');
                firstChars.style.textAlign = 'left';
                firstChars.style.overflow = 'auto';
                firstChars.style.background = '#f1f1f1';
                firstChars.style.padding = '10px';
                firstChars.style.borderRadius = '5px';
                firstChars.style.fontSize = '12px';
                firstChars.textContent = responseText.substring(0, 200);
                debugElement.appendChild(firstChars);
                
                // Добавляем отладочную информацию, не очищая список игроков
                playersList.appendChild(debugElement);
                
                // Пытаемся распарсить JSON
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Ошибка при парсинге JSON:', parseError);
                    
                        // Проверяем, содержит ли ответ HTML с данными о игроках
                        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
                            console.log('Получен HTML, пытаемся извлечь данные о игроках...');
                            
                            // Выводим часть HTML для отладки
                            console.log('Часть HTML ответа (первые 1000 символов):', responseText.substring(0, 1000));
                            console.log('Часть HTML ответа (последние 1000 символов):', responseText.substring(responseText.length - 1000));
                            
                            // Проверяем наличие ключевых строк в HTML
                            console.log('HTML содержит "players":', responseText.includes('"players"'));
                            console.log('HTML содержит "data":', responseText.includes('"data"'));
                            console.log('HTML содержит "__sveltekit":', responseText.includes('__sveltekit'));
                            console.log('HTML содержит "<script>":', responseText.includes('<script>'));
                            
                            // Выводим все теги script в HTML
                            const scriptTags = responseText.match(/<script.*?>([\s\S]*?)<\/script>/g);
                            if (scriptTags) {
                                console.log(`Найдено ${scriptTags.length} тегов script`);
                                scriptTags.forEach((tag, index) => {
                                    console.log(`Тег script #${index + 1} (первые 200 символов):`, tag.substring(0, 200));
                                });
                            } else {
                                console.log('Теги script не найдены');
                            }
                        
                        // Ищем данные о игроках в HTML разными способами
                        
                        // Способ 1: Ищем данные в структуре, предоставленной пользователем
                        let dataMatch = responseText.match(/data:\s*\[\s*\{.*?\},\s*\{.*?\},\s*\{.*?\},\s*\{\s*"type":\s*"data",\s*"data":\s*{\s*"players":\s*(\[.*?\])/s);
                        if (dataMatch && dataMatch[1]) {
                            try {
                                // Пытаемся распарсить массив игроков
                                const playersJson = dataMatch[1].replace(/,\s*$/, ''); // Удаляем запятую в конце, если есть
                                console.log('Найден массив игроков (способ 1):', playersJson.substring(0, 100) + '...');
                                const players = JSON.parse(playersJson);
                                
                                console.log('Успешно извлечены данные о игроках из HTML (способ 1):', players.length);
                                
                                // Отображаем игроков
                                displayPlayers(players);
                                playersContainer.style.display = 'block';
                                return;
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроков из HTML (способ 1):', extractError);
                            }
                        }
                        
                        // Способ 2: Ищем "players": [...] с учетом вложенности
                        let playersMatch = responseText.match(/"players":\s*(\[.*?\])/s);
                        
                        if (playersMatch && playersMatch[1]) {
                            try {
                                // Пытаемся распарсить массив игроков
                                const playersJson = playersMatch[1].replace(/,\s*$/, ''); // Удаляем запятую в конце, если есть
                                console.log('Найден массив игроков (способ 1):', playersJson.substring(0, 100) + '...');
                                const players = JSON.parse(playersJson);
                                
                                console.log('Успешно извлечены данные о игроках из HTML (способ 1):', players.length);
                                
                                // Отображаем игроков
                                displayPlayers(players);
                                playersContainer.style.display = 'block';
                                return;
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из HTML (способ 1):', extractError);
                            }
                        }
                        
                        // Способ 2: Ищем блок данных с игроками
                        playersMatch = responseText.match(/data":\s*{\s*"players":\s*(\[.*?\])/s);
                        if (playersMatch && playersMatch[1]) {
                            try {
                                // Пытаемся распарсить массив игроков
                                const playersJson = playersMatch[1].replace(/,\s*$/, ''); // Удаляем запятую в конце, если есть
                                console.log('Найден массив игроков (способ 2):', playersJson.substring(0, 100) + '...');
                                const players = JSON.parse(playersJson);
                                
                                console.log('Успешно извлечены данные о игроках из HTML (способ 2):', players.length);
                                
                                // Отображаем игроков
                                displayPlayers(players);
                                playersContainer.style.display = 'block';
                                return;
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из HTML (способ 2):', extractError);
                            }
                        }
                        
                        // Способ 3: Ищем блок данных с игроками в формате, показанном на скриншоте
                        const dataBlockMatch = responseText.match(/"data":\s*{\s*"players":\s*\[\s*{\s*"id":\s*(\d+)/s);
                        if (dataBlockMatch) {
                            try {
                                // Ищем начало и конец массива игроков
                                const startIndex = responseText.indexOf('"players": [');
                                if (startIndex !== -1) {
                                    // Находим соответствующую закрывающую скобку
                                    let openBrackets = 1;
                                    let endIndex = startIndex + '"players": ['.length;
                                    
                                    while (openBrackets > 0 && endIndex < responseText.length) {
                                        if (responseText[endIndex] === '[') openBrackets++;
                                        if (responseText[endIndex] === ']') openBrackets--;
                                        endIndex++;
                                    }
                                    
                                    if (openBrackets === 0) {
                                        // Извлекаем массив игроков
                                        const playersJson = responseText.substring(startIndex + '"players": '.length, endIndex);
                                        console.log('Найден массив игроков (способ 3):', playersJson.substring(0, 100) + '...');
                                        
                                        try {
                                            const players = JSON.parse(playersJson);
                                            console.log('Успешно извлечены данные о игроках из HTML (способ 3):', players.length);
                                            
                                            // Отображаем игроков
                                            displayPlayers(players);
                                            playersContainer.style.display = 'block';
                                            return;
                                        } catch (parseError) {
                                            console.error('Ошибка при парсинге массива игроков (способ 3):', parseError);
                                        }
                                    }
                                }
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из HTML (способ 3):', extractError);
                            }
                        }
                        
                        // Способ 4: Ищем блок данных с игроками в другом формате
                        const dataJsonMatch = responseText.match(/"data":\s*(\{.*?\})\s*,\s*"uses"/s);
                        if (dataJsonMatch && dataJsonMatch[1]) {
                            try {
                                // Пытаемся распарсить блок данных
                                const dataJson = dataJsonMatch[1];
                                console.log('Найден блок данных (способ 3):', dataJson.substring(0, 100) + '...');
                                const data = JSON.parse(dataJson);
                                
                                // Проверяем, есть ли игроки в данных
                                if (data.players && Array.isArray(data.players)) {
                                    console.log('Успешно извлечены данные о игроках из HTML (способ 3):', data.players.length);
                                    
                                    // Отображаем игроков
                                    displayPlayers(data.players);
                                    playersContainer.style.display = 'block';
                                    return;
                                }
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из HTML (способ 3):', extractError);
                            }
                        }
                        
                        // Способ 4: Ищем любой массив, который может содержать игроков
                        const arrayMatches = responseText.matchAll(/\[(\{.*?\}(?:,\s*\{.*?\})*)\]/gs);
                        for (const match of arrayMatches) {
                            try {
                                const arrayJson = match[0];
                                const array = JSON.parse(arrayJson);
                                
                                // Проверяем, похож ли массив на массив игроков
                                if (Array.isArray(array) && array.length > 0 && 
                                    array[0].nick && array[0].totalSkill && array[0].aimSkillValue) {
                                    console.log('Найден массив игроков (способ 4):', array.length);
                                    
                                    // Отображаем игроков
                                    displayPlayers(array);
                                    playersContainer.style.display = 'block';
                                    return;
                                }
                            } catch (e) {
                                // Игнорируем ошибки парсинга
                            }
                        }
                        
                        // Способ 5: Ищем данные в JavaScript-коде внутри тега <script>
                        const scriptMatch = responseText.match(/<script>\s*{\s*__sveltekit.*?data:\s*\[\s*{.*?},\s*{.*?},\s*{.*?},\s*{\s*"type":\s*"data",\s*"data":\s*{\s*"players":\s*(\[.*?\])/s);
                        if (scriptMatch && scriptMatch[1]) {
                            try {
                                // Пытаемся распарсить массив игроков
                                const playersJson = scriptMatch[1].replace(/,\s*$/, ''); // Удаляем запятую в конце, если есть
                                console.log('Найден массив игроков в JavaScript-коде (способ 5):', playersJson.substring(0, 100) + '...');
                                const players = JSON.parse(playersJson);
                                
                                console.log('Успешно извлечены данные о игроках из JavaScript-кода (способ 5):', players.length);
                                
                                // Отображаем игроков
                                displayPlayers(players);
                                playersContainer.style.display = 'block';
                                return;
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из JavaScript-кода (способ 5):', extractError);
                            }
                        }
                        
                        // Способ 6: Ищем данные в JavaScript-коде с более гибким подходом
                        const scriptContent = responseText.match(/<script>([\s\S]*?)<\/script>/s);
                        if (scriptContent && scriptContent[1]) {
                            try {
                                const jsCode = scriptContent[1];
                                console.log('Найден JavaScript-код:', jsCode.substring(0, 100) + '...');
                                
                                // Ищем массив игроков в JavaScript-коде
                                const playersArrayMatch = jsCode.match(/"players":\s*(\[.*?\])/s);
                                if (playersArrayMatch && playersArrayMatch[1]) {
                                    try {
                                        const playersJson = playersArrayMatch[1].replace(/,\s*$/, '');
                                        console.log('Найден массив игроков в JavaScript-коде (способ 6):', playersJson.substring(0, 100) + '...');
                                        const players = JSON.parse(playersJson);
                                        
                                        console.log('Успешно извлечены данные о игроках из JavaScript-кода (способ 6):', players.length);
                                        
                                        // Отображаем игроков
                                        displayPlayers(players);
                                        playersContainer.style.display = 'block';
                                        return;
                                    } catch (parseError) {
                                        console.error('Ошибка при парсинге массива игроков из JavaScript-кода (способ 6):', parseError);
                                    }
                                }
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из JavaScript-кода (способ 6):', extractError);
                            }
                        }
                        
                        // Способ 7: Ищем данные в JavaScript-коде с учетом структуры, предоставленной пользователем
                        const dataArrayMatch = responseText.match(/data:\s*\[\s*\{.*?\},\s*\{.*?\},\s*\{.*?\},\s*\{.*?"type":\s*"data",\s*"data":\s*\{\s*"players":\s*(\[.*?\])/s);
                        if (dataArrayMatch && dataArrayMatch[1]) {
                            try {
                                const playersJson = dataArrayMatch[1].replace(/,\s*$/, '');
                                console.log('Найден массив игроков в JavaScript-коде (способ 7):', playersJson.substring(0, 100) + '...');
                                const players = JSON.parse(playersJson);
                                
                                console.log('Успешно извлечены данные о игроках из JavaScript-кода (способ 7):', players.length);
                                
                                // Отображаем игроков
                                displayPlayers(players);
                                playersContainer.style.display = 'block';
                                return;
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из JavaScript-кода (способ 7):', extractError);
                            }
                        }
                        
                        // Способ 8: Ищем данные в JavaScript-коде с более простым подходом
                        const playersDataMatch = responseText.match(/"id":\s*23899,\s*"name":\s*"Chun Kwan"/);
                        if (playersDataMatch) {
                            try {
                                // Ищем начало массива игроков
                                const playerStartIndex = responseText.lastIndexOf('"players": [', playersDataMatch.index);
                                if (playerStartIndex !== -1) {
                                    // Находим соответствующую закрывающую скобку
                                    let openBrackets = 1;
                                    let endIndex = playerStartIndex + '"players": ['.length;
                                    
                                    while (openBrackets > 0 && endIndex < responseText.length) {
                                        if (responseText[endIndex] === '[') openBrackets++;
                                        if (responseText[endIndex] === ']') openBrackets--;
                                        endIndex++;
                                    }
                                    
                                    if (openBrackets === 0) {
                                        // Извлекаем массив игроков
                                        const playersJson = responseText.substring(playerStartIndex + '"players": '.length, endIndex);
                                        console.log('Найден массив игроков (способ 8):', playersJson.substring(0, 100) + '...');
                                        
                                        try {
                                            const players = JSON.parse(playersJson);
                                            console.log('Успешно извлечены данные о игроках из HTML (способ 8):', players.length);
                                            
                                            // Отображаем игроков
                                            displayPlayers(players);
                                            playersContainer.style.display = 'block';
                                            return;
                                        } catch (parseError) {
                                            console.error('Ошибка при парсинге массива игроков (способ 8):', parseError);
                                        }
                                    }
                                }
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из HTML (способ 8):', extractError);
                            }
                        }
                        
                        // Способ 9: Ищем данные в JavaScript-коде с использованием более широкого контекста
                        const dataBlocksMatch = responseText.match(/data:\s*\[\s*\{.*?\},\s*\{.*?\},\s*\{.*?\},\s*\{/s);
                        if (dataBlocksMatch) {
                            try {
                                // Ищем начало блока данных
                                const dataBlockStart = dataBlocksMatch.index;
                                if (dataBlockStart !== -1) {
                                    // Ищем блок с игроками после начала блока данных
                                    const playersBlockMatch = responseText.substring(dataBlockStart).match(/"players":\s*\[/);
                                    if (playersBlockMatch) {
                                        const playersStart = dataBlockStart + playersBlockMatch.index + playersBlockMatch[0].length;
                                        
                                        // Находим соответствующую закрывающую скобку
                                        let openBrackets = 1;
                                        let endIndex = playersStart;
                                        
                                        while (openBrackets > 0 && endIndex < responseText.length) {
                                            if (responseText[endIndex] === '[') openBrackets++;
                                            if (responseText[endIndex] === ']') openBrackets--;
                                            endIndex++;
                                        }
                                        
                                        if (openBrackets === 0) {
                                            // Извлекаем массив игроков
                                            const playersJson = responseText.substring(playersStart, endIndex - 1);
                                            console.log('Найден массив игроков (способ 9):', playersJson.substring(0, 100) + '...');
                                            
                                            try {
                                                const players = JSON.parse(playersJson);
                                                console.log('Успешно извлечены данные о игроках из HTML (способ 9):', players.length);
                                                
                                                // Отображаем игроков
                                                displayPlayers(players);
                                                playersContainer.style.display = 'block';
                                                return;
                                            } catch (parseError) {
                                                console.error('Ошибка при парсинге массива игроков (способ 9):', parseError);
                                            }
                                        }
                                    }
                                }
                            } catch (extractError) {
                                console.error('Ошибка при извлечении данных о игроках из HTML (способ 9):', extractError);
                            }
                        }
                        
                        // Находим блок с данными игроков
                        const playersBlock = responseText.indexOf('"players": [');
                        const dataBlock = responseText.indexOf('"data": {');
                        const chunKwanBlock = responseText.indexOf('Chun Kwan');
                        
                        // Извлекаем контекст вокруг блока с данными игроков
                        let playersContext = '';
                        if (playersBlock !== -1) {
                            const start = Math.max(0, playersBlock - 50);
                            const end = Math.min(responseText.length, playersBlock + 200);
                            playersContext = responseText.substring(start, end);
                        }
                        
                        // Извлекаем контекст вокруг блока с данными
                        let dataContext = '';
                        if (dataBlock !== -1) {
                            const start = Math.max(0, dataBlock - 50);
                            const end = Math.min(responseText.length, dataBlock + 200);
                            dataContext = responseText.substring(start, end);
                        }
                        
                        // Извлекаем контекст вокруг блока с Chun Kwan
                        let chunKwanContext = '';
                        if (chunKwanBlock !== -1) {
                            const start = Math.max(0, chunKwanBlock - 50);
                            const end = Math.min(responseText.length, chunKwanBlock + 200);
                            chunKwanContext = responseText.substring(start, end);
                        }
                        
                        // Собираем отладочную информацию
                        const debugInfo = {
                            containsPlayers: responseText.includes('"players"'),
                            containsData: responseText.includes('"data"'),
                            containsSveltekit: responseText.includes('__sveltekit'),
                            containsScript: responseText.includes('<script>'),
                            containsChunKwan: responseText.includes('Chun Kwan'),
                            containsId23899: responseText.includes('"id": 23899'),
                            scriptTagsCount: (responseText.match(/<script.*?>/g) || []).length,
                            responseLength: responseText.length,
                            firstChars: responseText.substring(0, 200),
                            lastChars: responseText.substring(responseText.length - 200),
                            playersBlock,
                            dataBlock,
                            chunKwanBlock,
                            playersContext,
                            dataContext,
                            chunKwanContext
                        };
                        
                        // Выводим отладочную информацию на страницу
                        playersList.innerHTML = `
                            <div style="text-align: center; padding: 20px; color: #e74c3c;">
                                <h3>Ошибка при загрузке данных: Не удалось извлечь данные о игроках из HTML</h3>
                                <div style="text-align: left; max-width: 800px; margin: 0 auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                                    <h4>Отладочная информация:</h4>
                                    <ul>
                                        <li>Содержит "players": ${debugInfo.containsPlayers}</li>
                                        <li>Содержит "data": ${debugInfo.containsData}</li>
                                        <li>Содержит "Chun Kwan": ${debugInfo.containsChunKwan}</li>
                                        <li>Содержит "id": 23899: ${debugInfo.containsId23899}</li>
                                        <li>Длина ответа: ${debugInfo.responseLength} символов</li>
                                    </ul>
                                    
                                    <h4>Позиции ключевых блоков:</h4>
                                    <ul>
                                        <li>Блок "players": ${debugInfo.playersBlock}</li>
                                        <li>Блок "data": ${debugInfo.dataBlock}</li>
                                        <li>Блок "Chun Kwan": ${debugInfo.chunKwanBlock}</li>
                                    </ul>
                                    
                                    <h4>Контекст вокруг блока "players":</h4>
                                    <pre style="overflow: auto; background: #f1f1f1; padding: 10px; border-radius: 5px; font-size: 12px;">${playersContext.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                    
                                    <h4>Контекст вокруг блока "data":</h4>
                                    <pre style="overflow: auto; background: #f1f1f1; padding: 10px; border-radius: 5px; font-size: 12px;">${dataContext.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                    
                                    <h4>Контекст вокруг "Chun Kwan":</h4>
                                    <pre style="overflow: auto; background: #f1f1f1; padding: 10px; border-radius: 5px; font-size: 12px;">${chunKwanContext.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                    
                                    <h4>Первые 200 символов ответа:</h4>
                                    <pre style="overflow: auto; background: #f1f1f1; padding: 10px; border-radius: 5px; font-size: 12px;">${debugInfo.firstChars.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                </div>
                            </div>
                        `;
                        playersContainer.style.display = 'block';
                        
                        // Если не удалось извлечь данные о игроках, показываем сообщение об ошибке
                        throw new Error('Не удалось извлечь данные о игроках из HTML');
                    }
                    
                    throw parseError;
                }
                
                // Выводим полученные данные в консоль для отладки
                console.log('Полученные данные от API:', data);
                
                // Проверяем структуру данных
                if (data && typeof data === 'object') {
                    // Проверяем разные возможные структуры данных
                    
                    // Вариант 1: data.type === 'data' и data.data.players
                    if (data.type === 'data' && data.data && data.data.players && Array.isArray(data.data.players)) {
                        displayPlayers(data.data.players);
                        playersContainer.style.display = 'block';
                        return;
                    }
                    
                    // Вариант 2: data.players напрямую
                    if (data.players && Array.isArray(data.players)) {
                        displayPlayers(data.players);
                        playersContainer.style.display = 'block';
                        return;
                    }
                    
                    // Вариант 3: data сам является массивом игроков
                    if (Array.isArray(data) && data.length > 0 && data[0].nick) {
                        displayPlayers(data);
                        playersContainer.style.display = 'block';
                        return;
                    }
                    
                    // Выводим структуру данных для отладки
                    playersList.innerHTML = `
                        <div style="text-align: center; padding: 20px; color: #e74c3c;">
                            <h3>Данные получены, но структура не соответствует ожидаемой</h3>
                            <pre style="text-align: left; max-width: 600px; margin: 0 auto; overflow: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    `;
                    playersContainer.style.display = 'block';
                    return;
                }
                
                throw new Error('Не удалось найти данные о игроках в ответе API');
            } catch (proxyError) {
                console.error('Ошибка при использовании прокси:', proxyError);
                throw proxyError;
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных о игроках:', error);
            
            // Проверяем, является ли ошибка CORS-ошибкой
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                playersList.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e74c3c;">
                        <h3>Ошибка доступа к API</h3>
                        <p>Из-за ограничений безопасности браузера (CORS), прямой запрос к API не может быть выполнен при открытии файла локально.</p>
                        <p>Для работы с API вам необходимо:</p>
                        <ol style="text-align: left; max-width: 600px; margin: 0 auto;">
                            <li>Запустить локальный сервер (например, с помощью Live Server в VS Code)</li>
                            <li>Или использовать прокси-сервер для обхода CORS-ограничений</li>
                        </ol>
                    </div>
                `;
            } else {
                playersList.innerHTML = `<div style="text-align: center; padding: 20px; color: #e74c3c;">Ошибка при загрузке данных: ${error.message}</div>`;
            }
            
            // Показываем контейнер с игроками, чтобы отобразить сообщение об ошибке
            playersContainer.style.display = 'block';
        }
    }
    
    // Функция для отображения информации о команде
    function displayTeamInfo(teamInfo) {
        // Удаляем предыдущие панели информации о командах, если они есть
        const existingPanels = document.querySelectorAll('.team-info-panel');
        existingPanels.forEach(panel => panel.remove());
        
        // Создаем новый контейнер для информации о команде
        const teamInfoPanel = document.createElement('div');
        teamInfoPanel.className = 'team-info-panel';
        teamInfoPanel.style.backgroundColor = '#2c3e50';
        teamInfoPanel.style.color = 'white';
        teamInfoPanel.style.padding = '20px';
        teamInfoPanel.style.borderRadius = '8px';
        teamInfoPanel.style.marginBottom = '20px';
        teamInfoPanel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        
        // Создаем заголовок с названием команды
        const teamName = document.createElement('h2');
        teamName.style.fontSize = '28px';
        teamName.style.margin = '0 0 20px 0';
        teamName.style.textAlign = 'center';
        teamName.style.textTransform = 'uppercase';
        teamName.style.letterSpacing = '2px';
        teamName.style.color = '#3498db';
        teamName.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
        teamName.textContent = teamInfo.name || 'Неизвестная команда';
        
        // Создаем контейнер для информации
        const infoGrid = document.createElement('div');
        infoGrid.style.display = 'grid';
        infoGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        infoGrid.style.gap = '15px';
        
        // Добавляем информацию о команде
        const teamInfoItems = [
            { label: 'ID команды', value: teamInfo.id },
            { label: 'Баланс', value: `${teamInfo.balance || 0} ₽PL` },
            { label: 'Медиа-очки', value: teamInfo.mediaPoints || 0 },
            { label: 'Очки славы', value: teamInfo.famePoints || 0 }
        ];
        
        // Добавляем информацию о пользователе, если она есть
        if (teamInfo.user) {
            teamInfoItems.push(
                { label: 'Имя пользователя', value: teamInfo.user.username || 'Н/Д' },
                { label: 'Email', value: teamInfo.user.email || 'Н/Д' },
                { label: 'Монеты', value: teamInfo.user.coins || 0 },
                { label: 'Имя', value: (teamInfo.user.firstName || '') + ' ' + (teamInfo.user.lastName || '') },
                { label: 'Дата рождения', value: teamInfo.user.birthday ? new Date(teamInfo.user.birthday).toLocaleDateString() : 'Н/Д' },
                { label: 'VIP активен', value: teamInfo.user.vipActive ? 'Да' : 'Нет' },
                { label: 'Штрафные очки', value: teamInfo.user.warningPoints || 0 }
            );
        }
        
        // Добавляем элементы в сетку
        teamInfoItems.forEach(item => {
            const infoItem = document.createElement('div');
            infoItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            infoItem.style.padding = '15px';
            infoItem.style.borderRadius = '4px';
            infoItem.style.transition = 'all 0.3s ease';
            infoItem.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            
            // Добавляем эффект при наведении
            infoItem.onmouseover = function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                this.style.transform = 'translateY(-2px)';
            };
            
            infoItem.onmouseout = function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                this.style.transform = 'translateY(0)';
            };
            
            const label = document.createElement('div');
            label.style.fontSize = '12px';
            label.style.color = '#3498db';
            label.style.marginBottom = '5px';
            label.style.fontWeight = 'bold';
            label.textContent = item.label;
            
            const value = document.createElement('div');
            value.style.fontSize = '16px';
            value.style.fontWeight = 'bold';
            value.textContent = item.value;
            
            infoItem.appendChild(label);
            infoItem.appendChild(value);
            infoGrid.appendChild(infoItem);
        });
        
        // Собираем все вместе
        teamInfoPanel.appendChild(teamName);
        teamInfoPanel.appendChild(infoGrid);
        
        // Вставляем панель информации о команде перед контейнером игроков
        const playersContainer = document.getElementById('players-container');
        playersContainer.parentNode.insertBefore(teamInfoPanel, playersContainer);
    }
    
    // Функция для отображения игроков
    function displayPlayers(players) {
        // Сохраняем информацию о команде, если она есть
        const teamInfoContainer = playersList.querySelector('.team-info-container');
        
        // Очищаем список игроков перед отображением карточек
        playersList.innerHTML = '';
        
        // Восстанавливаем информацию о команде, если она была
        if (teamInfoContainer) {
            playersList.appendChild(teamInfoContainer);
        }
        
        // Если игроков нет, показываем сообщение
        if (players.length === 0) {
            playersList.innerHTML = '<div style="text-align: center; padding: 20px;">Игроки не найдены</div>';
            return;
        }
        
        // Сортируем игроков по порядку (order)
        players.sort((a, b) => a.order - b.order);
        
        // Создаем карточку для каждого игрока
        players.forEach(player => {
            const playerCard = createPlayerCard(player);
            playersList.appendChild(playerCard);
        });
    }
    
    // Функция для создания карточки игрока
    function createPlayerCard(player) {
        // Создаем элемент карточки
        const card = document.createElement('div');
        card.className = 'player-card';
        
        // Создаем заголовок карточки
        const header = document.createElement('div');
        header.className = 'player-header';
        
        // Создаем аватар
        const avatar = document.createElement('div');
        avatar.className = 'player-avatar';
        avatar.textContent = player.nick ? player.nick.charAt(0).toUpperCase() : (player.name ? player.name.charAt(0).toUpperCase() : 'P');
        
        // Создаем блок с информацией
        const info = document.createElement('div');
        info.className = 'player-info';
        
        // Создаем ник игрока
        const nick = document.createElement('div');
        nick.className = 'player-nick';
        
        // Флаг страны удален
        
        // Добавляем ник
        const nickText = document.createElement('span');
        nickText.textContent = player.nick || player.name || 'Unknown';
        nick.appendChild(nickText);
        
        // Создаем имя игрока
        const name = document.createElement('div');
        name.className = 'player-name';
        name.textContent = player.name || '';
        
        // Создаем детали игрока
        const details = document.createElement('div');
        details.className = 'player-details';
        details.textContent = `${player.age || 0}yo (day ${player.birthday || 0}) • ₽PL ${player.salary || 0}`;
        
        // Добавляем элементы в блок с информацией
        info.appendChild(nick);
        info.appendChild(name);
        info.appendChild(details);
        
        // Добавляем аватар и информацию в заголовок
        header.appendChild(avatar);
        header.appendChild(info);
        
        // Создаем блок со статистикой
        const stats = document.createElement('div');
        stats.className = 'player-stats';
        
        // Добавляем общий скилл
        const total = document.createElement('div');
        total.className = 'player-total';
        
        const totalLabel = document.createElement('div');
        totalLabel.className = 'player-total-label';
        totalLabel.textContent = 'TOTAL SKILL';
        
        const totalValue = document.createElement('div');
        totalValue.className = 'player-total-value';
        totalValue.textContent = `${player.totalSkill || 0}/${player.totalLimit || 100}`;
        
        total.appendChild(totalLabel);
        total.appendChild(totalValue);
        
        stats.appendChild(total);
        
        // Добавляем скиллы
        const skills = [
            { name: 'Aim', value: player.aimSkillValue || 0, limit: player.aimSkillLimit || 100, progress: player.aimSkillProgress || 0 },
            { name: 'Handling', value: player.handlingSkillValue || 0, limit: player.handlingSkillLimit || 100, progress: player.handlingSkillProgress || 0 },
            { name: 'Quickness', value: player.quicknessSkillValue || 0, limit: player.quicknessSkillLimit || 100, progress: player.quicknessSkillProgress || 0 },
            { name: 'Determination', value: player.determinationSkillValue || 0, limit: player.determinationSkillLimit || 100, progress: player.determinationSkillProgress || 0 },
            { name: 'Awareness', value: player.awarenessSkillValue || 0, limit: player.awarenessSkillLimit || 100, progress: player.awarenessSkillProgress || 0 },
            { name: 'Teamplay', value: player.teamplaySkillValue || 0, limit: player.teamplaySkillLimit || 100, progress: player.teamplaySkillProgress || 0 },
            { name: 'Gamesense', value: player.gamesenseSkillValue || 0, limit: player.gamesenseSkillLimit || 100, progress: player.gamesenseSkillProgress || 0 },
            { name: 'Movement', value: player.movementSkillValue || 0, limit: player.movementSkillLimit || 100, progress: player.movementSkillProgress || 0 }
        ];
        
        skills.forEach(skill => {
            const skillBar = createSkillBar(skill.name, skill.value, skill.limit, skill.progress);
            stats.appendChild(skillBar);
        });
        
        // Создаем подвал карточки
        const footer = document.createElement('div');
        footer.className = 'player-footer';
        
        // Добавляем секцию опыта
        const experience = document.createElement('div');
        experience.className = 'player-section';
        
        const experienceTitle = document.createElement('div');
        experienceTitle.className = 'section-title';
        experienceTitle.textContent = 'Experience';
        
        const experienceValue = document.createElement('div');
        experienceValue.className = 'section-value';
        experienceValue.textContent = player.experienceLevel || 0;
        
        experience.appendChild(experienceTitle);
        experience.appendChild(experienceValue);
        
        // Добавляем секцию лидерства
        const leadership = document.createElement('div');
        leadership.className = 'player-section';
        
        const leadershipTitle = document.createElement('div');
        leadershipTitle.className = 'section-title';
        leadershipTitle.textContent = 'Leadership';
        
        const leadershipValue = document.createElement('div');
        leadershipValue.className = 'section-value';
        leadershipValue.textContent = player.leadershipLevel || 0;
        
        leadership.appendChild(leadershipTitle);
        leadership.appendChild(leadershipValue);
        
        // Добавляем секцию славы
        const fame = document.createElement('div');
        fame.className = 'player-section';
        
        const fameTitle = document.createElement('div');
        fameTitle.className = 'section-title';
        fameTitle.textContent = 'Fame';
        
        const fameValue = document.createElement('div');
        fameValue.className = 'section-value';
        fameValue.textContent = player.fame || 0;
        
        fame.appendChild(fameTitle);
        fame.appendChild(fameValue);
        
        // Добавляем секцию талантов
        const talents = document.createElement('div');
        talents.className = 'player-section';
        
        const talentsTitle = document.createElement('div');
        talentsTitle.className = 'section-title';
        talentsTitle.textContent = 'Talents';
        
        const talentsValue = document.createElement('div');
        talentsValue.className = 'section-value';
        talentsValue.textContent = `${player.talentPointsUsed || 0} points`;
        
        talents.appendChild(talentsTitle);
        talents.appendChild(talentsValue);
        
        // Добавляем секции в подвал
        footer.appendChild(experience);
        footer.appendChild(leadership);
        footer.appendChild(fame);
        footer.appendChild(talents);
        
        // Добавляем специальные способности, если они есть
        if (player.specials && player.specials.length > 0) {
            const specialsContainer = document.createElement('div');
            specialsContainer.className = 'player-specials';
            
            player.specials.forEach(special => {
                const specialTag = document.createElement('div');
                specialTag.className = 'special-tag';
                specialTag.textContent = special.name;
                specialsContainer.appendChild(specialTag);
            });
            
            // Добавляем специальные способности в подвал
            const specialsSection = document.createElement('div');
            specialsSection.style.width = '100%';
            specialsSection.style.marginTop = '10px';
            specialsSection.appendChild(specialsContainer);
            
            footer.appendChild(specialsSection);
        }
        
        // Добавляем заголовок, статистику и подвал в карточку
        card.appendChild(header);
        card.appendChild(stats);
        card.appendChild(footer);
        
        return card;
    }
    
    // Функция для создания полосы скилла
    function createSkillBar(name, value, limit, progress) {
        const skillBar = document.createElement('div');
        skillBar.className = 'player-skill-bar';
        
        const skillName = document.createElement('div');
        skillName.className = 'skill-name';
        
        const skillNameText = document.createElement('span');
        skillNameText.textContent = name;
        
        const skillValues = document.createElement('span');
        skillValues.innerHTML = `<span class="skill-value">${value}</span>/<span class="skill-limit">${limit}</span>`;
        
        skillName.appendChild(skillNameText);
        skillName.appendChild(skillValues);
        
        const skillBarContainer = document.createElement('div');
        skillBarContainer.className = 'skill-bar';
        skillBarContainer.style.position = 'relative'; // Добавляем относительное позиционирование
        
        // Создаем фон для всей шкалы (серый)
        const skillBackground = document.createElement('div');
        skillBackground.style.position = 'absolute';
        skillBackground.style.top = '0';
        skillBackground.style.left = '0';
        skillBackground.style.width = '100%';
        skillBackground.style.height = '100%';
        skillBackground.style.backgroundColor = '#444';
        skillBackground.style.borderRadius = '4px';
        
        // Создаем лимит скилла (желтый)
        const skillLimit = document.createElement('div');
        skillLimit.style.position = 'absolute';
        skillLimit.style.top = '0';
        skillLimit.style.left = '0';
        skillLimit.style.width = `${limit}%`;
        skillLimit.style.height = '100%';
        skillLimit.style.backgroundColor = '#f39c12';
        skillLimit.style.borderRadius = '4px';
        
        // Создаем текущее значение скилла (красный)
        const skillFill = document.createElement('div');
        skillFill.className = 'skill-fill';
        skillFill.style.position = 'absolute';
        skillFill.style.top = '0';
        skillFill.style.left = '0';
        skillFill.style.width = `${value}%`;
        skillFill.style.height = '100%';
        skillFill.style.backgroundColor = '#e74c3c';
        skillFill.style.borderRadius = '4px';
        skillFill.style.zIndex = '2'; // Поверх других элементов
        
        // Добавляем элементы в контейнер в правильном порядке (снизу вверх)
        skillBarContainer.appendChild(skillBackground);
        skillBarContainer.appendChild(skillLimit);
        skillBarContainer.appendChild(skillFill);
        
        skillBar.appendChild(skillName);
        skillBar.appendChild(skillBarContainer);
        
        return skillBar;
    }
    
    // Функция для получения флага страны удалена
    
    // Функция для получения HTML со звездами славы - больше не используется
});
