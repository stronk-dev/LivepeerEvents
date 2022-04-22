import React, { useState } from 'react';
import MonthlyFactoids from '../components/MonthlyFactoids';
import MonthlyGraphs from '../components/MonthlyGraphs';
import MonthlyOrchestrators from '../components/MonthlyOrchestrators';
import { SegmentedControl } from "@mantine/core";

const MonthlyStats = (obj) => {
  const [activePage, setPage] = useState(1);

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
      <div className="row" style={{ margin: '0' }}>
        <SegmentedControl
          styles={{
            root: { backgroundColor: 'rgba(103, 103, 103, 0.6)' },
            label: { color: 'black' },
            labelActive: { color: 'black' },
            input: { color: 'black' },
            control: { color: 'black' },
            controlActive: {},
            active: { color: 'black' },
            disabled: {},
          }}
          value={activePage}
          onChange={setPage}
          radius="md"
          spacing="lg"
          size="lg"
          transitionDuration={200}
          transitionTimingFunction="linear"
          color={thisColour}
          data={[
            { label: 'Summary', value: '1' },
            { label: 'Graphs', value: '2' },
            { label: 'Orchestrators', value: '3' }
          ]}
        />
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
          activePage == 3 ? <h4>Orchestrators</h4> : null
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