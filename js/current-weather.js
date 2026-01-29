const currentWeatherModel = {
  async fetchWeatherInfo() {
    const CWB_API_KEY = 'CWA-CDCFFC63-52A1-44F8-AB6B-73AE3E2CD128';
    const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_API_KEY}`;
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
};
currentWeatherModel.fetchWeatherInfo();
