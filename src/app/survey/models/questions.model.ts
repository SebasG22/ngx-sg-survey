export interface SurveyQuestion {
  id: string;
  title: string;
  type: 'checkbox' | 'radio';
  options: QuestionOptions[];
  graph: string;
}

export interface QuestionOptions {
  id: string;
  title: string;
  value: string;
}

export interface SurveyAnswers {
  id: string;
  answers: any
}
