import React, { useState } from 'react';
import MonthlyFactoids from '../components/MonthlyFactoids';
import MonthlyGraphs from '../components/MonthlyGraphs';
import MonthlyOrchestrators from '../components/MonthlyOrchestrators';
import { RadioGroup, Radio } from "@mantine/core";

const MonthlyStats = (obj) => {
  const [activePage, setPage] = useState(0);

  let thisColour;
  if (activePage == 1) {
    thisColour = "teal";
  } else if (activePage == 2) {
    thisColour = "indigo";
  } else if (activePage == 3) {
    thisColour = "red";
  }

  return (
    <div className="stroke" key={obj.seed + "menu"}>
      <div className="verticalDivider" />
      <div className="row" style={{ marginTop: '0.3em', marginBottom: '0.3em' }}>
        <RadioGroup
          value={activePage}
          onChange={setPage}
          spacing="lg"
          size="lg"
          color={thisColour}
          required
        >
          <Radio value="1" label="Summary" />
          <Radio value="2" label="Graphs" />
          <Radio value="3" label="Orchestrators" />
        </RadioGroup>
      </div>
      <div className="verticalDivider" />
      <div className="row">
        {
          activePage == 1 ? <h4>Summary</h4> : null
        }
        {
          activePage == 2 ? <h4>Graphs</h4> : null
        }
        {
          activePage == 3 ? <h3>orchestrators</h3> : null
        }
      </div>
      <div className="verticalDivider" />
      {
        activePage == 1 ? <MonthlyFactoids
          data={obj.data}
          seed={"factoids" + obj.data.year + "-" + obj.data.month + "-" + obj.data.total}
        /> : null
      }
      {
        activePage == 2 ? <MonthlyGraphs
          data={obj.data}
          seed={"graphs" + obj.data.year + "-" + obj.data.month + "-" + obj.data.total}
        /> : null
      }
      {
        activePage == 3 ? <MonthlyOrchestrators
          data={obj.data}
          seed={"orchestrators" + obj.data.year + "-" + obj.data.month + "-" + obj.data.total}
        /> : null
      }
      <div className="verticalDivider" />
    </div>
  )
}

export default MonthlyStats;