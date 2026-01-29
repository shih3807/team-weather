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
  chooseOneCityWeatherData(data, cityName) {
    if (!data.success) {
      return { error: true, msg: 'Cannot fetch weather data' };
    }
    try {
      const cityData = data.records.location.find(
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
  compileWeatherData(data) {
    const ave = (data.minTemp + data.maxTemp) / 2;
    if (data.pop >= 70) {
      msg = '高機率降雨，建議帶傘出門。';
    } else if (data.pop >= 30) {
      msg = '天氣不穩定，帶把傘備用吧。';
    } else {
      msg = '天氣晴朗，是出門的好日子。';
    }

    return {
      降雨機率: data.pop,
      天氣狀態: data.wx,
      要帶傘嗎: msg,
      城市平均溫度: ave,
      城市最高溫: data.maxTemp,
      城市最低溫: data.minTemp,
      目前舒適度: data.ci,
    };
  },
};

const currentWeatherView = {};

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
    const resultData = currentWeatherModel.compileWeatherData(thisCityData);
    console.log(resultData);
  },
};

currentWeatherController.WeatherInfo();
