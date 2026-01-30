const currentWeatherModel = {
  // 取得GPS定位
  async getLocalion() {
    if (!navigator.geolocation) {
      console.log(
        'Browser does not support location services; Uses IP address instead.'
      );
      return { GPS: null };
    }
    try {
      // 獲取經緯度
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: true,
          maximumAge: 0,
        });
      });
      // console.log(position);
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      return { GPS: { latitude: latitude, longitude: longitude } };
    } catch (error) {
      console.log('Unable to get location data', error);
      return { GPS: null };
    }
  },
  // 取得所在城市資料
  async getCityName(lat, lon) {
    // 如果有經緯度就帶入
    let url = `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh`;

    if (lat && lon) {
      url += `&latitude=${lat}&longitude=${lon}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Unable to get location city data');

      const data = await response.json();

      // 優先順序：城市名 > 行政區名 > 預設城市
      const cityName = data.city || data.principalSubdivision || '臺北市';

      console.log(
        `定位來源: ${data.lookupSource === 'coordinates' ? 'GPS' : 'IP 地址'}`
      );
      console.log('偵測到的城市：', cityName);

      return cityName;
    } catch (error) {
      console.error('定位轉換失敗，回傳預設城市:', error);
      return '臺北市';
    }
  },
  // 將城市名稱轉為氣象資料名稱
  formatTaiwanCity(name) {
    if (!name || typeof name !== 'string') return '臺北市';

    // 城市對照表
    const cityMap = {
      臺北: '臺北市',
      台北: '臺北市',
      Taipei: '臺北市',
      新北: '新北市',
      'New Taipei': '新北市',
      桃園: '桃園市',
      Taoyuan: '桃園市',
      臺中: '臺中市',
      台中: '臺中市',
      Taichung: '臺中市',
      臺南: '臺南市',
      台南: '臺南市',
      Tainan: '臺南市',
      高雄: '高雄市',
      Kaohsiung: '高雄市',
      基隆: '基隆市',
      Keelung: '基隆市',
      新竹市: '新竹市',
      'Hsinchu City': '新竹市',
      新竹縣: '新竹縣',
      'Hsinchu County': '新竹縣',
      苗栗: '苗栗縣',
      Miaoli: '苗栗縣',
      彰化: '彰化縣',
      Changhua: '彰化縣',
      南投: '南投縣',
      Nantou: '南投縣',
      雲林: '雲林縣',
      Yunlin: '雲林縣',
      嘉義市: '嘉義市',
      'Chiayi City': '嘉義市',
      嘉義縣: '嘉義縣',
      'Chiayi County': '嘉義縣',
      屏東: '屏東縣',
      Pingtung: '屏東縣',
      宜蘭: '宜蘭縣',
      Yilan: '宜蘭縣',
      花蓮: '花蓮縣',
      Hualien: '花蓮縣',
      臺東: '臺東縣',
      台東: '臺東縣',
      Taitung: '臺東縣',
      澎湖: '澎湖縣',
      Penghu: '澎湖縣',
      金門: '金門縣',
      Kinmen: '金門縣',
      連江: '連江縣',
      馬祖: '連江縣',
      Lienchiang: '連江縣',
    };

    const foundKey = Object.keys(cityMap).find((key) => name.includes(key));

    return foundKey ? cityMap[foundKey] : '臺北市';
  },
  // 抓氣象資料
  async fetchWeatherInfo(URL) {
    try {
      const res = await fetch(URL);
      return await res.json();
    } catch (error) {
      console.error('fetch weather data error:', error);
    }
  },
  // 取得單一城市即時氣象資料
  chooseOneCityWeatherData(wholeCitydata, cityName) {
    if (!wholeCitydata.success) {
      return { error: true, msg: 'Cannot fetch weather data' };
    }
    try {
      const cityData = wholeCitydata.records.location.find(
        (city) => city.locationName === cityName
      );

      const wx = cityData.weatherElement.find((el) => el.elementName === 'Wx');
      const pop = cityData.weatherElement.find(
        (el) => el.elementName === 'PoP'
      );
      const ci = cityData.weatherElement.find((el) => el.elementName === 'CI');
      const minT = cityData.weatherElement.find(
        (el) => el.elementName === 'MinT'
      );
      const maxT = cityData.weatherElement.find(
        (el) => el.elementName === 'MaxT'
      );

      return {
        cityName: cityData.locationName,
        wx: wx?.time[0]?.parameter.parameterName,
        pop: parseInt(pop?.time[0]?.parameter.parameterName),
        ci: ci?.time[0]?.parameter.parameterName,
        minTemp: parseInt(minT?.time[0]?.parameter.parameterName),
        maxTemp: parseInt(maxT?.time[0]?.parameter.parameterName),
      };
    } catch (error) {
      return { error: true, msg: 'Cannot find this city wheather info' };
    }
  },
  // 要帶傘嗎小訊息
  umbrellaMsg(pop) {
    if (pop >= 70) {
      msg = '高機率降雨，建議帶傘出門。';
    } else if (pop >= 30) {
      msg = '天氣不穩定，帶把傘備用吧。';
    } else {
      msg = '天氣晴朗，是出門的好日子。';
    }
    return msg;
  },
  // 整理要帶傘嗎所需資料
  compileWeatherData(cityData, umbrellaMsg) {
    const ave = (cityData.minTemp + cityData.maxTemp) / 2;

    return {
      cityNameValue: cityData.cityName,
      popValue: cityData.pop,
      wxValue: cityData.wx,
      msgValue: umbrellaMsg,
      aveValue: ave,
      maxTValue: cityData.maxTemp,
      minTValue: cityData.minTemp,
      ciValue: cityData.ci,
    };
  },
  // 整理時間
  compileTime() {
    const now = new Date();

    // 日期
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    const weekArray = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ];
    const day = weekArray[now.getDay()];

    const dateString = `${year} 年 ${month} 月 ${date} 日 ${day}`;

    // 時間
    const hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? '下午' : '上午';
    const twelveHourClock = hour >= 13 ? hour - 12 : hour;
    const twoDigitHour = twelveHourClock.toString().padStart(2, '0')
    const timeString = `最後更新 ${ampm} ${twoDigitHour}：${minute}`;

    return {
      date: dateString,
      time: timeString,
    };
  },
};

const currentWeatherView = {
  // 渲染首頁
  renderHeader(weatherData) {
    // 選擇要渲染的區塊
    const city = document.querySelector(
      '.current-weather_local_container_text_location_text'
    );
    const pop = document.querySelector(
      '.current-weather_local_container_text_pop_current_value'
    );
    const wx = document.querySelector(
      '.current-weather_local_container_text_pop_weather'
    );
    const msg = document.querySelector(
      '.current-weather_local_container_text_messenge'
    );
    const ave = document.querySelector(
      '.current-weather_info_container_ave_text_value'
    );
    const maxT = document.querySelector(
      '.current-weather_info_container_max_text_value'
    );
    const minT = document.querySelector(
      '.current-weather_info_container_min_text_value'
    );
    const ci = document.querySelector(
      '.current-weather_info_container_ci_text_value'
    );

    // 注入資料
    city.textContent = weatherData.cityNameValue;
    pop.textContent = weatherData.popValue;
    wx.textContent = weatherData.wxValue;
    msg.textContent = weatherData.msgValue;
    ave.textContent = `${weatherData.aveValue}°C`;
    maxT.textContent = `${weatherData.maxTValue}°C`;
    minT.textContent = `${weatherData.minTValue}°C`;
    ci.textContent = weatherData.ciValue;
  },
  // 渲染時間
  renderTime(date, time) {
    const dateElement = document.querySelector('.header_info_time_date');
    const updateElement = document.querySelector(
      '.header_info_time_update_time'
    );
    dateElement.textContent = date;
    updateElement.textContent = time;
  },
};

const currentWeatherController = {
  init() {
    currentWeatherController.WeatherInfo();
    currentWeatherController.currentTime();
  },
  async WeatherInfo() {
    // 取得氣象資料
    const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_API_KEY}`;
    const wholeWeatherInfo = await currentWeatherModel.fetchWeatherInfo(URL);

    // 取得所在城市
    city = await currentWeatherController.currentLocation();

    // 取得單一城市氣象資料
    const currentCity = city ? city : '臺北市';
    const thisCityData = currentWeatherModel.chooseOneCityWeatherData(
      wholeWeatherInfo,
      currentCity
    );
    // console.log(thisCityData);
    // 取得要帶傘嗎訊息
    const umbrellaMsg = currentWeatherModel.umbrellaMsg(thisCityData.pop);

    // 整理要帶傘嗎所需資料
    const weatherData = currentWeatherModel.compileWeatherData(
      thisCityData,
      umbrellaMsg
    );
    // console.log(weatherData);

    // 渲染畫面
    currentWeatherView.renderHeader(weatherData);
  },
  currentTime() {
    const now = currentWeatherModel.compileTime();
    const date = now.date;
    const time = now.time;
    currentWeatherView.renderTime(date, time);
  },
  async currentLocation() {
    // 先看能否取得gps取得定位
    const location = await currentWeatherModel.getLocalion();
    const lat = location.GPS?.latitude;
    const lon = location.GPS?.longitude;

    // 取得所在城市
    if (lat && lon) {
      const cityName = await currentWeatherModel.getCityName(lat, lon);
      return currentWeatherModel.formatTaiwanCity(cityName);
    } else {
      const cityName = await currentWeatherModel.getCityName(null, null);
      return currentWeatherModel.formatTaiwanCity(cityName);
    }
  },
};

currentWeatherController.init();