async function fetchrainstation() {
  const CWB_API_KEY = "CWA-CDCFFC63-52A1-44F8-AB6B-73AE3E2CD128";
  const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization=${CWB_API_KEY}`;

  const res = await fetch (URL);
  const result = await res.json();
  console.log(result);


  // 依縣市整理雨量
  const countyMap = {};

  const stations = result.records.Station;

  stations.forEach(station => {
    const county = station.GeoInfo.CountyName
    const raw = station.RainfallElement?.Past24hr?.Precipitation;
    const rain = Number(raw);

    if (isNaN(rain) || rain < 0) return;

    if(!countyMap[county]) {
      countyMap[county] = [];
    }
    countyMap[county].push(rain);
  });

  // 計算平均/最大/最小
  const countyStats = Object.entries(countyMap).map(
    ([county, rains]) => {
      const sum = rains.reduce((a, b) => a+b, 0);
      return {
        county,
        avg: sum / rains.length,
        max: Math.max(...rains),
        min: Math.min(...rains)
      };
  });

  // 取雨量最多前8
  const top8 = [...countyStats]
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);


  const barcolors = top8.map(d => {
    if (d.avg < 20 ) return '#a7c7e7';
    if (d.avg > 40 ) return '#0b5394';
    return '#6fa8dc'
  });

  // 長條圖
  const ctx = document.getElementById('rainBarchart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top8.map(d => d.county),
      datasets: [{
        label: '平均雨量 (mm)',
        data: top8.map(d => d.avg),
        backgroundColor: barcolors,
        // borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value + ' mm'
          }
        }
      }
    }
  });

  // 表格分頁設定
  const rowsperpage = 8;
  let currentpage = 1;

  const tableData = [...countyStats]
    .sort((a, b) => b.avg - a.avg);

  const totalpages = Math.ceil(tableData.length / rowsperpage);

  const tablebody = document.getElementById('raintablebody');
  const pageinfo = document.getElementById('pageinfo');
  const prevBtn = document.getElementById('prevpage');
  const nextBtn = document.getElementById('nextpage');

  function rendertable() {
    tablebody.innerHTML = '';

    const start = ( currentpage - 1 ) * rowsperpage;
    const end = start + rowsperpage;
    const pagedata = tableData.slice(start, end);

    pagedata.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.county}</td>
        <td>${item.max.toFixed(1)}</td>
        <td>${item.min.toFixed(1)}</td>
      `;
      tablebody.appendChild(tr);
    });
    pageinfo.textContent = `${currentpage} / ${totalpages}`;

    // 按鈕狀態設定
    prevBtn.disabled = currentpage === 1;
    nextBtn.disabled = currentpage === totalpages;
  }

  // prevBtn.addEventListener('click', () => {
  //   if ( currentpage > 1 ) {
  //     currentpage--;
  //     rendertable();
  //   }
  // });

  // nextBtn.addEventListener('click', () => {
  //   if ( currentpage < totalpages) {
  //     currentpage++;
  //     rendertable();
  //   }
  // });

  prevBtn.onclick =  () => {
    if ( currentpage > 1 ) {
      currentpage--;
      rendertable();
    }
  };

  nextBtn.onclick = () => {
    if ( currentpage < totalpages) {
      currentpage++;
      rendertable();
    }
  };

  // 初始化
  rendertable();


}

fetchrainstation();













// const labels = ['台北', '新北', '桃園','台中', '台南','高雄', '花蓮','澎湖'];
//   const data = [18, 25, 12, 30, 22, 28, 52, 3];

//   const rainfallData = [
//     { city: '宜蘭', max: 35, min: 12},
//     { city: '花蓮', max: 35, min: 12},
//     { city: '台東', max: 35, min: 12},
//     { city: '澎湖', max: 35, min: 12},
//     { city: '金門', max: 35, min: 12},
//     { city: '連江', max: 35, min: 12},
//     { city: '台北', max: 35, min: 12},
//     { city: '新北', max: 35, min: 12},
//     { city: '桃園', max: 35, min: 12},
//     { city: '台中', max: 35, min: 12},
//     { city: '台南', max: 35, min: 12},
//     { city: '高雄', max: 35, min: 12},
//     { city: '基隆', max: 35, min: 12},
//     { city: '新竹縣', max: 35, min: 12},
//     { city: '新竹市', max: 35, min: 12},
//     { city: '苗栗', max: 35, min: 12},
//     { city: '彰化', max: 35, min: 12},
//     { city: '南投', max: 35, min: 12},
//     { city: '嘉義縣', max: 35, min: 12},
//     { city: '嘉義市', max: 35, min: 12},
//     { city: '屏東', max: 35, min: 12},
//     { city: '雲林', max: 35, min: 12},
//   ]






// let records=null;
// fetch("https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization="+CWB_API_KEY).then((response)=>{
// 	return response.json();
// }).then((data)=>{
// 	records=data.records;
// 	renderRaining(0);
// });
// function renderRaining(page){
// 	let startIndex=page*10;
// 	let endIndex=(page+1)*10;
// 	const container=document.querySelector("#raining");
// 	for(let i=startIndex;i<endIndex;i++){
// 		const station=records.Station[i];
// 		const item=document.createElement("div");
// 		item.className="station";
// 		const name=document.createElement("div");
// 		name.className="name";
// 		name.textContent=station.StationName+"、"+station.GeoInfo.TownName+"、"+station.GeoInfo.CountyName;
// 		const amount=document.createElement("amount");
// 		amount.className="amount";
// 		amount.textContent=station.RainfallElement.Now.Precipitation+" mm";
// 		item.appendChild(name);
// 		item.appendChild(amount);
// 		container.appendChild(item);
// 	}
// }
