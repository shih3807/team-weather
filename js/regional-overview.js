// 取得查詢的日期格式，預期要查明天開始的天氣 e.g.2026-01-28T00:00:00
function getweekdayDate(weekdays) {
  const today = new Date();
  const weekday = new Date(today);
  weekday.setDate(today.getDate() + weekdays);

  const year = weekday.getFullYear();
  const month = String(weekday.getMonth() + 1).padStart(2, '0');
  const day = String(weekday.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}

// 取得氣象局的臺灣各鄉鎮市區未來1週天氣預報
async function fetchWeekWeatherInfo() {
  const ElementName = '天氣預報綜合描述';
  const timeFrom = getweekdayDate(1); //1的意思是今天加一天，預期從明天開始查
  const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=${CWB_API_KEY}&ElementName=${ElementName}&timeFrom=${timeFrom}`;
  const res = await fetch(URL, {
    method: 'GET',
  });
  const result = await res.json();

  // data取到"Location" 包含縣市和天氣資訊
  const data = result.records.Locations[0].Location;

  return data;
}

// 從 WeatherDescription 中只保留天氣和溫度資訊（移除降雨機率）
function extractWeatherInfo(description) {
  // 先移除降雨機率部分
  const withoutRainfall = description.replace(/降雨機率[^。]*。/g, '');
  // 使用正則表達式匹配到"溫度攝氏...度。"為止的部分
  const match = withoutRainfall.match(/^(.+?溫度攝氏[^。]+度。)/);
  return match ? match[1] : withoutRainfall;
}

// 整理氣象局API取得的資料
function extractWeatherDataGrouped(data) {
  const transformData = {};

  data.forEach((location) => {
    const locationName = location.LocationName;
    transformData[locationName] = [];

    location.WeatherElement.forEach((element) => {
      element.Time.forEach((time) => {
        time.ElementValue.forEach((value) => {
          if (value.WeatherDescription) {
            // 只保留天氣、降雨機率和溫度資訊
            const trimmedDescription = extractWeatherInfo(
              value.WeatherDescription
            );
            transformData[locationName].push({
              StartTime: time.StartTime,
              EndTime: time.EndTime,
              WeatherDescription: trimmedDescription,
            });
          }
        });
      });
    });

    // 只保留 StartTime 的小時是 06 的項目
    transformData[locationName] = transformData[locationName].filter((item) => {
      // 檢查 StartTime 是否包含 'T06:' (小時為 06)
      return item.StartTime.includes('T06:');
    });
  });

  return transformData;
}

// 將氣象局整理過的資料保留 縣市+一周天氣概況
function resultData(transformData) {
  const result = [];

  // 遍歷每個縣市
  for (const [county, weatherData] of Object.entries(transformData)) {
    // 建立新陣列，第一個元素是縣市名稱
    const transformedArray = [county];

    // 將該縣市的所有 WeatherDescription 值加入陣列，最多6個（加上縣市名稱共7個元素）
    weatherData.slice(0, 6).forEach((item) => {
      transformedArray.push(item.WeatherDescription);
    });

    // 將轉換後的陣列加入結果
    result.push(transformedArray);
  }

  return result;
}

// 使用 async/await 等待 Promise 解析
(async () => {
  try {
    const data = await fetchWeekWeatherInfo();
    const transformData = extractWeatherDataGrouped(data);
    console.log('每天氣象:', transformData);
    const tableData = resultData(transformData);
    console.log('最終結果:', tableData);

    // 取得現有的 table 元素
    const table = document.querySelector('.weather-table');
    if (!table) {
      console.error('找不到 weather-table 元素');
      return;
    }

    // 清空現有內容
    table.innerHTML = '';

    // 建立表頭
    const headerRow = document.createElement('tr');
    const headers = ['縣市'];
    const days = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ];

    for (let i = 1; i < 7; i++) {
      const dateString = getweekdayDate(i);
      const date = new Date(dateString);
      const dayOfWeek = date.getDay(); // 0-6，0 是星期日
      headers.push(days[dayOfWeek]);
    }

    headers.forEach((text) => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 建立資料列
    tableData.forEach((rowData) => {
      const row = document.createElement('tr');
      rowData.forEach((cellData, cellIndex) => {
        const td = document.createElement('td');
        let formattedText = cellData;
        
        // 除了縣市欄位（索引0）之外，其他所有天氣描述欄位都要處理圖片
        if (cellIndex > 0) {
          // 決定使用哪個圖片
          let imageSrc = './image/cloud.png'; // 預設
          if (cellData.includes('雨')) {
            imageSrc = './image/rain.png';
          } else if (cellData.includes('晴')) {
            imageSrc = './image/sun.png';
          }
          
          // 只替換第一個句號為圖片，圖片後面加上換行
          formattedText = cellData.replace(/。/, `<img src="${imageSrc}" alt="" style="vertical-align: middle; margin: 0 2px;"><br>`);
        }
        
        // 將剩餘的句號後面加上換行
        formattedText = formattedText.replace(/。/g, '。<br>');
        td.innerHTML = formattedText;
        row.appendChild(td);
      });
      table.appendChild(row);
    });
  } catch (error) {
    console.error('發生錯誤:', error);
  }
})();
