import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { visibility, flyInOut, expand } from '../animations/app.animation';
import { from } from 'rxjs';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand()
    ]

})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    errMess:string;
    dishIds: string[];
    prev: string;
    next: string;  

    commentForm: FormGroup;
    comment: Comment;
    @ViewChild('fform') commentFormDirective;

    dishcopy:Dish;
    visibility = 'shown';

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
        'required':      'Comment is required.',
        'minlength':     'Comment must be at least 2 characters long.'
      }
    };

//   comments =this.dish.comments;
  
  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
     
    }

  ngOnInit() { 
    this.createForm();

    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
    .pipe(switchMap((params: Params) =>{ 
      this.visibility ='hidden'; return this.dishService.getDish(params['id']);
    }))
    .subscribe(dish => { 
      this.dish = dish; this.dishcopy =dish; this.setPrevNext(dish.id); this.visibility ='shown';
    },
    errmess => this.errMess = <any>errmess);
  }

   //Slider
   formatLabel(value: number) {
   
    return value;
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  createForm() : void{
    this.commentForm=this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating:[5],
      comment:['', [Validators.required, Validators.minLength(2)]],
      date:''
      
      //date: this.myDate.toISOString(),
    })
    
    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
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
    this.comment = this.commentForm.value;

    const date = new  Date();
    this.comment.date = date.toISOString();
    
    this.dishcopy.comments.push(this.comment);
    
    this.dishService.putDish(this.dishcopy)
    .subscribe(dish =>{
      this.dish=this.dish; this.dishcopy = dish;
    },
    errmess => {this.dish = null; this.dishcopy =<any>errmess});

    console.log(this.comment);
    this.commentForm.reset({
      author: '',
      comment: '',
      date:''
    });
    this.commentFormDirective.resetForm({rating:5}); 
  }

  // To go back to the menu component
  goBack(): void{
    this.location.back();
  }

}
