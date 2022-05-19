import { Component, OnInit,OnDestroy , Input } from '@angular/core';
import { ClipService } from '../services/clip.service';
import { DatePipe } from '@angular/common';
import { FbTimeStampPipe } from '../pipes/fb-time-stamp.pipe';


@Component({
  selector: 'app-clip-list',
  templateUrl: './clip-list.component.html',
  styleUrls: ['./clip-list.component.css'],
  providers: [DatePipe]
})
export class ClipListComponent implements OnInit,OnDestroy {
  @Input() scrolable=true
  constructor(
    public clipService:ClipService
    ) { 
    this.clipService.getClips()
  }

  ngOnInit(): void {
    if(this.scrolable){
    window.addEventListener('scroll',this.hadleScroll)
    }
    
  }
  ngOnDestroy(): void {
    if(this.scrolable){
    window.removeEventListener('scroll',this.hadleScroll)
    }

    this.clipService.pageClips=[]
  }
  hadleScroll =()=>{
    const {scrollTop,offsetHeight}=document.documentElement
    const {innerHeight}=window

    const bottomOFWindow = Math.round(scrollTop) + innerHeight === offsetHeight
    if(bottomOFWindow){
      console.log(this.clipService.getClips());
      
      this.clipService.getClips()
      
    }
  }
  
}
