import { Component, Input, OnInit,ElementRef,OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
 // providers:[ModalService]
})
export class ModalComponent implements OnInit,OnDestroy {
  @Input() modalID=''
  constructor(public modal:ModalService, public elementRef:ElementRef) { 
    
  }
  ngOnDestroy(): void {
   document.body.removeChild(this.elementRef.nativeElement)
  }

  ngOnInit(): void {
    document.body.appendChild(this.elementRef.nativeElement)
  }
 closeModal(){
   this.modal.toggleModal(this.modalID)
 }
}
