// const apiKey = CWB_API_KEY; TODO:設定成全域api key

const currentWeatherModel = {
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
    const minute = now.getMinutes();
    const ampm = hour >= 12 ? '下午' : '上午';
    const twelveHourClock = hour >= 12 ? hour - 12 : hour;
    const timeString = `最後更新 ${ampm} ${twelveHourClock}：${minute}`;

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

    console.log();

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
  async WeatherInfo() {
    // 取得氣象資料
    const URL =
      'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-CDCFFC63-52A1-44F8-AB6B-73AE3E2CD128';
    const wholeWeatherInfo = await currentWeatherModel.fetchWeatherInfo(URL);

    // 取得單一城市氣象資料
    const currentCity = '臺北市';
    const thisCityData = currentWeatherModel.chooseOneCityWeatherData(
      wholeWeatherInfo,
      currentCity
    );
    console.log(thisCityData);
    // 取得要帶傘嗎訊息
    const umbrellaMsg = currentWeatherModel.umbrellaMsg(thisCityData.pop);

    // 整理要帶傘嗎所需資料
    const weatherData = currentWeatherModel.compileWeatherData(
      thisCityData,
      umbrellaMsg
    );
    console.log(weatherData);

    // 渲染畫面
    currentWeatherView.renderHeader(weatherData);
  },
  currentTime() {
    const now = currentWeatherModel.compileTime();
    const date = now.date;
    const time = now.time;
    currentWeatherView.renderTime(date, time);
  },
};

// currentWeatherController.WeatherInfo();
currentWeatherController.currentTime();
