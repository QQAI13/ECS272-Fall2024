import React, { useState } from "react";
import { Box, Grid } from "@mui/material";

import SunburstChart from "./components/SunburstChart";
import DepressionBarChart from "./components/BarChart";
import SankeyDiagram from "./components/Sankey";

import sunburst_data from "../data/data.json";
import bar_data from "../data/bar_data.json";
import sankey_data from "../data/sankey_data.json";

const App = () => {
  // Set "depression" as the default metric for initial rendering
  const [selectedMetric, setSelectedMetric] = useState("depression");

  // Utility function to sanitize and correct metric name
  const sanitizeMetric = (metric) => {
    // Remove any question marks, colons, spaces, and transform to lowercase, with multi-word support
    const coreMetric = metric.replace(/[\?:]/g, '').trim().toLowerCase();
    
    // Handle specific cases for multi-word metrics
    if (coreMetric.startsWith("panic")) {
      return "panic_attack";
    }
    
    return coreMetric;
  };

  // Handle the metric change based on Sankey node clicks
  const handleSankeyNodeClick = (metric) => {
    const cleanedMetric = sanitizeMetric(metric.split(' ')[0]); // Keep only 'depression', 'anxiety', etc.
    setSelectedMetric(cleanedMetric);
    console.log("Now metric is " + cleanedMetric);
  };



  return (
    <div className="App">
      <Box sx={{ flexGrow: 1, paddingTop: { md: 10 }, paddingLeft: { md: 25 }, paddingRight: { md: 5 } }}>
        <Grid container spacing={6} justifyContent={"center"} alignContent={"center"}>
          <Grid item xs={12} md={4}>
            <SunburstChart data={sunburst_data} />
          </Grid>
          <Grid item xs={12} md={8} container direction="column" spacing={2}>
            <Grid item>
              <DepressionBarChart data={bar_data} selectedMetric={selectedMetric} />
            </Grid>
            <Grid item>
              <SankeyDiagram data={sankey_data} onNodeClick={handleSankeyNodeClick} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default App;
