import React from "react";
import "./index.scss";
import { useSelector } from "react-redux";
import { selectConfig, selectErrorMsg } from "../../Store/quizSlice";
import StartButton from "../../Components/StartButton/index";
import QuizHeader from "../../Components/QuizHeader";
import TestSheet from "../../Components/TestSheet";
import ControlPanel from "../../Components/ControlPanel";
import Holiday from "../../Components/Holiday";
import { RootState } from "../../Store/store";

export default function HomeV2() {
  // const dispatch = useDispatch();
  const config = useSelector((state: RootState) => selectConfig(state));
  // const loading = useSelector((state) => selectLoading(state));
  const error = useSelector((state: RootState) => selectErrorMsg(state));

  if (error !== null) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
      </div>
    );
  } else if (config === null) {
    return <StartButton />;
  } else if (config.isHoliday) {
    return <Holiday />;
  } else {
    return (
      <div className="quiz-container">
        <QuizHeader />
        <div className="quiz-content-container">
          <TestSheet />
          <ControlPanel />
        </div>
      </div>
    );
  }
}
