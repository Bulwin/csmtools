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
    
    // Функция верификации результата
    function verifyMergedTactic(userData, mergedTactic) {
        const errors = [];
        const tactic = mergedTactic.updatedTactic;
        
        // Проверяем все 4 параметра
        const checks = {
            id: { expected: userData.id, actual: tactic.id },
            name: { expected: userData.name, actual: tactic.name },
            teamId: { expected: userData.teamId, actual: tactic.teamId },
            authorId: { expected: userData.authorId, actual: tactic.authorId }
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
            `ID тактики: ${checks.id.actual} ✓\n` +
            `Название: ${checks.name.actual} ✓\n` +
            `ID команды: ${checks.teamId.actual} ✓\n` +
            `ID автора: ${checks.authorId.actual} ✓\n\n` +
            `Все 4 параметра успешно перенесены из вашей тактики.`;
        
        alert(message);
    }
    
    // Функция для объединения тактик
    function mergeTactics(userData, sourceData) {
        // Создаем результирующий объект - берем данные из sourceData, но ID из userData
        const result = {
            success: true,
            updatedTactic: {
                id: userData.id,
                name: userData.name,
                side: sourceData.side !== undefined ? sourceData.side : userData.side,
                teamId: userData.teamId,
                tacticGroupId: null,
                waypoints: sourceData.waypoints,
                postPlantWaypoints: sourceData.postPlantWaypoints,
                bombCarrier: sourceData.bombCarrier,
                type: null,
                creationDate: new Date().toISOString(),
                map: sourceData.map || userData.map,
                isPistol: sourceData.isPistol,
                isEco: sourceData.isEco,
                isStandard: sourceData.isStandard,
                useLeague: sourceData.useLeague,
                useLadder: sourceData.useLadder,
                useTournament: sourceData.useTournament,
                useOpen: sourceData.useOpen,
                useEos: sourceData.useEos,
                useCup: sourceData.useCup,
                useScrim: sourceData.useScrim,
                useCustom: sourceData.useCustom,
                status: "draft",
                order: null,
                plantTime: sourceData.plantTime,
                authorId: userData.authorId,
                afterplantAId: null,
                afterplantBId: null
            },
            name: false
        };
        
        return result;
    }
});
