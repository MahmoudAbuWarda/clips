import { Component, OnInit,OnDestroy,Input,OnChanges, Output,EventEmitter} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import IClip from 'src/app/models/clip.model';
import {FormControl,FormGroup,Validators} from '@angular/forms'
import { ClipService } from 'src/app/services/clip.service';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit,OnDestroy,OnChanges {
  @Input() activeClip:IClip|null=null
  showAlert=false
  alertColor='blue'
  alertMsg="Please wait! Updating clip."
  inSubmetion=false

  @Output() update=new EventEmitter()

  clipID= new FormControl('')
  title:FormControl=new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ])
  editForm= new FormGroup({
    title:this.title,
    id:this.clipID
  })

  constructor(
    private modal:ModalService,
    private clipService:ClipService
    ) { }
  

  ngOnInit(): void {
    this.modal.register('editClip')
  }
  ngOnDestroy(): void {
    this.modal.unregister('editClip')
    }

    ngOnChanges(): void {
      if(!this.activeClip){
        return
        console.log("error");
        
      }
      this.inSubmetion=false
      this.showAlert=false
      this.clipID.setValue(this.activeClip.docID)
      this.title.setValue(this.activeClip.title)

    
      
    }
    async submit(){
      if(!this.activeClip){
        return
      }
      this.showAlert=true
      this.alertColor='blue'
      this.alertMsg="Please wait! Updating clip."
      this.inSubmetion=true

      try{
        await this.clipService.updateClip(this.clipID.value,this.title.value)
      }catch(e){
        this.alertColor='red'
        this.alertMsg="Something went wrong! Try again later."
        this.inSubmetion=false
        return
      }

      this.activeClip.title=this.title.value
      this.update.emit(this.activeClip)

     this.inSubmetion=false
     this.alertColor='green'
     this.alertMsg="Success!"
    }
}
