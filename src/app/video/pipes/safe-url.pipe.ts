import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeURL'
})
export class SafeURLPipe implements PipeTransform {


  constructor(private sanatizer:DomSanitizer){

  }
  transform(value: string) {
    return this.sanatizer.bypassSecurityTrustUrl(value);
  }

}
