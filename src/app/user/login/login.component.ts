import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    showAlert=false
    alertMsg='Please wait! Checking you account to login.'
   alertColor='blue'
   insubmission=false

  credentials={
    email:'',
    password:''
  }
  constructor(private auth:AngularFireAuth) { }

  ngOnInit(): void {
  }
  async login(){
      this.showAlert=true
      this.alertMsg='Please wait! Checking you account to login.'
      this.alertColor='blue'
      this.insubmission=true
   try {
    
      await this.auth.signInWithEmailAndPassword(
       this.credentials.email,
       this.credentials.password
      
     )
   } catch (e) {
    this.alertMsg='An unxpected error occourred. Please try again later.'
    this.alertColor='red'
    this.insubmission=false
    return
   }
   this.alertMsg='Success! You are now logged in.'
   this.alertColor='green'
  }
}
