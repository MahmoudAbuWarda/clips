import { Component, OnDestroy } from '@angular/core';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { AngularFireStorage,AngularFireUploadTask } from '@angular/fire/compat/storage';
import {v4 as uuid} from 'uuid';
import { switchMap} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { async } from '@firebase/util';
import {combineLatest,forkJoin} from 'rxjs'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
    isDragOver=false
    nextStep=false
    showAlert=false
    showPercentage=false
    alertColor='blue'
    alertMsg="Please wait! Your clip is being uploaded!"
    inSubmetion=false
    percantage=0
    isFileLarge=false
    file:File|null=null
    user: firebase.User | null=null
    task?:AngularFireUploadTask
    screenshots:string[]=[]
    selectedScreenshot=''
    screenshotTask?:AngularFireUploadTask

    title:FormControl=new FormControl('',[
      Validators.required,
      Validators.minLength(3),
      
    ])
    uploadForm= new FormGroup({
      title:this.title,
     
    })
  constructor(
    private storage:AngularFireStorage,
    private auth:AngularFireAuth,
    private clipsService:ClipService,
    private router:Router,
    public ffmpegService:FfmpegService
    ) {
      auth.user.subscribe(user=>{
        this.user=user
      })
      ffmpegService.init()
     }

  ngOnDestroy(): void {
    this.task?.cancel()
    
  }
  async storeFile(event:Event){
    this.isFileLarge=false
    
    if(this.ffmpegService.isRunning){
      return
    }
    this.isDragOver=false
    this.file=(event as DragEvent).dataTransfer? 
    (event as DragEvent).dataTransfer?.files.item(0) ?? null:
    (event.target as HTMLInputElement).files?.item(0) ?? null
    if(!this.file||this.file.type!== 'video/mp4'){
      return
    }
    const fileSize=(this.file.size/1024)/1024
    
    if(fileSize>25){
      this.isFileLarge=true
      this.ffmpegService.isRunning=false
      return
      
    }
    

     this.screenshots= await this.ffmpegService.getScreenshots(this.file)
      this.selectedScreenshot=this.screenshots[0]
     
     
    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/,'')
    )
    this.nextStep=true 
    
  }
  async uploadFile(){
    this.uploadForm.disable()
    this.showAlert=true
    this.alertColor='blue'
    this.alertMsg="Please wait! Your clip is being uploaded!"
    this.inSubmetion=true
    this.showPercentage=true

    const clipFileName=uuid()
    const clipPath=`clips/${clipFileName}.mp4`
    const screenshotBlob=await this.ffmpegService.blobFromURL(this.selectedScreenshot)
    const screenshotPath=`screenshots/${clipFileName}.png`
    
        this.screenshotTask= this.storage.upload(screenshotPath,screenshotBlob)
    const screenshotRef=this.storage.ref(screenshotPath)
    this.task = this.storage.upload(clipPath,this.file)
    const clipRef=this.storage.ref(clipPath)



    combineLatest([this.task.percentageChanges(),this.screenshotTask.percentageChanges()]).subscribe((progress)=>{
      const [clipProgress,screenshotProgress]=progress
      if( !clipProgress  || !screenshotProgress ){
        return
      }
     // const total=(clipProgress+screenshotProgress)/2
      this.percantage=clipProgress as number / 100
    })
    forkJoin([this.task.snapshotChanges(),this.screenshotTask.snapshotChanges()]).pipe(
      
      switchMap(()=> forkJoin([clipRef.getDownloadURL(),screenshotRef.getDownloadURL()]))
    ).subscribe({
      next:async (urls)=>{
          const [clipUrl,screenshotUrl]=urls
          const clip={
              uid:this.user?.uid as string,
              displayName:this.user?.displayName as string,
              title:this.title.value,
              fileName:`${clipFileName}.mp4`,
              url:clipUrl,
              screenshotURL:screenshotUrl,
              screenshotFileName:`${clipFileName}.png`,
              timeStamp:firebase.firestore.FieldValue.serverTimestamp()
          }
          const clipDocRef= await this.clipsService.createClip(clip)
          

          this.alertColor='green'
          this.alertMsg='Success! Your clip now ready to share with the world.'
          this.showPercentage=false

          setTimeout(()=>{
            this.router.navigate([
              'clip',clipDocRef.id
            ])
          },1000)
      },
      error:(error)=>{
        this.uploadForm.enable()
          this.alertColor='red'
          this.alertMsg='Upload failed! Please try again later.'
          this.inSubmetion=false
          this.showPercentage=false
          console.error(error);
          
      }
      
    })
  }

}
