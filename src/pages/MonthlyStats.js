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
    <div className="stroke" key={obj.seed + "menu"} style={{ marginTop: '0', paddingTop: '0' }}>
      <div className="row" style={{ margin: '0' }}>
        <SegmentedControl
          styles={{
            root: { backgroundColor: 'rgba(103, 103, 103, 0.6)', border: 'none', borderColor: 'transparent' },
            label: {
              color: 'black',
              border: 'none',
              '&:hover': {
                color: 'black',
                border: 'none'
              },
              '&': {
                color: 'black',
                border: 'none'
              }
            },
            labelActive: {
              color: 'black',
              border: 'none',
              '&:hover': {
                color: 'black',
                border: 'none'
              },
              '&': {
                color: 'black',
                border: 'none'
              }
            },
            input: {

            },
            control: {
              color: 'black',
              border: 'none',
              '&:hover': {
                color: 'black',
                border: 'none'
              },
              '&': {
                color: 'black',
                border: 'none'
              },
              '&:not(:first-of-type)': {
                color: 'black',
                border: 'none'
              }

            },
            controlActive: {
              color: 'black',
              border: 'none',
              '&:hover': {
                color: 'black',
                border: 'none'
              },
              '&': {
                color: 'black',
                border: 'none'
              }
            },
            active: {

            },
            disabled: {

            },
          }}
          value={activePage}
          onChange={setPage}
          spacing="lg"
          size="lg"
          radius={0}
          transitionDuration={200}
          transitionTimingFunction="linear"
          color={thisColour}
          data={[
            { label: 'Info', value: '1' },
            { label: 'Graph', value: '2' },
            { label: 'Score', value: '3' }
          ]}
        />
      </div>
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