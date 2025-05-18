// Функция для копирования ссылки на тактику с анимацией
function copyTacticLink(tacticId, buttonElement) {
    // Создаем URL симуляции
    const url = `https://www.cplmanager.com/cpl/team/tactics/simulation?tactic_id=${tacticId}`;
    
    // Копируем ссылку в буфер обмена
    navigator.clipboard.writeText(url)
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
            console.error('Не удалось скопировать ссылку: ', err);
            
            // Показываем сообщение об ошибке
            buttonElement.textContent = 'Ошибка!';
            buttonElement.style.backgroundColor = '#e74c3c';
            
            // Возвращаем оригинальный текст через 1.5 секунды
            setTimeout(() => {
                buttonElement.textContent = 'Копировать ссылку';
                buttonElement.style.backgroundColor = '#3498db';
            }, 1500);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const statsTeamIdInput = document.getElementById('stats-team-id');
    const statsMapSelect = document.getElementById('stats-map');
    const statsSideSelect = document.getElementById('stats-side');
    const loadStatsBtn = document.getElementById('load-stats');
    const statsContainer = document.getElementById('stats-container');
    const statsBody = document.getElementById('stats-body');
    
    // Загрузка сохраненных настроек статистики
    loadSavedStatsSettings();
    
    // Сохранение настроек статистики при изменении
    statsTeamIdInput.addEventListener('change', saveStatsSettings);
    statsMapSelect.addEventListener('change', saveStatsSettings);
    statsSideSelect.addEventListener('change', saveStatsSettings);
    
    // Функции для работы с настройками статистики
    function saveStatsSettings() {
        const settings = {
            teamId: statsTeamIdInput.value,
            map: statsMapSelect.value,
            side: statsSideSelect.value
        };
        
        localStorage.setItem('cplManagerStatsSettings', JSON.stringify(settings));
    }
    
    function loadSavedStatsSettings() {
        const savedSettings = localStorage.getItem('cplManagerStatsSettings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            if (settings.teamId) statsTeamIdInput.value = settings.teamId;
            if (settings.map) statsMapSelect.value = settings.map;
            if (settings.side) statsSideSelect.value = settings.side;
        }
    }
    
    // Загрузка статистики тактик
    loadStatsBtn.addEventListener('click', loadTacticsStats);
    
    // Функция для загрузки статистики тактик
    function loadTacticsStats() {
        const teamId = statsTeamIdInput.value.trim();
        if (!teamId) {
            alert('Введите ID команды');
            return;
        }
        
        const map = statsMapSelect.value;
        const side = statsSideSelect.value;
        
        // Показываем индикатор загрузки
        statsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Загрузка данных...</td></tr>';
        statsContainer.style.display = 'block';
        
        // Формируем URL для запроса через CORS-прокси
        const originalUrl = `https://www.cplmanager.com/cpl/api/teams/${teamId}/tactics/stats?side=${side}&map=${map}`;
        
        // Используем более надежный CORS-прокси, который не требует временного разрешения
        const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;
        
        // Создаем невидимый iframe для загрузки данных
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.id = 'stats-iframe';
        document.body.appendChild(iframe);
        
        // Устанавливаем обработчик сообщений от iframe
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'stats-data') {
                try {
                    const data = JSON.parse(event.data.content);
                    processTacticsData(data);
                } catch (error) {
                    console.error('Ошибка при обработке данных:', error);
                    statsBody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 20px; color: red;">
                                <p>Ошибка при обработке данных: ${error.message}</p>
                            </td>
                        </tr>
                    `;
                }
                
                // Удаляем iframe после получения данных
                const iframeElement = document.getElementById('stats-iframe');
                if (iframeElement) {
                    iframeElement.remove();
                }
            }
        }, false);
        
        // Создаем HTML-страницу для iframe, которая загружает данные и отправляет их обратно
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <script>
                    fetch('${corsProxyUrl}', {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Ошибка HTTP: ' + response.status);
                            }
                            return response.json();
                        })
                        .then(data => {
                            window.parent.postMessage({
                                type: 'stats-data',
                                content: JSON.stringify(data)
                            }, '*');
                        })
                        .catch(error => {
                            window.parent.postMessage({
                                type: 'stats-error',
                                error: error.message
                            }, '*');
                        });
                </script>
            </head>
            <body></body>
            </html>
        `;
        
        // Загружаем HTML в iframe
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        // Устанавливаем таймаут для обработки случая, когда ответ не приходит
        setTimeout(() => {
            const iframeElement = document.getElementById('stats-iframe');
            if (iframeElement) {
                statsBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px; color: red;">
                            <p>Превышено время ожидания ответа от сервера.</p>
                            <p>Возможные причины:</p>
                            <ul style="text-align: left; margin: 10px 0;">
                                <li>Сервер не отвечает</li>
                                <li>Проблемы с CORS (Cross-Origin Resource Sharing)</li>
                                <li>Неверный ID команды или другие параметры</li>
                            </ul>
                        </td>
                    </tr>
                `;
                iframeElement.remove();
            }
        }, 10000); // 10 секунд таймаут
    }
    
    // Функция для обработки полученных данных
    function processTacticsData(data) {
        // Если данных нет, показываем сообщение
        if (!data || data.length === 0) {
            statsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Нет данных для отображения</td></tr>';
            return;
        }
        
        // Группируем данные по ID тактики и суммируем статистику
        const tacticStats = {};
        
        data.forEach(item => {
            if (!tacticStats[item.tacticId]) {
                tacticStats[item.tacticId] = {
                    name: item.name,
                    tacticId: item.tacticId,
                    roundsPlayed: 0,
                    roundsWon: 0
                };
            }
            
            tacticStats[item.tacticId].roundsPlayed += item.roundsPlayed;
            tacticStats[item.tacticId].roundsWon += item.roundsWon;
        });
        
        // Преобразуем объект в массив и вычисляем винрейт
        const statsArray = Object.values(tacticStats).map(tactic => {
            const winRate = tactic.roundsPlayed > 0 ? (tactic.roundsWon / tactic.roundsPlayed * 100).toFixed(1) : 0;
            return {
                ...tactic,
                winRate: parseFloat(winRate)
            };
        });
        
        // Сортируем по винрейту (от большего к меньшему)
        statsArray.sort((a, b) => b.winRate - a.winRate);
        
        // Отображаем данные в таблице
        displayTacticsStats(statsArray);
    }
    
    // Функция для отображения статистики тактик в таблице
    function displayTacticsStats(stats) {
        statsBody.innerHTML = '';
        
        stats.forEach(tactic => {
            const row = document.createElement('tr');
            
            // Создаем ячейки таблицы
            row.innerHTML = `
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${tactic.name}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${tactic.tacticId}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${tactic.roundsPlayed}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${tactic.roundsWon}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${tactic.winRate}%</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">
                    <button 
                       onclick="copyTacticLink(${tactic.tacticId}, this)" 
                       style="display: inline-block; padding: 5px 10px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; transition: all 0.3s ease;">
                        Копировать ссылку
                    </button>
                </td>
            `;
            
            // Добавляем строку в таблицу
            statsBody.appendChild(row);
        });
    }
    
    // Автоматическая загрузка статистики при изменении карты или стороны
    statsMapSelect.addEventListener('change', () => {
        if (statsTeamIdInput.value.trim()) {
            loadTacticsStats();
        }
    });
    
    statsSideSelect.addEventListener('change', () => {
        if (statsTeamIdInput.value.trim()) {
            loadTacticsStats();
        }
    });
});
