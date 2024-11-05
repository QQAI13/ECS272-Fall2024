// import "./styles.css";
import { useState, ChangeEvent } from "react";
import { Box, Grid} from "@mui/material";

import SunburstChart from "./components/SunburstChart";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

import sunburst_data from "../data/data.json";
import bar_data from "../data/bar_data.json";
import DepressionBarChart from "./components/BarChart";

const App: React.FC = () => {
  const [value, setValue] = useState<string>("sunburst_data");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>
      <Grid container direction="row" spacing={{ xs: 12, md: 12 }} columns={{ xs: 4, sm: 4, md: 4 }} paddingTop={{md: 30}} alignItems="center" justifyContent="center">
          <SunburstChart data={sunburst_data} />
          <DepressionBarChart data={bar_data} />
          <SunburstChart data={sunburst_data} />
        </Grid>
    </Box>
      {/* {console.log(value)} */}
    </div>
  );
};

export default App;
