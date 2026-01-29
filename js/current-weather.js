const apiKey = CONFIG.CWB_API_KEY;
const currentWeatherModel = {
  async fetchWeatherInfo(URL) {
    try {
      const res = await fetch(URL, {
        method: 'GET',
      });
      const result = await res.json();
      console.log(result);
      return result;
    } catch (error) {
      console.log('fetch weather data error:', error);
    }
  },
  compileNationWeatherData(data) {
    
  },
};
currentWeatherModel.fetchWeatherInfo();
const currentWeatherView = {};
const currentWeatherController = {
  async nationalWeatherInfo() {
    const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${apiKey}`;
    const wholeWheatherInfo = currentWeatherModel.fetchWeatherInfo(URL);
  },
};
