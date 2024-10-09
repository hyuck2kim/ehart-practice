document.addEventListener("DOMContentLoaded", async () => {
  console.log("Page loaded, fetching data groups..."); // 페이지 로드 및 데이터 그룹 요청 로그

  const content = document.getElementById("content");

  // 제목 추가
  const title = document.createElement("h1");
  title.innerText = "Select Data Group";
  content.appendChild(title);

  // 데이터 그룹 목록을 API에서 가져오기
  const response = await fetch("/api/groups");
  const groups = await response.json();
  console.log(`Received data groups: ${groups}`); // 데이터 그룹 목록 로그

  // 셀렉트 박스 동적 생성
  const select = document.createElement("select");
  select.id = "groupSelect";

  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.innerText = group;
    select.appendChild(option);
  });
  content.appendChild(select);

  // 버튼 생성
  const button = document.createElement("button");
  button.innerText = "Show Chart";
  button.onclick = loadChart;
  content.appendChild(button);

  // 차트를 표시할 div 생성
  const chartDiv = document.createElement("div");
  chartDiv.id = "chart";
  chartDiv.style.width = "600px";
  chartDiv.style.height = "400px";
  content.appendChild(chartDiv);
});

async function loadChart() {
  const group = document.getElementById("groupSelect").value;
  console.log(`Requesting data for group: ${group}`); // 사용자 선택 로그

  // 서버에서 데이터 가져오기
  const response = await fetch("/api/timeseries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group }),
  });
  const data = await response.json();
  console.log(`Received data for group ${group}:`, data); // 받아온 데이터 로그

  // 차트에 사용할 데이터 준비
  const series = [];
  const legendData = []; // 범례에 표시할 데이터 타입 목록

  Object.keys(data).forEach((type) => {
    const timestamps = data[type].map((item) => item.timestamp);
    const values = data[type].map((item) => item.value);

    series.push({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type: "line",
      data: values,
    });

    // 범례에 표시할 이름 추가
    legendData.push(type.charAt(0).toUpperCase() + type.slice(1));
  });

  // ECharts 차트 생성 (브라우저 전역에서 'echarts' 사용)
  const chart = echarts.init(document.getElementById("chart"));
  const option = {
    title: { text: `${group} Group Data Over Time` },
    tooltip: { trigger: "axis" }, // 마우스 오버 시 축에 따라 데이터 표시
    legend: {
      // 범례 추가
      data: legendData,
      orient: "vertical",
      right: "0", // 차트의 오른쪽에 배치
      top: "middle",
    },
    xAxis: {
      type: "category",
      data: data[Object.keys(data)[0]].map((item) => item.timestamp),
    },
    yAxis: { type: "value" },
    series,
  };
  chart.setOption(option);
  console.log("Chart rendered"); // 차트 렌더링 완료 로그
}
