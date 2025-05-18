/**
 * Функция для преобразования нестандартного JSON в стандартный формат
 * @param {string} jsonString - Строка с нестандартным JSON или HTML, содержащий JSON
 * @returns {Object} - Объект с массивом игроков и информацией о команде
 */
function parsePlayersData(jsonString) {
    try {
        console.log('Запуск теста парсинга данных игроков...');
        
        // Если строка уже является объектом, возвращаем его
        if (typeof jsonString === 'object') {
            return jsonString;
        }
        
        // Пробуем сначала распарсить как стандартный JSON
        try {
            const data = JSON.parse(jsonString);
            
            // Проверяем, есть ли в данных массив игроков
            if (data && data.data && data.data.players && Array.isArray(data.data.players)) {
                return data.data.players;
            } else if (data && Array.isArray(data)) {
                return data;
            } else if (data && data.players && Array.isArray(data.players)) {
                return data.players;
            }
        } catch (e) {
            console.log('Не удалось распарсить как стандартный JSON, пробуем нестандартный формат');
        }
        
        // Ищем блок данных в формате, предоставленном пользователем
        // Формат: "data": { players: [{...}, {...}, ...] }
        const dataMatch = jsonString.match(/data\s*:\s*{\s*players\s*:\s*(\[[\s\S]*?\])/);
        if (dataMatch && dataMatch[1]) {
            console.log('Найденный текст с данными игроков', jsonString.substring(0, 500));
            
            // Получаем текст массива игроков
            const playersArrayText = dataMatch[1];
            
            // Создаем JavaScript-код для выполнения
            const jsCode = `
                try {
                    // Создаем объект с данными игроков
                    const data = {
                        players: ${playersArrayText}
                    };
                    
                    // Возвращаем массив игроков
                    return data.players;
                } catch (error) {
                    console.error('Ошибка при выполнении JavaScript:', error);
                    return [];
                }
            `;
            
            try {
                // Создаем функцию из JavaScript-кода
                const evalFunction = new Function(jsCode);
                
                // Выполняем функцию
                const players = evalFunction();
                
                // Проверяем результат
                if (players && Array.isArray(players) && players.length > 0) {
                    console.log('Найдены данные игроков с помощью регулярного выражения:', players.length);
                    
                    // Проверяем, что у игроков есть все необходимые поля
                    const enhancedPlayers = players.map(player => {
                        // Добавляем значения по умолчанию для отсутствующих полей
                        return {
                            id: player.id || 0,
                            name: player.name || 'Unknown',
                            teamId: player.teamId || 0,
                            age: player.age || 0,
                            salary: player.salary || 0,
                            nick: player.nick || player.name || 'Unknown',
                            birthday: player.birthday || 0,
                            country: player.country || 'Unknown',
                            order: player.order || 0,
                            fame: player.fame || 0,
                            experienceLevel: player.experienceLevel || 0,
                            experienceProgression: player.experienceProgression || 0,
                            leadershipLevel: player.leadershipLevel || 0,
                            leadershipProgression: player.leadershipProgression || 0,
                            totalSkill: player.totalSkill || 0,
                            totalLimit: player.totalLimit || 100,
                            aimSkillValue: player.aimSkillValue || 0,
                            aimSkillLimit: player.aimSkillLimit || 100,
                            aimSkillProgress: player.aimSkillProgress || 0,
                            handlingSkillValue: player.handlingSkillValue || 0,
                            handlingSkillLimit: player.handlingSkillLimit || 100,
                            handlingSkillProgress: player.handlingSkillProgress || 0,
                            quicknessSkillValue: player.quicknessSkillValue || 0,
                            quicknessSkillLimit: player.quicknessSkillLimit || 100,
                            quicknessSkillProgress: player.quicknessSkillProgress || 0,
                            determinationSkillValue: player.determinationSkillValue || 0,
                            determinationSkillLimit: player.determinationSkillLimit || 100,
                            determinationSkillProgress: player.determinationSkillProgress || 0,
                            awarenessSkillValue: player.awarenessSkillValue || 0,
                            awarenessSkillLimit: player.awarenessSkillLimit || 100,
                            awarenessSkillProgress: player.awarenessSkillProgress || 0,
                            teamplaySkillValue: player.teamplaySkillValue || 0,
                            teamplaySkillLimit: player.teamplaySkillLimit || 100,
                            teamplaySkillProgress: player.teamplaySkillProgress || 0,
                            gamesenseSkillValue: player.gamesenseSkillValue || 0,
                            gamesenseSkillLimit: player.gamesenseSkillLimit || 100,
                            gamesenseSkillProgress: player.gamesenseSkillProgress || 0,
                            movementSkillValue: player.movementSkillValue || 0,
                            movementSkillLimit: player.movementSkillLimit || 100,
                            movementSkillProgress: player.movementSkillProgress || 0,
                            specials: player.specials || []
                        };
                    });
                    
                    console.log('Результат парсинга данных игроков:', JSON.stringify(enhancedPlayers, null, 2));
                    console.log('Успешно извлечены данные о игроках:', enhancedPlayers.length);
                    
                    // Ищем информацию о команде
                    const teamInfo = extractTeamInfo(jsonString);
                    
                    return {
                        players: enhancedPlayers,
                        teamInfo: teamInfo
                    };
                }
            } catch (evalError) {
                console.error('Ошибка при использовании eval для JavaScript-объекта:', evalError);
            }
        }
        
        // Если не удалось найти данные игроков, пробуем другой подход
        // Ищем массив игроков напрямую
        const playersMatch = jsonString.match(/players\s*:\s*(\[[\s\S]*?\])/);
        if (playersMatch && playersMatch[1]) {
            console.log('Найден массив игроков напрямую');
            
            // Получаем текст массива игроков
            const playersArrayText = playersMatch[1];
            
            // Создаем JavaScript-код для выполнения
            const jsCode = `
                try {
                    // Возвращаем массив игроков
                    return ${playersArrayText};
                } catch (error) {
                    console.error('Ошибка при выполнении JavaScript:', error);
                    return [];
                }
            `;
            
            try {
                // Создаем функцию из JavaScript-кода
                const evalFunction = new Function(jsCode);
                
                // Выполняем функцию
                const players = evalFunction();
                
                // Проверяем результат
                if (players && Array.isArray(players) && players.length > 0) {
                    console.log('Найдены данные игроков с помощью регулярного выражения (прямой подход):', players.length);
                    
                    // Проверяем, что у игроков есть все необходимые поля
                    const enhancedPlayers = players.map(player => {
                        // Добавляем значения по умолчанию для отсутствующих полей
                        return {
                            id: player.id || 0,
                            name: player.name || 'Unknown',
                            teamId: player.teamId || 0,
                            age: player.age || 0,
                            salary: player.salary || 0,
                            nick: player.nick || player.name || 'Unknown',
                            birthday: player.birthday || 0,
                            country: player.country || 'Unknown',
                            order: player.order || 0,
                            fame: player.fame || 0,
                            experienceLevel: player.experienceLevel || 0,
                            experienceProgression: player.experienceProgression || 0,
                            leadershipLevel: player.leadershipLevel || 0,
                            leadershipProgression: player.leadershipProgression || 0,
                            totalSkill: player.totalSkill || 0,
                            totalLimit: player.totalLimit || 100,
                            aimSkillValue: player.aimSkillValue || 0,
                            aimSkillLimit: player.aimSkillLimit || 100,
                            aimSkillProgress: player.aimSkillProgress || 0,
                            handlingSkillValue: player.handlingSkillValue || 0,
                            handlingSkillLimit: player.handlingSkillLimit || 100,
                            handlingSkillProgress: player.handlingSkillProgress || 0,
                            quicknessSkillValue: player.quicknessSkillValue || 0,
                            quicknessSkillLimit: player.quicknessSkillLimit || 100,
                            quicknessSkillProgress: player.quicknessSkillProgress || 0,
                            determinationSkillValue: player.determinationSkillValue || 0,
                            determinationSkillLimit: player.determinationSkillLimit || 100,
                            determinationSkillProgress: player.determinationSkillProgress || 0,
                            awarenessSkillValue: player.awarenessSkillValue || 0,
                            awarenessSkillLimit: player.awarenessSkillLimit || 100,
                            awarenessSkillProgress: player.awarenessSkillProgress || 0,
                            teamplaySkillValue: player.teamplaySkillValue || 0,
                            teamplaySkillLimit: player.teamplaySkillLimit || 100,
                            teamplaySkillProgress: player.teamplaySkillProgress || 0,
                            gamesenseSkillValue: player.gamesenseSkillValue || 0,
                            gamesenseSkillLimit: player.gamesenseSkillLimit || 100,
                            gamesenseSkillProgress: player.gamesenseSkillProgress || 0,
                            movementSkillValue: player.movementSkillValue || 0,
                            movementSkillLimit: player.movementSkillLimit || 100,
                            movementSkillProgress: player.movementSkillProgress || 0,
                            specials: player.specials || []
                        };
                    });
                    
                    console.log('Результат парсинга данных игроков:', JSON.stringify(enhancedPlayers, null, 2));
                    console.log('Успешно извлечены данные о игроках:', enhancedPlayers.length);
                    
                    // Ищем информацию о команде
                    const teamInfo = extractTeamInfo(jsonString);
                    
                    return {
                        players: enhancedPlayers,
                        teamInfo: teamInfo
                    };
                }
            } catch (evalError) {
                console.error('Ошибка при использовании eval для JavaScript-объекта (прямой подход):', evalError);
            }
        }
        
        // Если все методы не сработали, пробуем самый простой подход
        // Ищем объекты игроков по шаблону
        const playerObjects = [];
        const playerRegex = /\{\s*id\s*:\s*(\d+)\s*,\s*name\s*:\s*['"]([^'"]+)['"]\s*,\s*teamId\s*:\s*(\d+)/g;
        let match;
        
        while ((match = playerRegex.exec(jsonString)) !== null) {
            const id = parseInt(match[1]);
            const name = match[2];
            const teamId = parseInt(match[3]);
            
            // Ищем дополнительные поля для этого игрока
            const playerStart = match.index;
            let playerEnd = playerStart;
            let openBraces = 1;
            
            // Находим конец объекта игрока
            for (let i = playerStart + 1; i < jsonString.length; i++) {
                if (jsonString[i] === '{') openBraces++;
                if (jsonString[i] === '}') openBraces--;
                
                if (openBraces === 0) {
                    playerEnd = i + 1;
                    break;
                }
            }
            
            // Получаем полный текст объекта игрока
            const playerText = jsonString.substring(playerStart, playerEnd);
            
            // Извлекаем дополнительные поля
            const age = parseInt(playerText.match(/age\s*:\s*(\d+)/) ? playerText.match(/age\s*:\s*(\d+)/)[1] : 0);
            const salary = parseInt(playerText.match(/salary\s*:\s*(\d+)/) ? playerText.match(/salary\s*:\s*(\d+)/)[1] : 0);
            const nick = playerText.match(/nick\s*:\s*['"]([^'"]+)['"]/) ? playerText.match(/nick\s*:\s*['"]([^'"]+)['"]/)[1] : name;
            const birthday = parseInt(playerText.match(/birthday\s*:\s*(\d+)/) ? playerText.match(/birthday\s*:\s*(\d+)/)[1] : 0);
            const country = playerText.match(/country\s*:\s*['"]([^'"]+)['"]/) ? playerText.match(/country\s*:\s*['"]([^'"]+)['"]/)[1] : 'Unknown';
            const order = parseInt(playerText.match(/order\s*:\s*(\d+)/) ? playerText.match(/order\s*:\s*(\d+)/)[1] : 0);
            const fame = parseInt(playerText.match(/fame\s*:\s*(\d+)/) ? playerText.match(/fame\s*:\s*(\d+)/)[1] : 0);
            
            // Извлекаем скиллы
            const totalSkill = parseInt(playerText.match(/totalSkill\s*:\s*(\d+)/) ? playerText.match(/totalSkill\s*:\s*(\d+)/)[1] : 0);
            const totalLimit = parseInt(playerText.match(/totalLimit\s*:\s*(\d+)/) ? playerText.match(/totalLimit\s*:\s*(\d+)/)[1] : 100);
            
            const aimSkillValue = parseInt(playerText.match(/aimSkillValue\s*:\s*(\d+)/) ? playerText.match(/aimSkillValue\s*:\s*(\d+)/)[1] : 0);
            const aimSkillLimit = parseInt(playerText.match(/aimSkillLimit\s*:\s*(\d+)/) ? playerText.match(/aimSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const aimSkillProgress = parseInt(playerText.match(/aimSkillProgress\s*:\s*(\d+)/) ? playerText.match(/aimSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const handlingSkillValue = parseInt(playerText.match(/handlingSkillValue\s*:\s*(\d+)/) ? playerText.match(/handlingSkillValue\s*:\s*(\d+)/)[1] : 0);
            const handlingSkillLimit = parseInt(playerText.match(/handlingSkillLimit\s*:\s*(\d+)/) ? playerText.match(/handlingSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const handlingSkillProgress = parseInt(playerText.match(/handlingSkillProgress\s*:\s*(\d+)/) ? playerText.match(/handlingSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const quicknessSkillValue = parseInt(playerText.match(/quicknessSkillValue\s*:\s*(\d+)/) ? playerText.match(/quicknessSkillValue\s*:\s*(\d+)/)[1] : 0);
            const quicknessSkillLimit = parseInt(playerText.match(/quicknessSkillLimit\s*:\s*(\d+)/) ? playerText.match(/quicknessSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const quicknessSkillProgress = parseInt(playerText.match(/quicknessSkillProgress\s*:\s*(\d+)/) ? playerText.match(/quicknessSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const determinationSkillValue = parseInt(playerText.match(/determinationSkillValue\s*:\s*(\d+)/) ? playerText.match(/determinationSkillValue\s*:\s*(\d+)/)[1] : 0);
            const determinationSkillLimit = parseInt(playerText.match(/determinationSkillLimit\s*:\s*(\d+)/) ? playerText.match(/determinationSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const determinationSkillProgress = parseInt(playerText.match(/determinationSkillProgress\s*:\s*(\d+)/) ? playerText.match(/determinationSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const awarenessSkillValue = parseInt(playerText.match(/awarenessSkillValue\s*:\s*(\d+)/) ? playerText.match(/awarenessSkillValue\s*:\s*(\d+)/)[1] : 0);
            const awarenessSkillLimit = parseInt(playerText.match(/awarenessSkillLimit\s*:\s*(\d+)/) ? playerText.match(/awarenessSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const awarenessSkillProgress = parseInt(playerText.match(/awarenessSkillProgress\s*:\s*(\d+)/) ? playerText.match(/awarenessSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const teamplaySkillValue = parseInt(playerText.match(/teamplaySkillValue\s*:\s*(\d+)/) ? playerText.match(/teamplaySkillValue\s*:\s*(\d+)/)[1] : 0);
            const teamplaySkillLimit = parseInt(playerText.match(/teamplaySkillLimit\s*:\s*(\d+)/) ? playerText.match(/teamplaySkillLimit\s*:\s*(\d+)/)[1] : 100);
            const teamplaySkillProgress = parseInt(playerText.match(/teamplaySkillProgress\s*:\s*(\d+)/) ? playerText.match(/teamplaySkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const gamesenseSkillValue = parseInt(playerText.match(/gamesenseSkillValue\s*:\s*(\d+)/) ? playerText.match(/gamesenseSkillValue\s*:\s*(\d+)/)[1] : 0);
            const gamesenseSkillLimit = parseInt(playerText.match(/gamesenseSkillLimit\s*:\s*(\d+)/) ? playerText.match(/gamesenseSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const gamesenseSkillProgress = parseInt(playerText.match(/gamesenseSkillProgress\s*:\s*(\d+)/) ? playerText.match(/gamesenseSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            const movementSkillValue = parseInt(playerText.match(/movementSkillValue\s*:\s*(\d+)/) ? playerText.match(/movementSkillValue\s*:\s*(\d+)/)[1] : 0);
            const movementSkillLimit = parseInt(playerText.match(/movementSkillLimit\s*:\s*(\d+)/) ? playerText.match(/movementSkillLimit\s*:\s*(\d+)/)[1] : 100);
            const movementSkillProgress = parseInt(playerText.match(/movementSkillProgress\s*:\s*(\d+)/) ? playerText.match(/movementSkillProgress\s*:\s*(\d+)/)[1] : 0);
            
            // Извлекаем опыт и лидерство
            const experienceLevel = parseInt(playerText.match(/experienceLevel\s*:\s*(\d+)/) ? playerText.match(/experienceLevel\s*:\s*(\d+)/)[1] : 0);
            const experienceProgression = parseInt(playerText.match(/experienceProgression\s*:\s*(\d+)/) ? playerText.match(/experienceProgression\s*:\s*(\d+)/)[1] : 0);
            const leadershipLevel = parseInt(playerText.match(/leadershipLevel\s*:\s*(\d+)/) ? playerText.match(/leadershipLevel\s*:\s*(\d+)/)[1] : 0);
            const leadershipProgression = parseInt(playerText.match(/leadershipProgression\s*:\s*(\d+)/) ? playerText.match(/leadershipProgression\s*:\s*(\d+)/)[1] : 0);
            
            // Создаем объект игрока
            const player = {
                id,
                name,
                teamId,
                age,
                salary,
                nick,
                birthday,
                country,
                order,
                fame,
                experienceLevel,
                experienceProgression,
                leadershipLevel,
                leadershipProgression,
                totalSkill,
                totalLimit,
                aimSkillValue,
                aimSkillLimit,
                aimSkillProgress,
                handlingSkillValue,
                handlingSkillLimit,
                handlingSkillProgress,
                quicknessSkillValue,
                quicknessSkillLimit,
                quicknessSkillProgress,
                determinationSkillValue,
                determinationSkillLimit,
                determinationSkillProgress,
                awarenessSkillValue,
                awarenessSkillLimit,
                awarenessSkillProgress,
                teamplaySkillValue,
                teamplaySkillLimit,
                teamplaySkillProgress,
                gamesenseSkillValue,
                gamesenseSkillLimit,
                gamesenseSkillProgress,
                movementSkillValue,
                movementSkillLimit,
                movementSkillProgress,
                specials: []
            };
            
            // Добавляем игрока в массив
            playerObjects.push(player);
        }
        
        if (playerObjects.length > 0) {
            console.log('Найдены данные игроков с помощью регулярного выражения (простой подход):', playerObjects.length);
            console.log('Результат парсинга данных игроков:', JSON.stringify(playerObjects, null, 2));
            console.log('Успешно извлечены данные о игроках:', playerObjects.length);
            // Ищем информацию о команде
            const teamInfo = extractTeamInfo(jsonString);
            
            return {
                players: playerObjects,
                teamInfo: teamInfo
            };
        }
        
        // Если все методы не сработали, возвращаем пустой массив
        console.log('Не удалось извлечь данные о игроках');
        return { players: [], teamInfo: null };
    } catch (error) {
        console.error('Ошибка при парсинге данных игроков:', error);
        return { players: [], teamInfo: null };
    }
}

/**
 * Функция для извлечения информации о команде и пользователе
 * @param {string} jsonString - Строка с JSON или HTML
 * @returns {Object|null} - Объект с информацией о команде и пользователе или null
 */
function extractTeamInfo(jsonString) {
    try {
        console.log('Извлечение информации о команде...');
        
        // Пробуем найти структуру data с информацией о команде
        const dataMatch = jsonString.match(/data\s*:\s*\[\s*\{.*?\},\s*\{.*?\},\s*\{\s*"type":\s*"data",\s*"data":\s*{\s*team\s*:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/s);
        if (dataMatch && dataMatch[1]) {
            console.log('Найдена структура data с информацией о команде');
            const teamText = dataMatch[1];
            
            // Извлекаем основные поля команды
            const teamName = extractValue(teamText, 'name');
            const teamId = extractNumber(teamText, 'id');
            const balance = extractNumber(teamText, 'balance');
            const mediaPoints = extractNumber(teamText, 'mediaPoints');
            const famePoints = extractNumber(teamText, 'famePoints');
            
            console.log('Извлеченная информация о команде:', { teamName, teamId, balance, mediaPoints, famePoints });
            
            // Ищем блок с информацией о пользователе
            const userMatch = teamText.match(/user\s*:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/s);
            if (!userMatch) {
                console.log('Информация о пользователе не найдена');
                return {
                    name: teamName,
                    id: teamId,
                    balance: balance,
                    mediaPoints: mediaPoints,
                    famePoints: famePoints,
                    user: null
                };
            }
            
            const userText = userMatch[1];
            
            // Извлекаем поля пользователя
            const username = extractValue(userText, 'username');
            const email = extractValue(userText, 'email');
            const coins = extractNumber(userText, 'coins');
            const lastName = extractValue(userText, 'lastName');
            const firstName = extractValue(userText, 'firstName');
            const birthday = extractValue(userText, 'birthday');
            const vipActive = extractBoolean(userText, 'vipActive');
            const warningPoints = extractNumber(userText, 'warningPoints');
            
            console.log('Извлеченная информация о пользователе:', { username, email, coins, lastName, firstName });
            
            return {
                name: teamName,
                id: teamId,
                balance: balance,
                mediaPoints: mediaPoints,
                famePoints: famePoints,
                user: {
                    username: username,
                    email: email,
                    coins: coins,
                    lastName: lastName,
                    firstName: firstName,
                    birthday: birthday,
                    vipActive: vipActive,
                    warningPoints: warningPoints
                }
            };
        }
        
        // Если не нашли в структуре data, пробуем найти напрямую
        const teamMatch = jsonString.match(/team\s*:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/s);
        if (!teamMatch) {
            console.log('Информация о команде не найдена');
            return null;
        }
        
        const teamText = teamMatch[1];
        
        // Извлекаем основные поля команды
        const teamName = extractValue(teamText, 'name');
        const teamId = extractNumber(teamText, 'id');
        const balance = extractNumber(teamText, 'balance');
        const mediaPoints = extractNumber(teamText, 'mediaPoints');
        const famePoints = extractNumber(teamText, 'famePoints');
        
        console.log('Извлеченная информация о команде (прямой поиск):', { teamName, teamId, balance, mediaPoints, famePoints });
        
        // Ищем блок с информацией о пользователе
        const userMatch = teamText.match(/user\s*:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/s);
        if (!userMatch) {
            console.log('Информация о пользователе не найдена (прямой поиск)');
            return {
                name: teamName,
                id: teamId,
                balance: balance,
                mediaPoints: mediaPoints,
                famePoints: famePoints,
                user: null
            };
        }
        
        const userText = userMatch[1];
        
        // Извлекаем поля пользователя
        const username = extractValue(userText, 'username');
        const email = extractValue(userText, 'email');
        const coins = extractNumber(userText, 'coins');
        const lastName = extractValue(userText, 'lastName');
        const firstName = extractValue(userText, 'firstName');
        const birthday = extractValue(userText, 'birthday');
        const vipActive = extractBoolean(userText, 'vipActive');
        const warningPoints = extractNumber(userText, 'warningPoints');
        
        console.log('Извлеченная информация о пользователе (прямой поиск):', { username, email, coins, lastName, firstName });
        
        return {
            name: teamName,
            id: teamId,
            balance: balance,
            mediaPoints: mediaPoints,
            famePoints: famePoints,
            user: {
                username: username,
                email: email,
                coins: coins,
                lastName: lastName,
                firstName: firstName,
                birthday: birthday,
                vipActive: vipActive,
                warningPoints: warningPoints
            }
        };
    } catch (error) {
        console.error('Ошибка при извлечении информации о команде:', error);
        return null;
    }
}

/**
 * Вспомогательная функция для извлечения строкового значения
 */
function extractValue(text, fieldName) {
    const regex = new RegExp(fieldName + '\\s*:\\s*["\']([^"\']*)["\']', 's');
    const match = text.match(regex);
    return match ? match[1] : null;
}

/**
 * Вспомогательная функция для извлечения числового значения
 */
function extractNumber(text, fieldName) {
    const regex = new RegExp(fieldName + '\\s*:\\s*(\\d+)', 's');
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
}

/**
 * Вспомогательная функция для извлечения булевого значения
 */
function extractBoolean(text, fieldName) {
    const regex = new RegExp(fieldName + '\\s*:\\s*(true|false)', 's');
    const match = text.match(regex);
    return match ? match[1] === 'true' : null;
}

// Экспортируем функцию для использования в других файлах
window.parsePlayersData = parsePlayersData;
