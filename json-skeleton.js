document.addEventListener('DOMContentLoaded', () => {
    // Добавляем новый раздел в таб "Проиграть матч"
    const matchTab = document.getElementById('match-tab');
    const matchResults = document.getElementById('match-results');
    
    // Создаем контейнер для инструмента анализа JSON
    const jsonAnalyzerContainer = document.createElement('div');
    jsonAnalyzerContainer.className = 'metadata-container';
    jsonAnalyzerContainer.style.marginTop = '20px';
    
    // Добавляем заголовок
    const analyzerTitle = document.createElement('h2');
    analyzerTitle.textContent = 'Анализатор структуры JSON';
    jsonAnalyzerContainer.appendChild(analyzerTitle);
    
    // Добавляем описание
    const analyzerDescription = document.createElement('p');
    analyzerDescription.textContent = 'Этот инструмент анализирует структуру JSON и извлекает блок tactics. Вставьте ваш JSON и нажмите "Анализировать".';
    jsonAnalyzerContainer.appendChild(analyzerDescription);
    
    // Создаем форму
    const analyzerForm = document.createElement('div');
    analyzerForm.className = 'form-group';
    
    // Добавляем текстовое поле для ввода JSON
    const jsonInput = document.createElement('textarea');
    jsonInput.id = 'json-input';
    jsonInput.placeholder = 'Вставьте JSON-данные...';
    jsonInput.style.height = '150px';
    analyzerForm.appendChild(jsonInput);
    
    // Добавляем кнопки
    const analyzerButtons = document.createElement('div');
    analyzerButtons.className = 'buttons';
    analyzerButtons.style.justifyContent = 'center';
    
    // Кнопка анализа
    const analyzeButton = document.createElement('button');
    analyzeButton.className = 'primary';
    analyzeButton.textContent = 'Анализировать';
    analyzeButton.onclick = analyzeJson;
    analyzerButtons.appendChild(analyzeButton);
    
    // Кнопка очистки
    const clearButton = document.createElement('button');
    clearButton.className = 'secondary';
    clearButton.textContent = 'Очистить';
    clearButton.onclick = () => {
        jsonInput.value = '';
        jsonOutput.value = '';
    };
    analyzerButtons.appendChild(clearButton);
    
    analyzerForm.appendChild(analyzerButtons);
    jsonAnalyzerContainer.appendChild(analyzerForm);
    
    // Добавляем поле для вывода результата
    const outputContainer = document.createElement('div');
    outputContainer.className = 'form-group';
    outputContainer.style.marginTop = '15px';
    
    const outputLabel = document.createElement('label');
    outputLabel.textContent = 'Результат анализа:';
    outputContainer.appendChild(outputLabel);
    
    const jsonOutput = document.createElement('textarea');
    jsonOutput.id = 'json-output';
    jsonOutput.readOnly = true;
    jsonOutput.style.height = '300px';
    outputContainer.appendChild(jsonOutput);
    
    // Кнопка копирования результата
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Копировать результат';
    copyButton.style.marginTop = '10px';
    copyButton.onclick = () => {
        jsonOutput.select();
        document.execCommand('copy');
        
        // Показываем сообщение об успешном копировании
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Скопировано!';
        copyButton.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.backgroundColor = '#3498db';
        }, 1500);
    };
    outputContainer.appendChild(copyButton);
    
    jsonAnalyzerContainer.appendChild(outputContainer);
    
    // Вставляем контейнер перед результатами матча
    matchTab.insertBefore(jsonAnalyzerContainer, matchResults);
    
    // Функция для анализа JSON
    function analyzeJson() {
        const jsonText = jsonInput.value.trim();
        
        if (!jsonText) {
            alert('Пожалуйста, вставьте JSON-данные');
            return;
        }
        
        try {
            // Пытаемся найти блок tactics
            let tacticsBlock = '';
            
            // Проверяем, содержит ли текст блок tactics
            if (jsonText.includes('tactics:')) {
                // Ищем начало блока tactics
                const tacticsStart = jsonText.indexOf('tactics:');
                if (tacticsStart !== -1) {
                    // Ищем открывающую скобку массива
                    const arrayStart = jsonText.indexOf('[', tacticsStart);
                    if (arrayStart !== -1) {
                        // Ищем закрывающую скобку массива
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
                            tacticsBlock = jsonText.substring(tacticsStart, arrayEnd);
                            
                            // Извлекаем первые 2-3 элемента массива
                            const tacticsArray = jsonText.substring(arrayStart, arrayEnd);
                            const firstItems = extractFirstItems(tacticsArray, 3);
                            
                            // Формируем результат
                            const result = `tactics: ${firstItems}`;
                            jsonOutput.value = result;
                            return;
                        }
                    }
                }
            }
            
            // Если не удалось найти блок tactics, пробуем парсить JSON
            try {
                const jsonData = JSON.parse(jsonText);
                
                // Если это объект с полем tactics
                if (jsonData.tactics && Array.isArray(jsonData.tactics)) {
                    // Извлекаем первые 2-3 элемента массива tactics
                    const firstItems = JSON.stringify(jsonData.tactics.slice(0, 3), null, 2);
                    
                    // Формируем результат
                    const result = `tactics: ${firstItems}`;
                    jsonOutput.value = result;
                    return;
                }
                
                // Если это массив, предполагаем, что это и есть tactics
                if (Array.isArray(jsonData)) {
                    // Извлекаем первые 2-3 элемента массива
                    const firstItems = JSON.stringify(jsonData.slice(0, 3), null, 2);
                    
                    // Формируем результат
                    const result = `tactics: ${firstItems}`;
                    jsonOutput.value = result;
                    return;
                }
                
                // Если не удалось найти блок tactics, выводим структуру JSON
                const skeleton = createJsonSkeleton(jsonData);
                jsonOutput.value = JSON.stringify(skeleton, null, 2);
            } catch (jsonError) {
                // Если не удалось парсить JSON, пробуем извлечь данные с помощью регулярных выражений
                const tacticsMatch = jsonText.match(/tactics:\s*\[\s*{\s*id:/);
                
                if (tacticsMatch) {
                    // Ищем первые 2-3 объекта тактик
                    const tacticRegex = /{[^{}]*id:[^{}]*homeTacticName:[^{}]*awayTacticName:[^{}]*round:[^{}]*won:[^{}]*side:[^{}]*homeSide:[^{}]*awayTacticId:[^{}]*homeTacticId:[^{}]*}/g;
                    
                    const tactics = [];
                    let match;
                    let count = 0;
                    
                    while ((match = tacticRegex.exec(jsonText)) !== null && count < 3) {
                        tactics.push(match[0]);
                        count++;
                    }
                    
                    if (tactics.length > 0) {
                        // Формируем результат
                        const result = `tactics: [\n  ${tactics.join(',\n  ')}\n]`;
                        jsonOutput.value = result;
                        return;
                    }
                }
                
                // Если все методы не сработали, выводим сообщение об ошибке
                throw new Error('Не удалось извлечь структуру JSON');
            }
        } catch (error) {
            alert('Ошибка при анализе JSON: ' + error.message);
            console.error('Ошибка при анализе JSON:', error);
        }
    }
    
    // Функция для извлечения первых N элементов массива
    function extractFirstItems(arrayText, count) {
        const items = [];
        let bracketCount = 0;
        let currentItem = '';
        let inItem = false;
        
        for (let i = 0; i < arrayText.length; i++) {
            const char = arrayText[i];
            
            if (char === '{' && bracketCount === 0) {
                inItem = true;
                bracketCount = 1;
                currentItem = '{';
            } else if (inItem) {
                currentItem += char;
                
                if (char === '{') {
                    bracketCount++;
                } else if (char === '}') {
                    bracketCount--;
                    
                    if (bracketCount === 0) {
                        items.push(currentItem);
                        inItem = false;
                        
                        if (items.length >= count) {
                            break;
                        }
                    }
                }
            }
        }
        
        return `[\n  ${items.join(',\n  ')}\n]`;
    }
    
    // Функция для создания "скелета" JSON
    function createJsonSkeleton(json) {
        if (json === null) {
            return null;
        }
        
        if (Array.isArray(json)) {
            if (json.length === 0) {
                return [];
            }
            
            // Для массива возвращаем первые 2-3 элемента
            return json.slice(0, 3).map(item => createJsonSkeleton(item));
        }
        
        if (typeof json === 'object') {
            const skeleton = {};
            
            // Для объекта возвращаем структуру с ключами
            for (const key in json) {
                if (json.hasOwnProperty(key)) {
                    skeleton[key] = createJsonSkeleton(json[key]);
                }
            }
            
            return skeleton;
        }
        
        // Для примитивных типов возвращаем примеры значений
        if (typeof json === 'string') {
            return 'example_string';
        }
        
        if (typeof json === 'number') {
            return 0;
        }
        
        if (typeof json === 'boolean') {
            return false;
        }
        
        return json;
    }
});
