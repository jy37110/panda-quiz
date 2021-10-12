import React from "react";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLoading,
  setError,
  setLoading,
  startQuiz,
} from "../../Store/quizSlice";
import AWS from "aws-sdk";
import { configExtractor } from "../../lib/lib";
import { Constant } from "../../lib/Constant";
import { RootState } from "../../Store/store";

const { REACT_APP_LAMBDA_KEY, REACT_APP_LAMBDA_SECRET } = process.env;

AWS.config.update({
  accessKeyId: REACT_APP_LAMBDA_KEY,
  secretAccessKey: REACT_APP_LAMBDA_SECRET,
  region: "us-west-2",
});
const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

export default function StartButton() {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => selectLoading(state));

  const handleStartBtnClick = () => {
    try {
      var params = {
        TableName: "panda-quiz-setting",
        Key: {
          id: { N: "0" },
        },
      };
      dispatch(setLoading(true));
      db.getItem(params, function (err, data) {
        if (err) {
          throw new Error(`${Constant.ERROR_PREFIX} ${JSON.stringify(err)}`);
        } else {
          const config = configExtractor(data.Item);
          dispatch(startQuiz(config));
        }
        dispatch(setLoading(false));
      });
    } catch (e) {
      dispatch(setError(e.message));
    }
  };

  return (
    <Button
      type="primary"
      ghost
      size="large"
      onClick={handleStartBtnClick}
      loading={loading}
    >
      Start Quiz
    </Button>
  );
}
