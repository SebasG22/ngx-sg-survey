import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { SurveyQuestion, SurveyAnswers } from '../../models/questions.model';
import * as surveyActions from '../../actions/survey.actions';
import * as surveySelectors from '../../reducers/survey.reducer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { chunk, has, orderBy } from 'lodash';
import { SurveyQuestionCheckboxComponent } from '../../components/questions/checkbox/checkbox-question.component';
import { SurveyQuestionRadioComponent } from '../../components/questions/radio/radio-question.component';
import * as ons from 'onsenui';
import { Router } from '@angular/router';
import { SurveyQuestionPonderationComponent } from '../../components/questions/ponderation/ponderation-question.component';

@Component({
  selector: 'page-survey-main',
  templateUrl: 'survey-main.page.html',
  styleUrls: ['survey-main.page.scss']
})

export class SurveyMainPage implements OnInit {

  @ViewChild(SurveyQuestionCheckboxComponent) public surveyQuestionCheckboxComponent: SurveyQuestionCheckboxComponent;

  @ViewChild(SurveyQuestionRadioComponent) public surveyQuestionRadioComponent: SurveyQuestionRadioComponent;

  @ViewChild(SurveyQuestionPonderationComponent) public surveyQuestionPonderationComponent: SurveyQuestionPonderationComponent;

  @ViewChild("alertDialog") public alertDialog;

  public surveyQuestionsSubs: Subscription;

  public surveyQuestions: SurveyQuestion[];

  public surveyAnswers = {};

  public currentSurveyIndex = 0;

  constructor(
    private store: Store<{}>,
    private router: Router
  ) { }

  ngOnInit() {
    this.getQuestions();
  }

  private getQuestions() {
    this.alertDialog.nativeElement.show();

    this.store.dispatch(new surveyActions.getQuestions());
    this.surveyQuestionsSubs = this.store.select(surveySelectors.getSurveyQuestions)
      .subscribe((surveyQuestions: SurveyQuestion[]) => {
        if (surveyQuestions) {
          this.surveyQuestions = surveyQuestions;
          this.surveyQuestions = orderBy(surveyQuestions, ['order'], ['asc'])
          // this.surveyQuestions = chunk(this.surveyQuestions, 2);
          setTimeout(() => {
            this.alertDialog.nativeElement.hide();
          }, 1000)
        }
      });
  }

  private getCurrentQuestions() {
    return this.surveyQuestions[this.currentSurveyIndex];
  }

  public itsTheLastQuestion() {
    return this.surveyQuestions.length - 1 === this.currentSurveyIndex;
  }

  public next() {
    let patternQuestion = '';
    if (this.questionComponentIsShowing(this.surveyQuestionCheckboxComponent)) patternQuestion += '1'
    else patternQuestion += '0'

    if (this.questionComponentIsShowing(this.surveyQuestionRadioComponent)) patternQuestion += '1'
    else patternQuestion += '0'

    if (this.questionComponentIsShowing(this.surveyQuestionPonderationComponent)) patternQuestion += '1'
    else patternQuestion += '0'

    if (this.validateFormQuestionFormComponents(patternQuestion)) {
      if (!this.itsTheLastQuestion()) {
        this.currentSurveyIndex += 1;
      } else {
        this.saveAnswerOnDatabase();
      }

    } else {
      ons.notification.toast('Selecciona una respuesta', {
        timeout: 1000
      })
    }
  }

  public questionComponentIsShowing(componentRef: any) {
    if (has(componentRef, 'form')) {
      componentRef.onSubmittedForm(componentRef.form);
      return true;
    } else {
      return false;
    }
  }

  public validateFormQuestionFormComponents(pattern) {
    switch (pattern) {
      // case '11':
      //   if (this.surveyQuestionCheckboxComponent.form.valid && this.surveyQuestionRadioComponent.form.valid) {
      //     return true;
      //   }
      //   return false;
      case '010':
        if (this.surveyQuestionRadioComponent.form.valid) {
          return true;
        }
        return false;
      case '100':
        if (this.surveyQuestionCheckboxComponent.form.valid) {
          return true;
        }
        return false;
      case '001':
        if (this.surveyQuestionPonderationComponent.form.valid) {
          return true;
        }
        return false;
    }
  }

  public saveAnswers(event) {
    this.surveyAnswers[event.id] = event;

  }


  public saveAnswerOnDatabase() {
    this.store.dispatch(new surveyActions.saveAnswer(this.surveyAnswers))
  }
}