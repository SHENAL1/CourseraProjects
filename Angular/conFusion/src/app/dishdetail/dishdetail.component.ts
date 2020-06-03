import { Component, OnInit,ViewChild} from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { from } from 'rxjs';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;  

    feedbackForm: FormGroup;
    comment: Comment;
    @ViewChild('fform') feedbackFormDirective;

    myDate = new Date();

    formErrors = {
      'author': '',
      'comment': ''
    };

    validationMessages = {
      'author':{
        'required':      'First Name is required.',
        'minlength':     'First Name must be at least 2 characters long.',
        'maxlength':     'FirstName cannot be more than 25 characters long.'
      },
      'comment':{
        'required':      'First Name is required.',
        'minlength':     'First Name must be at least 2 characters long.'
      }
    };

//   comments =this.dish.comments;
  
  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) { 
      this.createForm();
    }

  ngOnInit() { 
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

   //Slider
   rating(value: number) {
   
    return value;
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  createForm() : void{
    this.feedbackForm=this.fb.group({
      rating:5,
      comment:['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      date:this.myDate.toISOString()
      
      //date: this.myDate.toISOString(),
    })
    
    this.feedbackForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.feedbackForm.value;
    this.dish.comments.push(this.comment);

    console.log(this.comment);
    this.feedbackForm.reset({
      rating:'',
      comment: '',
      author: '',
      date:''
    });
    this.feedbackFormDirective.resetForm(); 
  }

  // To go back to the menu component
  goBack(): void{
    this.location.back();
  }

}
