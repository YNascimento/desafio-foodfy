const Validate = {
    apply(input,func){
        Validate.clearError(input)

        results = Validate[func](input.value)
        input.value = results.value

        if(results.error) Validate.displayError(input,results.error)
    },
    displayError(input,error){
        input.classList.add('error')
        input.focus()
    },
    clearError(input){
        input.classList.remove('error')
    },
    isEmail(value){
        let error = false
        
        // ^ = começo, \w = texto sem caracter especial, \w+ = 1 ou mais do tipo w
        //. tem um valor específico, por \. faz aceitar "." no texto. Ex: ab.c, ? = facultativo
        // * = nenhum ou mais (0 OR >0), $ significa q acaba ali
        const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?w+)*(\.\w{2,3})+$/

        if(!value.match(emailFormat)) error = true

        return {error,value}
    }
}