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
  // 整理要帶傘嗎所需資料
  compileWeatherData(cityData) {
    const ave = (cityData.minTemp + cityData.maxTemp) / 2;
    if (cityData.pop >= 70) {
      msg = '高機率降雨，建議帶傘出門。';
    } else if (cityData.pop >= 30) {
      msg = '天氣不穩定，帶把傘備用吧。';
    } else {
      msg = '天氣晴朗，是出門的好日子。';
    }

    return {
      cityNameValue: cityData.cityName,
      popValue: cityData.pop,
      wxValue: cityData.wx,
      msgValue: msg,
      aveValue: ave,
      maxTValue: cityData.maxTemp,
      minTValue: cityData.minTemp,
      ciValue: cityData.ci,
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

    // 整理要帶傘嗎所需資料
    const weatherData = currentWeatherModel.compileWeatherData(thisCityData);
    console.log(weatherData);

    // 渲染畫面
    currentWeatherView.renderHeader(weatherData);
  },
};

currentWeatherController.WeatherInfo();
