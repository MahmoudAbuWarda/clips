import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import {map,delay,filter,switchMap} from 'rxjs/operators';
import { ActivatedRoute, Router,NavigationEnd } from '@angular/router';

import IUser from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection:AngularFirestoreCollection<IUser>
  public isAuthinticated$:Observable<boolean>
  public isAuthinticatedWithDelay$:Observable<boolean>
  private redirect=false
  
  constructor(
    private db:AngularFirestore,
    private auth:AngularFireAuth,
    private router:Router,
    private route:ActivatedRoute
    ) { 
      this.usersCollection=db.collection('users')
      this.isAuthinticated$=auth.user.pipe(
        map(user => !!user)
      )
      this.isAuthinticatedWithDelay$= this.isAuthinticated$.pipe(
        delay(1000)
      )
      this.router.events.pipe(
        filter(e=> e instanceof NavigationEnd),
        map(e=>this.route.firstChild),
        switchMap(route=> route?.data ?? of({}))
      ).subscribe(data=>{
        this.redirect=data.authOnly ?? false
      
      })
    }

  public async createUser(userData:IUser){
    if(!userData.password){
      throw new Error("Password not provided!")
    }
    const userCred= await this.auth.createUserWithEmailAndPassword(
      userData.email,userData.password
    )
    if(!userCred.user){
      throw new Error ("User can't be found")
    }
    await this.usersCollection.doc(userCred.user.uid).set({
      name:userData.name,
      email:userData.email,
      age:userData.age,
      phoneNumber:userData.phoneNumber
    })
    await userCred.user.updateProfile({
      displayName:userData.name
    })
  }
  public async logout($event?:Event){
    if($event){
      $event.preventDefault()
    }
    
     await this.auth.signOut()
     if(this.redirect){
       await this.router.navigateByUrl('/')
     }
    
}
}