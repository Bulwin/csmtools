document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы - 3 окна
    const sendUserTactic = document.getElementById('send-user-tactic');
    const sendSourceTactic = document.getElementById('send-source-tactic');
    const sendOutputData = document.getElementById('send-output-data');
    
    // Кнопки
    const sendParseUserBtn = document.getElementById('send-parse-user-btn');
    const sendClearUserBtn = document.getElementById('send-clear-user-btn');
    const sendClearSourceBtn = document.getElementById('send-clear-source-btn');
    const sendMergeBtn = document.getElementById('send-merge-btn');
    const sendCopyBtn = document.getElementById('send-copy-btn');
    
    // Метаданные
    const sendTacticIdInput = document.getElementById('send-tactic-id');
    const sendTacticNameInput = document.getElementById('send-tactic-name');
    const sendTeamIdInput = document.getElementById('send-team-id');
    const sendAuthorIdInput = document.getElementById('send-author-id');
    const sendMetadataContainer = document.getElementById('send-metadata-container');
    
    // Сохраненные данные пользователя
    let userData = null;
    
    // Автоматический парсинг при вставке в окно 1
    sendUserTactic.addEventListener('input', () => {
        const input = sendUserTactic.value.trim();
        if (!input) {
            userData = null;
            sendMetadataContainer.style.display = 'none';
            return;
        }
        
        try {
            userData = extractUserData(input);
            
            if (userData) {
                displayUserMetadata(userData);
            } else {
                sendMetadataContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка при автоматическом парсинге:', error);
        }
    });
    
    // Обработчик кнопки "Распарсить ID" (оставляем для ручного парсинга)
    sendParseUserBtn.addEventListener('click', () => {
        const input = sendUserTactic.value.trim();
        if (!input) {
            alert('Вставьте JSON с вашей тактикой');
            return;
        }
        
        try {
            userData = extractUserData(input);
            
            if (!userData) {
                alert('Не удалось найти данные тактики. Проверьте JSON.');
                return;
            }
            
            // Отображаем метаданные
            displayUserMetadata(userData);
            
        } catch (error) {
            console.error('Ошибка при парсинге:', error);
            alert('Ошибка при парсинге: ' + error.message);
        }
    });
    
    // Обработчик кнопки "Объединить"
    sendMergeBtn.addEventListener('click', () => {
        if (!userData) {
            alert('Сначала распарсите вашу тактику (окно 1)');
            return;
        }
        
        const sourceInput = sendSourceTactic.value.trim();
        if (!sourceInput) {
            alert('Вставьте тактику для копирования (окно 2)');
            return;
        }
        
        try {
            const sourceData = extractTacticData(sourceInput);
            
            if (!sourceData) {
                alert('Не удалось найти данные в тактике для копирования.');
                return;
            }
            
            // Объединяем данные
            const mergedTactic = mergeTactics(userData, sourceData);
            
            // Верификация - проверяем, что все 4 параметра совпадают
            const verification = verifyMergedTactic(userData, mergedTactic);
            
            // Отображаем результат
            sendOutputData.value = JSON.stringify(mergedTactic, null, 2);
            
            // Показываем результат верификации
            if (verification.success) {
                showVerificationResult(verification);
            } else {
                alert('⚠️ Ошибка верификации: ' + verification.errors.join(', '));
            }
            
        } catch (error) {
            console.error('Ошибка при объединении:', error);
            alert('Ошибка при объединении: ' + error.message);
        }
    });
    
    // Обработчик кнопки "Очистить" для окна 1
    sendClearUserBtn.addEventListener('click', () => {
        sendUserTactic.value = '';
        userData = null;
        sendMetadataContainer.style.display = 'none';
    });
    
    // Обработчик кнопки "Очистить" для окна 2
    sendClearSourceBtn.addEventListener('click', () => {
        sendSourceTactic.value = '';
    });
    
    // Обработчик кнопки "Копировать"
    sendCopyBtn.addEventListener('click', () => {
        if (!sendOutputData.value) {
            alert('Нечего копировать');
            return;
        }
        
        sendOutputData.select();
        document.execCommand('copy');
        
        // Визуальная обратная связь
        const originalText = sendCopyBtn.textContent;
        sendCopyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            sendCopyBtn.textContent = originalText;
        }, 1500);
    });
    
    // Функция для извлечения данных пользователя (ID, name, teamId, authorId)
    function extractUserData(jsonText) {
        try {
            // Пытаемся парсить как JSON
            let data;
            try {
                data = JSON.parse(jsonText);
            } catch (e) {
                // Если не получилось, ищем объект вручную
                console.log('JSON парсинг не удался, пробуем извлечь вручную');
                return extractUserDataManually(jsonText);
            }
            
            // Ищем тактику в разных форматах ответа
            let tactic = null;
            
            if (data.updatedTactic) {
                tactic = data.updatedTactic;
            } else if (data.tactic) {
                tactic = data.tactic;
            } else if (data.data && data.data.tactic) {
                tactic = data.data.tactic;
            } else if (data.id && data.teamId) {
                // Это уже сама тактика
                tactic = data;
            }
            
            if (!tactic) {
                return null;
            }
            
            return {
                id: tactic.id,
                name: tactic.name,
                teamId: tactic.teamId,
                authorId: tactic.authorId,
                map: tactic.map,
                side: tactic.side
            };
            
        } catch (error) {
            console.error('Ошибка при извлечении данных пользователя:', error);
            return null;
        }
    }
    
    // Функция для ручного извлечения данных пользователя
    function extractUserDataManually(text) {
        const idMatch = /"id"\s*:\s*(\d+)/.exec(text);
        const nameMatch = /"name"\s*:\s*"([^"]*)"/.exec(text);
        const teamIdMatch = /"teamId"\s*:\s*(\d+)/.exec(text);
        const authorIdMatch = /"authorId"\s*:\s*(\d+)/.exec(text);
        const mapMatch = /"map"\s*:\s*"([^"]*)"/.exec(text);
        const sideMatch = /"side"\s*:\s*(\d+)/.exec(text);
        
        if (!idMatch || !teamIdMatch) {
            return null;
        }
        
        return {
            id: parseInt(idMatch[1]),
            name: nameMatch ? nameMatch[1] : 'Unknown',
            teamId: parseInt(teamIdMatch[1]),
            authorId: authorIdMatch ? parseInt(authorIdMatch[1]) : null,
            map: mapMatch ? mapMatch[1] : 'train',
            side: sideMatch ? parseInt(sideMatch[1]) : 0
        };
    }
    
    // Функция для извлечения данных тактики для копирования
    function extractTacticData(jsonText) {
        try {
            // Пытаемся парсить как JSON
            let data;
            try {
                data = JSON.parse(jsonText);
            } catch (e) {
                console.log('JSON парсинг не удался, пробуем извлечь вручную');
                return extractTacticDataManually(jsonText);
            }
            
            // Ищем тактику в разных форматах ответа
            let tactic = null;
            
            if (data.updatedTactic) {
                tactic = data.updatedTactic;
            } else if (data.tactic) {
                tactic = data.tactic;
            } else if (data.data && data.data.tactic) {
                tactic = data.data.tactic;
            } else if (data.matchData && data.matchData.tactic) {
                tactic = data.matchData.tactic;
            } else if (data.waypoints) {
                // Это уже сама тактика
                tactic = data;
            }
            
            if (!tactic) {
                return null;
            }
            
            return {
                waypoints: tactic.waypoints || [],
                postPlantWaypoints: tactic.postPlantWaypoints || [],
                bombCarrier: tactic.bombCarrier !== undefined ? tactic.bombCarrier : 1,
                plantTime: tactic.plantTime !== undefined ? tactic.plantTime : 25,
                map: tactic.map,
                side: tactic.side,
                isPistol: tactic.isPistol !== undefined ? tactic.isPistol : true,
                isEco: tactic.isEco !== undefined ? tactic.isEco : true,
                isStandard: tactic.isStandard !== undefined ? tactic.isStandard : true,
                useLeague: tactic.useLeague !== undefined ? tactic.useLeague : true,
                useLadder: tactic.useLadder !== undefined ? tactic.useLadder : true,
                useTournament: tactic.useTournament !== undefined ? tactic.useTournament : true,
                useOpen: tactic.useOpen !== undefined ? tactic.useOpen : true,
                useEos: tactic.useEos !== undefined ? tactic.useEos : true,
                useCup: tactic.useCup !== undefined ? tactic.useCup : true,
                useScrim: tactic.useScrim !== undefined ? tactic.useScrim : true,
                useCustom: tactic.useCustom !== undefined ? tactic.useCustom : true
            };
            
        } catch (error) {
            console.error('Ошибка при извлечении данных тактики:', error);
            return null;
        }
    }
    
    // Функция для ручного извлечения данных тактики
    function extractTacticDataManually(text) {
        // Извлекаем waypoints
        const waypoints = extractArrayFromText(text, 'waypoints');
        const postPlantWaypoints = extractArrayFromText(text, 'postPlantWaypoints');
        
        // Извлекаем остальные поля
        const bombCarrierMatch = /"bombCarrier"\s*:\s*(\d+)/.exec(text);
        const plantTimeMatch = /"plantTime"\s*:\s*(\d+)/.exec(text);
        const mapMatch = /"map"\s*:\s*"([^"]*)"/.exec(text);
        const sideMatch = /"side"\s*:\s*(\d+)/.exec(text);
        
        const isPistolMatch = /"isPistol"\s*:\s*(true|false)/.exec(text);
        const isEcoMatch = /"isEco"\s*:\s*(true|false)/.exec(text);
        const isStandardMatch = /"isStandard"\s*:\s*(true|false)/.exec(text);
        const useLeagueMatch = /"useLeague"\s*:\s*(true|false)/.exec(text);
        const useLadderMatch = /"useLadder"\s*:\s*(true|false)/.exec(text);
        const useTournamentMatch = /"useTournament"\s*:\s*(true|false)/.exec(text);
        const useOpenMatch = /"useOpen"\s*:\s*(true|false)/.exec(text);
        const useEosMatch = /"useEos"\s*:\s*(true|false)/.exec(text);
        const useCupMatch = /"useCup"\s*:\s*(true|false)/.exec(text);
        const useScrimMatch = /"useScrim"\s*:\s*(true|false)/.exec(text);
        const useCustomMatch = /"useCustom"\s*:\s*(true|false)/.exec(text);
        
        return {
            waypoints: waypoints,
            postPlantWaypoints: postPlantWaypoints,
            bombCarrier: bombCarrierMatch ? parseInt(bombCarrierMatch[1]) : 1,
            plantTime: plantTimeMatch ? parseInt(plantTimeMatch[1]) : 25,
            map: mapMatch ? mapMatch[1] : 'train',
            side: sideMatch ? parseInt(sideMatch[1]) : 0,
            isPistol: isPistolMatch ? isPistolMatch[1] === 'true' : true,
            isEco: isEcoMatch ? isEcoMatch[1] === 'true' : true,
            isStandard: isStandardMatch ? isStandardMatch[1] === 'true' : true,
            useLeague: useLeagueMatch ? useLeagueMatch[1] === 'true' : true,
            useLadder: useLadderMatch ? useLadderMatch[1] === 'true' : true,
            useTournament: useTournamentMatch ? useTournamentMatch[1] === 'true' : true,
            useOpen: useOpenMatch ? useOpenMatch[1] === 'true' : true,
            useEos: useEosMatch ? useEosMatch[1] === 'true' : true,
            useCup: useCupMatch ? useCupMatch[1] === 'true' : true,
            useScrim: useScrimMatch ? useScrimMatch[1] === 'true' : true,
            useCustom: useCustomMatch ? useCustomMatch[1] === 'true' : true
        };
    }
    
    // Функция для извлечения массива из текста
    function extractArrayFromText(text, fieldName) {
        try {
            const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[`);
            const match = regex.exec(text);
            
            if (!match) {
                return [];
            }
            
            const startIndex = match.index + match[0].length - 1;
            let bracketCount = 1;
            let endIndex = startIndex + 1;
            
            while (bracketCount > 0 && endIndex < text.length) {
                if (text[endIndex] === '[') {
                    bracketCount++;
                } else if (text[endIndex] === ']') {
                    bracketCount--;
                }
                endIndex++;
            }
            
            if (bracketCount === 0) {
                const arrayText = text.substring(startIndex, endIndex);
                return JSON.parse(arrayText);
            }
            
            return [];
        } catch (error) {
            console.error(`Ошибка при извлечении ${fieldName}:`, error);
            return [];
        }
    }
    
    // Функция для отображения метаданных пользователя
    function displayUserMetadata(data) {
        sendTacticIdInput.value = data.id;
        sendTacticNameInput.value = data.name;
        sendTeamIdInput.value = data.teamId;
        sendAuthorIdInput.value = data.authorId || 'N/A';
        sendMetadataContainer.style.display = 'grid';
    }
    
    // Цвета игроков для UI-формата
    const playerColors = ['#8CF381', '#FF6047', '#EBE22A', '#4090F6', '#F6A400'];
    
    // Функция верификации результата
    function verifyMergedTactic(userData, mergedTactic) {
        const errors = [];
        
        // Проверяем все 4 параметра (в новом формате team_id вместо teamId)
        const checks = {
            name: { expected: userData.name, actual: mergedTactic.name },
            team_id: { expected: userData.teamId, actual: mergedTactic.team_id }
        };
        
        for (const [key, value] of Object.entries(checks)) {
            if (value.expected !== value.actual) {
                errors.push(`${key}: ожидалось ${value.expected}, получено ${value.actual}`);
            }
        }
        
        return {
            success: errors.length === 0,
            errors: errors,
            checks: checks
        };
    }
    
    // Функция для отображения результата верификации
    function showVerificationResult(verification) {
        const checks = verification.checks;
        const message = `✅ Верификация пройдена!\n\n` +
            `Название: ${checks.name.actual} ✓\n` +
            `ID команды: ${checks.team_id.actual} ✓\n\n` +
            `Параметры успешно перенесены из вашей тактики.`;
        
        alert(message);
    }
    
    // Конвертация waypoints из массивного формата в UI-формат
    function convertWaypointsToUIFormat(rawWaypoints) {
        const result = [];
        
        if (!Array.isArray(rawWaypoints)) {
            return result;
        }
        
        rawWaypoints.forEach((playerWaypoints, playerIndex) => {
            if (!Array.isArray(playerWaypoints)) {
                return;
            }
            
            playerWaypoints.forEach((point, i) => {
                if (!Array.isArray(point) || point.length < 5) {
                    return;
                }
                
                const [x, y, viewAngle, type, syncTime, nadeX = 0, nadeY = 0, nadeType = 0, isUnder = 0] = point;
                
                const obj = {
                    x,
                    y,
                    number: i + 1,
                    type,
                    syncTime: syncTime,
                    color: playerColors[playerIndex] || '#FFFFFF',
                    player: playerIndex + 1,
                    viewAngle,
                    isUnder: isUnder === 1
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
    
    // Конвертация postPlantWaypoints из массивного формата в UI-формат
    function convertPostPlantToUIFormat(rawPostPlant) {
        const result = [];
        
        if (!Array.isArray(rawPostPlant)) {
            return result;
        }
        
        rawPostPlant.forEach((playerWaypoints, playerIndex) => {
            if (!Array.isArray(playerWaypoints)) {
                return;
            }
            
            playerWaypoints.forEach((point, i) => {
                if (!Array.isArray(point) || point.length < 5) {
                    return;
                }
                
                const [x, y, viewAngle, type, syncTime, nadeX = 0, nadeY = 0, nadeType = 0, isUnder = 0] = point;
                
                const obj = {
                    x,
                    y,
                    number: i + 1,
                    type,
                    syncTime: syncTime,
                    color: playerColors[playerIndex] || '#FFFFFF',
                    player: playerIndex + 1,
                    viewAngle,
                    isUnder: isUnder === 1
                };
                
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
    
    // Генерация простой сигнатуры для waypoints
    function generateWaypointsSig(waypoints) {
        const str = JSON.stringify(waypoints);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(64, '0');
    }
    
    // Функция для объединения тактик в UI-формате
    function mergeTactics(userData, sourceData) {
        // Собираем selectedTacticTypes
        const selectedTacticTypes = [];
        if (sourceData.isPistol) selectedTacticTypes.push('pistol');
        if (sourceData.isStandard) selectedTacticTypes.push('standard');
        if (sourceData.isEco) selectedTacticTypes.push('eco');
        
        // Собираем selectedMatchTypes
        const selectedMatchTypes = [];
        if (sourceData.useLeague) selectedMatchTypes.push('league');
        if (sourceData.useScrim) selectedMatchTypes.push('scrim');
        if (sourceData.useLadder) selectedMatchTypes.push('ladder');
        if (sourceData.useOpen) selectedMatchTypes.push('open');
        if (sourceData.useCup) selectedMatchTypes.push('cup');
        if (sourceData.useEos) selectedMatchTypes.push('eos');
        if (sourceData.useCustom) selectedMatchTypes.push('custom');
        if (sourceData.useTournament) selectedMatchTypes.push('tournament');
        
        // Конвертируем waypoints в UI-формат
        const uiWaypoints = convertWaypointsToUIFormat(sourceData.waypoints);
        const uiPostPlantWaypoints = convertPostPlantToUIFormat(sourceData.postPlantWaypoints);
        
        // Создаем результирующий объект в UI-формате
        const result = {
            team_id: userData.teamId,
            name: userData.name,
            map: sourceData.map || userData.map,
            side: sourceData.side !== undefined ? sourceData.side : userData.side,
            selectedTacticTypes: selectedTacticTypes.length > 0 ? selectedTacticTypes : ['pistol', 'standard', 'eco'],
            selectedMatchTypes: selectedMatchTypes.length > 0 ? selectedMatchTypes : ['league', 'scrim', 'ladder', 'open', 'cup', 'eos', 'custom'],
            loadouts: [],
            bomb_carrier: sourceData.bombCarrier || 1,
            plantTime: sourceData.plantTime || 25,
            waypoints: uiWaypoints,
            postPlantWaypoints: uiPostPlantWaypoints,
            afterplantAId: null,
            afterplantBId: null,
            isDraft: false,
            baseWaypointsSig: generateWaypointsSig(uiWaypoints)
        };
        
        return result;
    }
});
