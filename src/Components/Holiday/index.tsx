import React from "react";
import { useSelector } from "react-redux";
import { selectConfig } from "../../Store/quizSlice";
import "./index.scss";
import { RootState } from "../../Store/store";

export default function Holiday() {
  const config = useSelector((state: RootState) => selectConfig(state));
  const { holidayInfo } = config;

  return (
    <div className="holiday-container">
      <h2>{holidayInfo}</h2>
    </div>
  );
}
