import React from "react";

const ScoreView = (obj) => {
  return (
    <div className="row">
      <div className="stroke">
        <div className="row">
          <h4>x</h4>
        </div>
        <div className="row">
          <h4>FRA</h4>
        </div>
        <div className="row">
          <h4>LAX</h4>
        </div>
        <div className="row">
          <h4>LON</h4>
        </div>
        <div className="row">
          <h4>MDW</h4>
        </div>
        <div className="row">
          <h4>NYC</h4>
        </div>
        <div className="row">
          <h4>PRG</h4>
        </div>
        <div className="row">
          <h4>SIN</h4>
        </div>
      </div>
      <div className="stroke">
        <div className="row">
          <h4>Success</h4>
        </div>
        <div className="row">
          {(obj.score["FRA"].success_rate * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["LAX"].success_rate * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["LON"].success_rate * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["MDW"].success_rate * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["NYC"].success_rate * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["PRG"].success_rate * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["SIN"].success_rate * 10).toFixed(1)}
        </div>
      </div>
      <div className="stroke">
        <div className="row">
          <h4>Speed</h4>
        </div>
        <div className="row">
          {(obj.score["FRA"].round_trip_score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["LAX"].round_trip_score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["LON"].round_trip_score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["MDW"].round_trip_score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["NYC"].round_trip_score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["PRG"].round_trip_score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["SIN"].round_trip_score * 10).toFixed(1)}
        </div>
      </div>
      <div className="stroke">
        <div className="row">
          <h4>Score</h4>
        </div>
        <div className="row">
          {(obj.score["FRA"].score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["LAX"].score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["LON"].score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["MDW"].score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["NYC"].score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["PRG"].score * 10).toFixed(1)}
        </div>
        <div className="row">
          {(obj.score["SIN"].score * 10).toFixed(1)}
        </div>
      </div>
    </div>
  )
}

export default ScoreView;