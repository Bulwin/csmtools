/**
 * Конвертация из массивного формата в UI-формат
 * @param {Array} rawWaypoints - Массив массивов с точками для каждого игрока
 * @returns {Array} - Массив объектов в UI-формате
 */
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

/**
 * Конвертация из UI-формата в массивный формат
 * @param {Array} uiWaypoints - Массив объектов в UI-формате
 * @returns {Array} - Массив массивов с точками для каждого игрока
 */
function convertToArrayFormat(uiWaypoints) {
  // Создаем массив для 5 игроков (можно легко адаптировать под любое количество)
  const grouped = Array.from({ length: 5 }, () => []);

  if (!Array.isArray(uiWaypoints)) {
    console.error('Ошибка: uiWaypoints не является массивом');
    return grouped;
  }

  uiWaypoints.forEach(wp => {
    if (!wp || typeof wp !== 'object') {
      console.error('Ошибка: неверный формат waypoint в UI-формате');
      return;
    }

    const playerIndex = wp.player - 1;
    
    // Проверяем, что индекс игрока в допустимом диапазоне
    if (playerIndex < 0 || playerIndex >= grouped.length) {
      console.error(`Ошибка: индекс игрока ${wp.player} вне допустимого диапазона`);
      return;
    }

    const nade = wp.nade || { x: 0, y: 0, type: 0 };

    grouped[playerIndex].push([
      wp.x,
      wp.y,
      wp.viewAngle,
      wp.type,
      String(wp.syncTime), // Всегда сохраняем как строку
      nade.x,
      nade.y,
      nade.type
    ]);
  });

  return grouped;
}
