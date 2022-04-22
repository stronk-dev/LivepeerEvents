import React, { useState, useEffect } from 'react';
import ScrollContainer from "react-indiana-drag-scroll";
import Address from "./OrchAddressViewer";
import { Pagination } from "@mantine/core";

const itemsPerPage = 10;

const Paginator = (obj) => {
  const [activePage, setPage] = useState(1);
  let renderData = obj.data;
  if (renderData && renderData.length) {

    const totalPages = (renderData.length + (itemsPerPage - (renderData.length % itemsPerPage))) / itemsPerPage;

    return (
      <div className="row">
        <div className="strokeSmollLeft fullMargin" style={{ paddingBottom: 0, marginBottom: 0 }}>
          <div className="row">
            <h3>{obj.title}</h3>
          </div>
          <div className="content-wrapper">
            <ScrollContainer className="overflow-container" hideScrollbars={false} style={{}}>
              <div className="overflow-content" style={{ cursor: 'grab', maxHeight: '300px' }}>
                {
                  renderData.map((delObj, idx) => {
                    const tmp = idx - ((activePage - 1) * itemsPerPage);
                    if (tmp >= 0 && tmp < itemsPerPage) {
                      return (
                        <div className="flexContainer forceWrap" key={"delegator" + idx}>
                          <div className="rowAlignLeft">
                            <div className="strokeSmollLeft" style={{ marginLeft: '0.2em', whiteSpace: 'nowrap' }} >
                              <h3>{idx}</h3>
                            </div>
                            <div className="rowAlignLeft">
                              {delObj}
                            </div>
                          </div>

                        </div>
                      )
                    }
                    return null;
                  })
                }
              </div>
            </ScrollContainer>
          </div>
          <div className="row" style={{ marginTop: '1em', marginBottom: '1em' }}>
            {totalPages > 1 ?
              <Pagination page={activePage} onChange={setPage} total={totalPages} siblings={1} initialPage={1} />
              : null}
          </div>
        </div>
      </div>
    )
  }
}

export default Paginator;