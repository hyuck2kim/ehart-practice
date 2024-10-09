import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// JSON 파일에서 데이터 읽기
async function getTimeSeriesData() {
  try {
    const data = await fs.readFile(path.join(__dirname, "data.json"), "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return {};
  }
}

// API 엔드포인트: 그룹에 해당하는 시계열 데이터 제공
app.post("/api/timeseries", async (req, res) => {
  const { group } = req.body;
  const timeSeriesData = await getTimeSeriesData();
  console.log(`Received request for group: ${group}`);

  if (timeSeriesData[group]) {
    console.log(`Sending data for group: ${group}`);
    res.json(timeSeriesData[group]);
  } else {
    console.log("Error: Group not found");
    res.status(404).json({ error: "Group not found" });
  }
});

// API 엔드포인트: 데이터 그룹 목록 제공
app.get("/api/groups", async (req, res) => {
  const timeSeriesData = await getTimeSeriesData();
  console.log("Request received for data groups");
  const groups = Object.keys(timeSeriesData);
  console.log(`Available groups: ${groups}`);
  res.json(groups);
});

// 정적 파일 서빙: HTML, JS 파일 등
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
