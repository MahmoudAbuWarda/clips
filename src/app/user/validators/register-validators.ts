import { ValidationErrors,AbstractControl,ValidatorFn } from "@angular/forms";

export class RegisterValidators {
    static match(controlName:string,matchingControlNae:string):ValidatorFn{
        return (group:AbstractControl):ValidationErrors|null=>{
              const control=group.get(controlName)
        const matchingControl=group.get(matchingControlNae)

        if(!control||!matchingControl){
            console.error("Form group cant be found in the Form group.")
            return {
                ControlNotFound:false
            }
        }
        const error=control.value===matchingControl.value?null:{noMatch:true}

        matchingControl.setErrors(error)
        return error
        }
      
    }
}
