import { Config, Question } from "../Store/quizSlice";
import numeral from "numeral";
import _ from "lodash";
import { Constant } from "./Constant";

export const configExtractor = (data: any): Config => {
  return {
    quizAmount: data.quiz_amount?.N ? numeral(data.quiz_amount.N).value() : 30,
    isHoliday: data.holiday?.BOOL ? data.holiday.BOOL : false,
    holidayInfo: data.holiday_info?.S
      ? data.holiday_info.S
      : "Enjoy your holiday",
    scoreToPass: data.score_to_pass?.N
      ? numeral(data.score_to_pass.N).value()
      : 90,
    operators: data.operators?.S ? data.operators.S.split(",") : ["+", "-"],
    limitedSeconds: data.seconds_limited?.N
      ? numeral(data.seconds_limited.N).value()
      : 600,
    addSubRange: data.add_sub_range?.N
      ? numeral(data.add_sub_range.N).value()
      : 30,
    mulDivRange: data.mul_div_range?.N
      ? numeral(data.mul_div_range.N).value()
      : 10,
  };
};

export const generateQuestions = (config: Config): Question[] => {
  let questions: Question[] = [];
  for (let i = 0; i < config.quizAmount; i++) {
    const operator = config.operators[_.random(0, config.operators.length - 1)];
    switch (operator) {
      case "+":
        questions.push(generateAddition(config.addSubRange));
        break;
      case "-":
        questions.push(generateSubtraction(config.addSubRange));
        break;
      case "*":
        questions.push(generateMultiplication(config.mulDivRange));
        break;
      case "/":
        questions.push(generateDivision(config.mulDivRange));
        break;
      default:
        throw new Error(`${Constant.ERROR_PREFIX} unknown operator`);
    }
  }
  if (questions.length > 0) {
    questions[0].isActive = true;
  }
  return questions;
};

const generateAddition = (range: number): Question => {
  const left = _.random(0, range);
  const right = _.random(0, range);
  return {
    left: left,
    right: right,
    operator: "+",
    answer: null,
    isActive: false,
    isCorrect: null,
  };
};

const generateSubtraction = (range: number): Question => {
  const left = _.random(0, range);
  const right = _.random(0, left);
  return {
    left: left,
    right: right,
    operator: "-",
    answer: null,
    isActive: false,
    isCorrect: null,
  };
};

const generateMultiplication = (range: number): Question => {
  const left = _.random(0, range);
  const right = _.random(0, range);
  return {
    left: left,
    right: right,
    operator: "*",
    answer: null,
    isActive: false,
    isCorrect: null,
  };
};

const generateDivision = (range: number): Question => {
  const randomMultifier = _.random(0, range);
  const right = _.random(1, range);
  const left = right * randomMultifier;
  return {
    left: left,
    right: right,
    operator: "/",
    answer: null,
    isActive: false,
    isCorrect: null,
  };
};

export const getCurrentQuestion = (questions: Question[]) => {
  return questions.find((question) => question.isActive === true);
};

export const questionsAreMarked = (questions: Question[]): Boolean => {
  return questions.findIndex((question) => question.isCorrect !== null) !== -1;
};

export const markQuestions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    return markQuestion(question);
  });
};

const markQuestion = (question: Question): Question => {
  const { left, right, operator, answer } = question;
  let { isCorrect } = question;

  switch (operator) {
    case "+":
      isCorrect = left + right === answer;
      break;
    case "-":
      isCorrect = left - right === answer;
      break;
    case "*":
      isCorrect = left * right === answer;
      break;
    case "/":
      isCorrect = left / right === answer;
      break;
    default:
      throw new Error(`${Constant.ERROR_PREFIX} unknown operator`);
  }
  return {
    left,
    right,
    operator,
    answer,
    isActive: false,
    isCorrect,
  };
};

export const getGrade = (questions: Question[]): number => {
  const total = questions.length;
  const correctAmount = questions.filter(
    (question) => question.isCorrect === true
  ).length;
  return total === 0 ? 0 : _.round((correctAmount / total) * 100);
};
